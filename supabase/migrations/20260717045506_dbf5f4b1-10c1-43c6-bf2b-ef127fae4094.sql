
create policy "Doctors upload own docs" on storage.objects for insert to authenticated
  with check (bucket_id = 'doctor-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Doctors read own docs" on storage.objects for select to authenticated
  using (bucket_id = 'doctor-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Doctors update own docs" on storage.objects for update to authenticated
  using (bucket_id = 'doctor-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Admins read all doctor docs" on storage.objects for select to authenticated
  using (bucket_id = 'doctor-documents' and public.has_role(auth.uid(), 'admin'));
