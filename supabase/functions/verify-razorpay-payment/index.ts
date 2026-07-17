import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // ---- Require authenticated caller ----
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return json({ verified: false, error: 'Unauthorized' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ verified: false, error: 'Unauthorized' }, 401);

    // ---- Strict input validation ----
    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};
    const isId = (v: unknown) =>
      typeof v === 'string' && v.length > 0 && v.length <= 100 && /^[A-Za-z0-9_]+$/.test(v);
    const isHex = (v: unknown) =>
      typeof v === 'string' && v.length === 64 && /^[a-f0-9]+$/i.test(v);

    if (!isId(razorpay_order_id) || !isId(razorpay_payment_id) || !isHex(razorpay_signature)) {
      return json({ verified: false, error: 'Invalid payload' }, 400);
    }

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keySecret) return json({ verified: false, error: 'Not configured' }, 500);

    const expected = createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Constant-time comparison
    let verified = false;
    try {
      const a = Buffer.from(expected, 'hex');
      const b = Buffer.from(razorpay_signature as string, 'hex');
      verified = a.length === b.length && timingSafeEqual(a, b);
    } catch {
      verified = false;
    }

    return json({ verified }, verified ? 200 : 400);
  } catch (e) {
    console.error('[verify-razorpay-payment]', e);
    return json({ verified: false, error: 'Verification failed' }, 500);
  }
});
