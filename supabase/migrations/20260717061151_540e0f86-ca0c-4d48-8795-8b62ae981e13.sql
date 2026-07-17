
-- Patients: full control over their own folder (path prefix = auth.uid())
CREATE POLICY "patient-reports patient rw"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'patient-reports' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'patient-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Doctors: read reports linked to an appointment assigned to them
CREATE POLICY "patient-reports doctor read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'patient-reports'
    AND EXISTS (
      SELECT 1 FROM public.patient_reports r
      JOIN public.appointments a ON a.id = r.appointment_id
      WHERE r.file_path = storage.objects.name
        AND a.doctor_user_id = auth.uid()
    )
  );

-- Admins: read everything
CREATE POLICY "patient-reports admin read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'patient-reports' AND public.has_role(auth.uid(), 'admin'));
