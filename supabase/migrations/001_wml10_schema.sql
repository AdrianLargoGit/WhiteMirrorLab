-- WML 1.0 — Karma Score experiment schema
-- Run this in your Supabase SQL editor if migrations are not auto-applied.

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  karma_score INTEGER NOT NULL DEFAULT 0,
  votes_received_positive INTEGER NOT NULL DEFAULT 0,
  votes_received_negative INTEGER NOT NULL DEFAULT 0,
  total_votes_given_positive INTEGER NOT NULL DEFAULT 0,
  total_votes_given_negative INTEGER NOT NULL DEFAULT 0,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_karma_idx ON profiles (karma_score DESC);

-- Public view: hides how many votes a user has GIVEN
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  username,
  display_name,
  karma_score,
  votes_received_positive,
  votes_received_negative,
  created_at,
  is_bot
FROM profiles;

GRANT SELECT ON public_profiles TO authenticated;

-- Username availability check (callable before signup, no auth required)
CREATE OR REPLACE FUNCTION check_username_available(p_username TEXT)
RETURNS BOOLEAN AS $$
  SELECT NOT EXISTS (SELECT 1 FROM profiles WHERE username = p_username);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION check_username_available(TEXT) TO anon, authenticated;

-- Photos (max 5 per user, FIFO enforced by trigger)
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS photos_user_created_idx ON photos (user_id, created_at ASC);

-- Stories (24h expiry)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS stories_expires_idx ON stories (expires_at);
CREATE INDEX IF NOT EXISTS stories_user_idx ON stories (user_id);

-- Anonymous votes (voter_id stored but never exposed to other users)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_positive BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (voter_id, target_id),
  CHECK (voter_id <> target_id)
);

CREATE INDEX IF NOT EXISTS votes_target_idx ON votes (target_id);

-- Trigger: enforce max 5 photos (delete oldest)
CREATE OR REPLACE FUNCTION enforce_photo_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM photos WHERE user_id = NEW.user_id) >= 5 THEN
    DELETE FROM photos WHERE id = (
      SELECT id FROM photos
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS photo_limit_trigger ON photos;
CREATE TRIGGER photo_limit_trigger
  BEFORE INSERT ON photos
  FOR EACH ROW
  EXECUTE FUNCTION enforce_photo_limit();

-- Trigger: update karma on vote insert/update/delete
CREATE OR REPLACE FUNCTION update_karma_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_positive THEN
      UPDATE profiles SET
        votes_received_positive = votes_received_positive + 1,
        karma_score = karma_score + 1
      WHERE id = NEW.target_id;
      UPDATE profiles SET total_votes_given_positive = total_votes_given_positive + 1
      WHERE id = NEW.voter_id;
    ELSE
      UPDATE profiles SET
        votes_received_negative = votes_received_negative + 1,
        karma_score = karma_score - 1
      WHERE id = NEW.target_id;
      UPDATE profiles SET total_votes_given_negative = total_votes_given_negative + 1
      WHERE id = NEW.voter_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_positive AND NOT NEW.is_positive THEN
      UPDATE profiles SET
        votes_received_positive = votes_received_positive - 1,
        votes_received_negative = votes_received_negative + 1,
        karma_score = karma_score - 2
      WHERE id = NEW.target_id;
      UPDATE profiles SET
        total_votes_given_positive = total_votes_given_positive - 1,
        total_votes_given_negative = total_votes_given_negative + 1
      WHERE id = NEW.voter_id;
    ELSIF NOT OLD.is_positive AND NEW.is_positive THEN
      UPDATE profiles SET
        votes_received_positive = votes_received_positive + 1,
        votes_received_negative = votes_received_negative - 1,
        karma_score = karma_score + 2
      WHERE id = NEW.target_id;
      UPDATE profiles SET
        total_votes_given_positive = total_votes_given_positive + 1,
        total_votes_given_negative = total_votes_given_negative - 1
      WHERE id = NEW.voter_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_positive THEN
      UPDATE profiles SET
        votes_received_positive = votes_received_positive - 1,
        karma_score = karma_score - 1
      WHERE id = OLD.target_id;
      UPDATE profiles SET total_votes_given_positive = total_votes_given_positive - 1
      WHERE id = OLD.voter_id;
    ELSE
      UPDATE profiles SET
        votes_received_negative = votes_received_negative - 1,
        karma_score = karma_score + 1
      WHERE id = OLD.target_id;
      UPDATE profiles SET total_votes_given_negative = total_votes_given_negative - 1
      WHERE id = OLD.voter_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS karma_vote_trigger ON votes;
CREATE TRIGGER karma_vote_trigger
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_karma_on_vote();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone authenticated can read; owner can update display_name
CREATE POLICY profiles_select ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_insert ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Photos
CREATE POLICY photos_select ON photos FOR SELECT TO authenticated USING (true);
CREATE POLICY photos_insert ON photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY photos_delete ON photos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Stories
CREATE POLICY stories_select ON stories FOR SELECT TO authenticated
  USING (expires_at > now());
CREATE POLICY stories_insert ON stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY stories_delete ON stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Votes: insert own, read only own votes (anonymity)
CREATE POLICY votes_insert ON votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);
CREATE POLICY votes_select_own ON votes FOR SELECT TO authenticated USING (auth.uid() = voter_id);
CREATE POLICY votes_update_own ON votes FOR UPDATE TO authenticated USING (auth.uid() = voter_id);
CREATE POLICY votes_delete_own ON votes FOR DELETE TO authenticated USING (auth.uid() = voter_id);

-- Storage buckets (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('stories', 'stories', true);

-- Storage policies
-- CREATE POLICY "photos_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'photos');
-- CREATE POLICY "photos_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "stories_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'stories');
-- CREATE POLICY "stories_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'stories' AND auth.uid()::text = (storage.foldername(name))[1]);
