-- Allow anonymous read access to public profile photos used by /p/:username.
GRANT SELECT ON posts TO anon;

DROP POLICY IF EXISTS posts_anon_select ON posts;
CREATE POLICY posts_anon_select
  ON posts FOR SELECT TO anon
  USING (true);
