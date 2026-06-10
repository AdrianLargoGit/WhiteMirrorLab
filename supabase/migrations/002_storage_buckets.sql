-- Storage buckets for WML 1.0
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Photos: authenticated users can read all, upload to own folder
CREATE POLICY "photos_public_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "photos_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "photos_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Stories: same pattern
CREATE POLICY "stories_public_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'stories');

CREATE POLICY "stories_upload_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'stories'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "stories_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'stories'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
