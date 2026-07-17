
-- 1. Extend appointments with video room metadata
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS room_name TEXT,
  ADD COLUMN IF NOT EXISTS room_expires_at TIMESTAMPTZ;

-- 2. Consultation summaries (permanent medical history)
CREATE TABLE IF NOT EXISTS public.consultation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  doctor_user_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  doctor_name TEXT,
  consultation_date TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER,
  diagnosis TEXT,
  medicines JSONB DEFAULT '[]'::jsonb,
  tests_recommended TEXT,
  advice TEXT,
  follow_up_date DATE,
  prescription_id UUID,
  pdf_path TEXT,
  fee INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_summaries TO authenticated;
GRANT ALL ON public.consultation_summaries TO service_role;

ALTER TABLE public.consultation_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient views own summaries"
  ON public.consultation_summaries FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctor views authored summaries"
  ON public.consultation_summaries FOR SELECT TO authenticated
  USING (auth.uid() = doctor_user_id);

CREATE POLICY "Admin views all summaries"
  ON public.consultation_summaries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctor manages own summaries"
  ON public.consultation_summaries FOR ALL TO authenticated
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE TRIGGER trg_consultation_summaries_updated_at
  BEFORE UPDATE ON public.consultation_summaries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Patient reports (files patients upload for consultations)
CREATE TABLE IF NOT EXISTS public.patient_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_reports TO authenticated;
GRANT ALL ON public.patient_reports TO service_role;

ALTER TABLE public.patient_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient manages own reports"
  ON public.patient_reports FOR ALL TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctor reads reports for their appointments"
  ON public.patient_reports FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = patient_reports.appointment_id
        AND a.doctor_user_id = auth.uid()
    )
  );

CREATE POLICY "Admin reads all reports"
  ON public.patient_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Auto-generate consultation summary when appointment completes
CREATE OR REPLACE FUNCTION public.create_consultation_summary()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_doc_name TEXT;
  v_rx RECORD;
  v_meds JSONB;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    SELECT full_name INTO v_doc_name FROM public.doctors WHERE id = NEW.doctor_id;

    SELECT p.id, p.diagnosis, p.advice, p.follow_up_date, p.pdf_path
      INTO v_rx
      FROM public.prescriptions p
      WHERE p.appointment_id = NEW.id
      LIMIT 1;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'medicine', medicine, 'dosage', dosage, 'frequency', frequency,
      'duration', duration, 'instructions', instructions
    ) ORDER BY order_index), '[]'::jsonb)
      INTO v_meds
      FROM public.prescription_items
      WHERE prescription_id = v_rx.id;

    INSERT INTO public.consultation_summaries (
      appointment_id, patient_id, doctor_user_id, doctor_id, doctor_name,
      consultation_date, duration_seconds, diagnosis, medicines, advice,
      follow_up_date, prescription_id, pdf_path, fee
    ) VALUES (
      NEW.id, NEW.patient_id, NEW.doctor_user_id, NEW.doctor_id, v_doc_name,
      COALESCE(NEW.started_at, NEW.scheduled_at),
      CASE WHEN NEW.started_at IS NOT NULL AND NEW.ended_at IS NOT NULL
           THEN EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INT
           ELSE NULL END,
      v_rx.diagnosis, COALESCE(v_meds, '[]'::jsonb), v_rx.advice,
      v_rx.follow_up_date, v_rx.id, v_rx.pdf_path, NEW.fee
    )
    ON CONFLICT (appointment_id) DO UPDATE SET
      diagnosis = EXCLUDED.diagnosis,
      medicines = EXCLUDED.medicines,
      advice = EXCLUDED.advice,
      follow_up_date = EXCLUDED.follow_up_date,
      prescription_id = EXCLUDED.prescription_id,
      pdf_path = EXCLUDED.pdf_path,
      duration_seconds = EXCLUDED.duration_seconds,
      updated_at = now();
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_appointment_completed_summary ON public.appointments;
CREATE TRIGGER trg_appointment_completed_summary
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.create_consultation_summary();

-- 5. Realtime publication (idempotent)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_summaries;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
