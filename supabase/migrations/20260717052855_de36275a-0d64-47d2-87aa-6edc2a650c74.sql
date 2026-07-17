
-- ============= Professional & Admin IDs =============
CREATE SEQUENCE IF NOT EXISTS public.doctor_professional_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.admin_id_seq START 1;

ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS professional_id text UNIQUE;

CREATE OR REPLACE FUNCTION public.assign_doctor_professional_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.professional_id IS NULL THEN
    NEW.professional_id := 'DOC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.doctor_professional_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS t_doctors_professional_id ON public.doctors;
CREATE TRIGGER t_doctors_professional_id BEFORE INSERT ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.assign_doctor_professional_id();

-- Backfill existing
UPDATE public.doctors SET professional_id = 'DOC-' || to_char(created_at, 'YYYY') || '-' || lpad(nextval('public.doctor_professional_seq')::text, 4, '0')
WHERE professional_id IS NULL;

-- admin_profiles
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_profiles TO authenticated;
GRANT ALL ON public.admin_profiles TO service_role;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read admin_profiles" ON public.admin_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Self reads own admin_profile" ON public.admin_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.assign_admin_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.admin_id IS NULL THEN
    NEW.admin_id := 'ADM-' || lpad(nextval('public.admin_id_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS t_admin_profiles_id ON public.admin_profiles;
CREATE TRIGGER t_admin_profiles_id BEFORE INSERT ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_admin_id();

DROP TRIGGER IF EXISTS t_admin_profiles_updated ON public.admin_profiles;
CREATE TRIGGER t_admin_profiles_updated BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create admin_profile whenever a user gets an 'admin' role
CREATE OR REPLACE FUNCTION public.ensure_admin_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    INSERT INTO public.admin_profiles (user_id) VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS t_user_roles_admin_profile ON public.user_roles;
CREATE TRIGGER t_user_roles_admin_profile AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.ensure_admin_profile();

-- Backfill for existing admin users
INSERT INTO public.admin_profiles (user_id)
SELECT user_id FROM public.user_roles WHERE role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- ============= Appointments =============
DO $$ BEGIN
  CREATE TYPE public.appointment_status AS ENUM
    ('pending_payment','confirmed','in_progress','completed','cancelled','no_show');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.appointment_mode AS ENUM ('video','clinic');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  doctor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  scheduled_at timestamptz NOT NULL,
  duration_min integer NOT NULL DEFAULT 30,
  mode public.appointment_mode NOT NULL DEFAULT 'video',
  status public.appointment_status NOT NULL DEFAULT 'confirmed',
  fee integer NOT NULL DEFAULT 0,
  payment_id text,
  razorpay_order_id text,
  room_url text,
  patient_notes text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appts_patient ON public.appointments(patient_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_appts_doctor  ON public.appointments(doctor_user_id, scheduled_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient reads own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);
CREATE POLICY "Doctor reads own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (auth.uid() = doctor_user_id);
CREATE POLICY "Admin reads all appointments" ON public.appointments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Patient creates own appointment" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patient updates own appointment" ON public.appointments FOR UPDATE TO authenticated
  USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctor updates own appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Admin updates any appointment" ON public.appointments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS t_appointments_updated ON public.appointments;
CREATE TRIGGER t_appointments_updated BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= Prescriptions =============
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  diagnosis text,
  advice text,
  follow_up_date date,
  pdf_path text,
  issued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_appt ON public.prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient reads own prescriptions" ON public.prescriptions FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);
CREATE POLICY "Doctor manages own prescriptions" ON public.prescriptions FOR ALL TO authenticated
  USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Admin reads all prescriptions" ON public.prescriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS t_prescriptions_updated ON public.prescriptions;
CREATE TRIGGER t_prescriptions_updated BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.prescription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  medicine text NOT NULL,
  dosage text,
  frequency text,
  duration text,
  instructions text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pitems_rx ON public.prescription_items(prescription_id, order_index);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescription_items TO authenticated;
GRANT ALL ON public.prescription_items TO service_role;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient reads own rx items" ON public.prescription_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.patient_id = auth.uid()));
CREATE POLICY "Doctor manages own rx items" ON public.prescription_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.doctor_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.prescriptions p WHERE p.id = prescription_id AND p.doctor_user_id = auth.uid()));
CREATE POLICY "Admin reads rx items" ON public.prescription_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============= Consultation notes =============
CREATE TABLE IF NOT EXISTS public.consultation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  subjective text,
  objective text,
  assessment text,
  plan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_notes TO authenticated;
GRANT ALL ON public.consultation_notes TO service_role;
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor manages own notes" ON public.consultation_notes FOR ALL TO authenticated
  USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Admin reads notes" ON public.consultation_notes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS t_notes_updated ON public.consultation_notes;
CREATE TRIGGER t_notes_updated BEFORE UPDATE ON public.consultation_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============= Doctor availability =============
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_availability TO authenticated;
GRANT SELECT ON public.doctor_availability TO anon;
GRANT ALL ON public.doctor_availability TO service_role;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads availability" ON public.doctor_availability FOR SELECT USING (true);
CREATE POLICY "Doctor manages own availability" ON public.doctor_availability FOR ALL TO authenticated
  USING (auth.uid() = doctor_user_id) WITH CHECK (auth.uid() = doctor_user_id);

-- ============= Appointment feedback =============
CREATE TABLE IF NOT EXISTS public.appointment_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.appointment_feedback TO authenticated;
GRANT ALL ON public.appointment_feedback TO service_role;
ALTER TABLE public.appointment_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient creates feedback" ON public.appointment_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patient reads own feedback" ON public.appointment_feedback FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);
CREATE POLICY "Doctor reads own feedback" ON public.appointment_feedback FOR SELECT TO authenticated
  USING (auth.uid() = doctor_user_id);
CREATE POLICY "Admin reads feedback" ON public.appointment_feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============= Resolver helpers (SECURITY DEFINER) =============
CREATE OR REPLACE FUNCTION public.resolve_doctor_email(_professional_id text)
RETURNS TABLE(email text, application_status doctor_app_status, is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.email::text,
         (SELECT status FROM public.doctor_applications WHERE user_id = d.user_id) AS application_status,
         d.is_active
  FROM public.doctors d
  JOIN auth.users u ON u.id = d.user_id
  WHERE d.professional_id = _professional_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.resolve_admin_email(_admin_id text)
RETURNS TABLE(email text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT u.email::text
  FROM public.admin_profiles a
  JOIN auth.users u ON u.id = a.user_id
  WHERE a.admin_id = _admin_id
    AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = a.user_id AND r.role = 'admin')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_doctor_email(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_admin_email(text) TO anon, authenticated;
