
-- Revoke EXECUTE from anon/authenticated on SECURITY DEFINER functions
-- that should only run server-side (edge functions with service_role) or
-- as trigger functions.

REVOKE EXECUTE ON FUNCTION public.resolve_doctor_email(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_admin_email(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_admin_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_appointment_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_prescription_ready() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_consultation_summary() FROM PUBLIC, anon, authenticated;

-- has_role() must remain callable by authenticated users because RLS
-- policies reference it. Keep EXECUTE for authenticated only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
