import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Sane bounds for a consultation booking (in rupees).
const MIN_AMOUNT_RUPEES = 1;
const MAX_AMOUNT_RUPEES = 100_000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // --- AuthN: require a valid JWT so anonymous callers can't spam order creation ---
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    if (!jwt) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // --- Input validation ---
    const body = await req.json().catch(() => ({}));
    const { amount, currency = 'INR', receipt, notes } = body ?? {};

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < MIN_AMOUNT_RUPEES || amount > MAX_AMOUNT_RUPEES) {
      return json({ error: 'Invalid amount' }, 400);
    }
    if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
      return json({ error: 'Invalid currency' }, 400);
    }
    if (receipt !== undefined && (typeof receipt !== 'string' || receipt.length > 40)) {
      return json({ error: 'Invalid receipt' }, 400);
    }
    if (notes !== undefined && (typeof notes !== 'object' || notes === null || Array.isArray(notes))) {
      return json({ error: 'Invalid notes' }, 400);
    }

    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keyId || !keySecret) {
      return json({ error: 'Razorpay not configured' }, 500);
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: { ...(notes || {}), user_id: userData.user.id },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      // Don't leak Razorpay internals to the client.
      console.error('[create-razorpay-order] Razorpay error', data);
      return json({ error: 'Could not create payment order' }, 502);
    }

    return json({ order: data, keyId });
  } catch (e) {
    console.error('[create-razorpay-order]', e);
    return json({ error: 'Unexpected error' }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
