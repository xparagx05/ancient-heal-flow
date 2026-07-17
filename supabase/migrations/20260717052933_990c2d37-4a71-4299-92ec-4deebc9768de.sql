
CREATE POLICY "Doctor manages own prescription files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'prescriptions' AND (auth.uid()::text = (storage.foldername(name))[1]))
  WITH CHECK (bucket_id = 'prescriptions' AND (auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Patient reads own prescription files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'prescriptions'
    AND EXISTS (
      SELECT 1 FROM public.prescriptions p
      WHERE p.pdf_path = name AND p.patient_id = auth.uid()
    )
  );

CREATE POLICY "Admin reads prescription files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'prescriptions' AND public.has_role(auth.uid(), 'admin'));
