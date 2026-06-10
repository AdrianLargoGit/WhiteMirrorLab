-- Allow anonymous read of public profiles and photos (share pages /p/username)
GRANT SELECT ON public_profiles TO anon;

DROP POLICY IF EXISTS public_profiles_anon_select ON profiles;
CREATE POLICY public_profiles_anon_select
  ON profiles FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS photos_anon_select ON photos;
CREATE POLICY photos_anon_select
  ON photos FOR SELECT TO anon
  USING (true);
