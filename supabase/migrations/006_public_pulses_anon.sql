-- Allow anonymous read access to public profile pulses used by /p/:username.
CREATE OR REPLACE VIEW public_pulses AS
SELECT
  id,
  user_id,
  body,
  reply_to_id,
  reply_count,
  created_at
FROM pulses;

GRANT SELECT ON public_pulses TO anon, authenticated;
GRANT SELECT ON pulses TO anon;

DROP POLICY IF EXISTS pulses_anon_select ON pulses;
CREATE POLICY pulses_anon_select
  ON pulses FOR SELECT TO anon
  USING (true);
