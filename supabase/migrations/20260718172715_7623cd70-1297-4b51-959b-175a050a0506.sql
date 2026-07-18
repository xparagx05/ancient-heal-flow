
-- Move has_role helper into a private schema (not exposed via the Data API)
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
-- Private schema is NOT exposed via PostgREST, so this function is not callable by API clients.
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Recreate policies to point at private.has_role
-- user_roles
DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins insert roles" ON public.user_roles;
CREATE POLICY "Admins insert roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;
CREATE POLICY "Admins delete roles" ON public.user_roles FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- doctor_applications
DROP POLICY IF EXISTS "Admins read all applications" ON public.doctor_applications;
CREATE POLICY "Admins read all applications" ON public.doctor_applications FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update all applications" ON public.doctor_applications;
CREATE POLICY "Admins update all applications" ON public.doctor_applications FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- doctors
DROP POLICY IF EXISTS "Admins manage doctors" ON public.doctors;
CREATE POLICY "Admins manage doctors" ON public.doctors FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- consultation_notes
DROP POLICY IF EXISTS "Admin reads notes" ON public.consultation_notes;
CREATE POLICY "Admin reads notes" ON public.consultation_notes FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- admin_profiles
DROP POLICY IF EXISTS "Admins read admin_profiles" ON public.admin_profiles;
CREATE POLICY "Admins read admin_profiles" ON public.admin_profiles FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- appointments
DROP POLICY IF EXISTS "Admin reads all appointments" ON public.appointments;
CREATE POLICY "Admin reads all appointments" ON public.appointments FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin updates any appointment" ON public.appointments;
CREATE POLICY "Admin updates any appointment" ON public.appointments FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- prescriptions
DROP POLICY IF EXISTS "Admin reads all prescriptions" ON public.prescriptions;
CREATE POLICY "Admin reads all prescriptions" ON public.prescriptions FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- prescription_items
DROP POLICY IF EXISTS "Admin reads rx items" ON public.prescription_items;
CREATE POLICY "Admin reads rx items" ON public.prescription_items FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- appointment_feedback
DROP POLICY IF EXISTS "Admin reads feedback" ON public.appointment_feedback;
CREATE POLICY "Admin reads feedback" ON public.appointment_feedback FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- notifications
DROP POLICY IF EXISTS "Admin reads all notifications" ON public.notifications;
CREATE POLICY "Admin reads all notifications" ON public.notifications FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- consultation_summaries
DROP POLICY IF EXISTS "Admin views all summaries" ON public.consultation_summaries;
CREATE POLICY "Admin views all summaries" ON public.consultation_summaries FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- patient_reports
DROP POLICY IF EXISTS "Admin reads all reports" ON public.patient_reports;
CREATE POLICY "Admin reads all reports" ON public.patient_reports FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- site_content
DROP POLICY IF EXISTS "Admins can insert site content" ON public.site_content;
CREATE POLICY "Admins can insert site content" ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update site content" ON public.site_content;
CREATE POLICY "Admins can update site content" ON public.site_content FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete site content" ON public.site_content;
CREATE POLICY "Admins can delete site content" ON public.site_content FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- storage.objects policies
DROP POLICY IF EXISTS "Admins read all doctor docs" ON storage.objects;
CREATE POLICY "Admins read all doctor docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'doctor-documents' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin reads prescription files" ON storage.objects;
CREATE POLICY "Admin reads prescription files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'prescriptions' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "patient-reports admin read" ON storage.objects;
CREATE POLICY "patient-reports admin read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'patient-reports' AND private.has_role(auth.uid(), 'admin'));

-- Update trigger function that used public.has_role
CREATE OR REPLACE FUNCTION public.enforce_appointment_patient_immutability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN NEW;
  END IF;
  IF uid = NEW.doctor_user_id OR private.has_role(uid, 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.payment_id IS DISTINCT FROM OLD.payment_id
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.fee IS DISTINCT FROM OLD.fee THEN
    RAISE EXCEPTION 'Patients cannot modify appointment status, fee, or payment fields'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$function$;

-- Finally drop the public wrapper so it's no longer exposed via the Data API
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
