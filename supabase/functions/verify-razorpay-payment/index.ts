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
    // ---- Optional auth: guests can verify their own signature for subscription
    // checkouts; appointment-linked verification below still requires a user. ----
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    let userId: string | null = null;
    if (token) {
      const supaAuth = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
      );
      const { data: userData } = await supaAuth.auth.getUser(token);
      if (userData?.user) userId = userData.user.id;
    }

    // ---- Strict input validation ----
    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointment_id } = body ?? {};
    const isId = (v: unknown) =>
      typeof v === 'string' && v.length > 0 && v.length <= 100 && /^[A-Za-z0-9_]+$/.test(v);
    const isHex = (v: unknown) =>
      typeof v === 'string' && v.length === 64 && /^[a-f0-9]+$/i.test(v);
    const isUuid = (v: unknown) =>
      typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

    if (!isId(razorpay_order_id) || !isId(razorpay_payment_id) || !isHex(razorpay_signature)) {
      return json({ verified: false, error: 'Invalid payload' }, 400);
    }
    if (appointment_id !== undefined && appointment_id !== null && !isUuid(appointment_id)) {
      return json({ verified: false, error: 'Invalid appointment_id' }, 400);
    }

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!keySecret) return json({ verified: false, error: 'Not configured' }, 500);

    const expected = createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Constant-time comparison
    const sig = razorpay_signature as string;
    let verified = expected.length === sig.length;
    let diff = 0;
    const len = Math.max(expected.length, sig.length);
    for (let i = 0; i < len; i++) {
      diff |= (expected.charCodeAt(i) || 0) ^ (sig.charCodeAt(i) || 0);
    }
    verified = verified && diff === 0;

    if (!verified) return json({ verified: false, error: 'Invalid signature' }, 400);

    // ---- Server-side appointment confirmation (service role) ----
    if (appointment_id) {
      const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      );

      const { data: appt, error: apptErr } = await admin
        .from('appointments')
        .select('id, patient_id, doctor_id, fee, status, payment_status')
        .eq('id', appointment_id)
        .maybeSingle();

      if (apptErr || !appt) {
        console.error('[verify-razorpay-payment] appointment lookup failed', apptErr);
        return json({ verified: true, updated: false, error: 'Appointment not found' }, 404);
      }
      if (appt.patient_id !== userId) {
        return json({ verified: true, updated: false, error: 'Forbidden' }, 403);
      }

      // Validate fee against the doctor's real consultation fee
      const { data: doc } = await admin
        .from('doctors')
        .select('consultation_fee')
        .eq('id', appt.doctor_id)
        .maybeSingle();
      const expectedFee = Number(doc?.consultation_fee ?? 0);
      const apptFee = Number(appt.fee ?? 0);
      if (expectedFee > 0 && apptFee < expectedFee) {
        console.warn('[verify-razorpay-payment] fee mismatch', { expectedFee, apptFee });
        return json({ verified: true, updated: false, error: 'Fee mismatch' }, 400);
      }

      const { error: updErr } = await admin
        .from('appointments')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          payment_id: razorpay_payment_id,
          fee: expectedFee > 0 ? expectedFee : apptFee,
        })
        .eq('id', appointment_id);

      if (updErr) {
        console.error('[verify-razorpay-payment] appointment update failed', updErr);
        return json({ verified: true, updated: false, error: 'Update failed' }, 500);
      }
      return json({ verified: true, updated: true }, 200);
    }

    return json({ verified: true }, 200);
  } catch (e) {
    console.error('[verify-razorpay-payment]', e);
    return json({ verified: false, error: 'Verification failed' }, 500);
  }
});
