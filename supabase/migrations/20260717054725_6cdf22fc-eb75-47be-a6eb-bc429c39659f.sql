
-- Notifications table for realtime cross-role messages
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(recipient_user_id) WHERE read_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recipients read/update/delete their own notifications
CREATE POLICY "Recipient reads own" ON public.notifications
  FOR SELECT USING (auth.uid() = recipient_user_id);
CREATE POLICY "Recipient updates own" ON public.notifications
  FOR UPDATE USING (auth.uid() = recipient_user_id) WITH CHECK (auth.uid() = recipient_user_id);
CREATE POLICY "Recipient deletes own" ON public.notifications
  FOR DELETE USING (auth.uid() = recipient_user_id);

-- Any authenticated user can create a notification (sender must be self or null); service role bypasses RLS for triggers.
CREATE POLICY "Authenticated inserts" ON public.notifications
  FOR INSERT WITH CHECK (
    sender_user_id IS NULL OR sender_user_id = auth.uid()
  );

-- Admins read all
CREATE POLICY "Admin reads all notifications" ON public.notifications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;

-- Trigger: appointment lifecycle notifications
CREATE OR REPLACE FUNCTION public.notify_appointment_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  patient_name TEXT;
  doctor_name TEXT;
BEGIN
  SELECT full_name INTO patient_name FROM public.profiles WHERE user_id = NEW.patient_id;
  SELECT full_name INTO doctor_name FROM public.doctors WHERE id = NEW.doctor_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify doctor of a new appointment
    INSERT INTO public.notifications (recipient_user_id, type, title, body, link, meta)
    VALUES (
      NEW.doctor_user_id,
      'appointment.new',
      '🩺 New appointment request',
      COALESCE(patient_name, 'A patient') || ' booked ' || to_char(NEW.scheduled_at, 'Mon DD, HH24:MI'),
      '/doctor/appointments',
      jsonb_build_object('appointment_id', NEW.id)
    );
    -- Confirm to patient
    INSERT INTO public.notifications (recipient_user_id, type, title, body, link, meta)
    VALUES (
      NEW.patient_id,
      'appointment.booked',
      '✅ Booking received',
      'Your appointment with ' || COALESCE(doctor_name, 'the doctor') || ' is being reviewed.',
      '/dashboard',
      jsonb_build_object('appointment_id', NEW.id)
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'confirmed' THEN
      INSERT INTO public.notifications (recipient_user_id, type, title, body, link, meta)
      VALUES (
        NEW.patient_id,
        'appointment.confirmed',
        '📹 Consultation confirmed',
        COALESCE(doctor_name, 'Your doctor') || ' confirmed your appointment for ' || to_char(NEW.scheduled_at, 'Mon DD, HH24:MI') || '.',
        '/dashboard',
        jsonb_build_object('appointment_id', NEW.id)
      );
    ELSIF NEW.status = 'cancelled' THEN
      -- Notify the other party
      INSERT INTO public.notifications (recipient_user_id, type, title, body, link, meta)
      VALUES (
        NEW.patient_id,
        'appointment.cancelled',
        '❌ Appointment cancelled',
        'Your appointment on ' || to_char(NEW.scheduled_at, 'Mon DD, HH24:MI') || ' was cancelled.',
        '/dashboard',
        jsonb_build_object('appointment_id', NEW.id)
      );
      INSERT INTO public.notifications (recipient_user_id, type, title, body, link, meta)
      VALUES (
        NEW.doctor_user_id,
        'appointment.cancelled',
        '❌ Appointment cancelled',
        'Appointment with ' || COALESCE(patient_name, 'patient') || ' on ' || to_char(NEW.scheduled_at, 'Mon DD, HH24:MI') || ' was cancelled.',
        '/doctor/appointments',
        jsonb_build_object('appointment_id', NEW.id)
      );
    ELSIF NEW.status = 'completed' THEN
      INSERT INTO public.notifications (recipient_user_id, type, title, body, link, meta)
      VALUES (
        NEW.patient_id,
        'appointment.completed',
        '⭐ Rate your consultation',
        'Your consultation with ' || COALESCE(doctor_name, 'the doctor') || ' is complete. Please share your feedback.',
        '/dashboard',
        jsonb_build_object('appointment_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_appointment_change ON public.appointments;
CREATE TRIGGER trg_notify_appointment_change
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.notify_appointment_change();

-- Trigger: prescription ready notification
CREATE OR REPLACE FUNCTION public.notify_prescription_ready()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.pdf_path IS NOT NULL AND (OLD.pdf_path IS NULL OR OLD.pdf_path IS DISTINCT FROM NEW.pdf_path) THEN
    INSERT INTO public.notifications (recipient_user_id, type, title, body, link, meta)
    VALUES (
      NEW.patient_id,
      'prescription.ready',
      '📄 Prescription ready',
      'Your prescription is available to download.',
      '/dashboard',
      jsonb_build_object('prescription_id', NEW.id, 'appointment_id', NEW.appointment_id)
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_prescription_ready ON public.prescriptions;
CREATE TRIGGER trg_notify_prescription_ready
AFTER INSERT OR UPDATE ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION public.notify_prescription_ready();
