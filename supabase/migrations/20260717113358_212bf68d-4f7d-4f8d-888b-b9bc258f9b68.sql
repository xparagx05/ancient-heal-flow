
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site content"
  ON public.site_content FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content"
  ON public.site_content FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_content (key, value) VALUES
  ('hero', '{"eyebrow":"Dhanvantara AI","headline":"Before AI Learned To Think, Ayurveda Learned To Heal","subhead":"An intelligent healthcare experience born from India'' s medical heritage.","primaryCta":"Book a consultation","secondaryCta":"Explore doctors"}'::jsonb),
  ('pricing', '{"note":"Simple, transparent pricing."}'::jsonb),
  ('founders', '{"note":"Meet the team behind Dhanvantara AI."}'::jsonb),
  ('footer', '{"email":"hello@dhanvantara.ai","phone":"+91 00000 00000","address":"India"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
