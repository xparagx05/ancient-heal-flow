
-- ============ Notifications: restrict cross-user inserts ============
DROP POLICY IF EXISTS "Authenticated inserts" ON public.notifications;

CREATE POLICY "Users insert own notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    recipient_user_id = auth.uid()
    AND (sender_user_id IS NULL OR sender_user_id = auth.uid())
  );

-- Trigger functions that generate cross-user notifications are SECURITY DEFINER
-- and bypass RLS, so system alerts continue to work.


-- ============ Appointments: prevent patient from altering money fields ============
CREATE OR REPLACE FUNCTION public.enforce_appointment_patient_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  -- service_role / trigger context has no auth.uid() -> always allowed
  IF uid IS NULL THEN
    RETURN NEW;
  END IF;

  -- Doctor of the appointment and admins may change these fields
  IF uid = NEW.doctor_user_id OR public.has_role(uid, 'admin') THEN
    RETURN NEW;
  END IF;

  -- Anyone else (i.e. the patient) may NOT change money / status columns
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.payment_id IS DISTINCT FROM OLD.payment_id
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.fee IS DISTINCT FROM OLD.fee THEN
    RAISE EXCEPTION 'Patients cannot modify appointment status, fee, or payment fields'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_appointment_patient_immutability() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS t_appointments_patient_immutability ON public.appointments;
CREATE TRIGGER t_appointments_patient_immutability
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_appointment_patient_immutability();
