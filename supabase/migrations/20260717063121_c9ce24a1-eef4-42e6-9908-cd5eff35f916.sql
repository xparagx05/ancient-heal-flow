-- Trigger-only SECURITY DEFINER helpers: revoke from anon and authenticated.
-- They are still invoked by their triggers (which run with definer privileges).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_appointment_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_prescription_ready() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_consultation_summary() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_admin_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_doctor_professional_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_admin_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Email resolvers: keep callable by signed-in users (used by portal login flows),
-- but revoke from anon so unauthenticated visitors can't enumerate emails.
REVOKE EXECUTE ON FUNCTION public.resolve_doctor_email(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.resolve_doctor_email(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.resolve_admin_email(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.resolve_admin_email(text) TO authenticated;

-- has_role is intentionally left executable to anon + authenticated because
-- RLS policies across the schema invoke it during permission checks.