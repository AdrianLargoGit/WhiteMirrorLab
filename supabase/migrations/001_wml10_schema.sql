-- WML 1.0 — Karma Score experiment schema
-- Run this in your Supabase SQL editor if migrations are not auto-applied.

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  country TEXT,
  preferred_language TEXT DEFAULT 'es',
  karma_score INTEGER NOT NULL DEFAULT 0,
  votes_received_positive INTEGER NOT NULL DEFAULT 0,
  votes_received_negative INTEGER NOT NULL DEFAULT 0,
  total_votes_given_positive INTEGER NOT NULL DEFAULT 0,
  total_votes_given_negative INTEGER NOT NULL DEFAULT 0,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  accepted_terms_version TEXT,
  accepted_at TIMESTAMPTZ,
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
  avatar_url,
  country,
  preferred_language,
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

-- Posts / Photos (max 5 per user, FIFO enforced by trigger)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_user_created_idx ON posts (user_id, created_at ASC);

-- Pulses (Text posts / Microblogging)
CREATE TABLE IF NOT EXISTS pulses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  reply_to_id UUID REFERENCES pulses(id) ON DELETE CASCADE,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pulses_user_idx ON pulses (user_id);
CREATE INDEX IF NOT EXISTS pulses_reply_to_idx ON pulses (reply_to_id);

-- Stories (24h expiry)
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS stories_expires_idx ON stories (expires_at);
CREATE INDEX IF NOT EXISTS stories_user_idx ON stories (user_id);

-- Behavioral Analytics
CREATE TABLE IF NOT EXISTS behavioral_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_hash_id TEXT NOT NULL,
  country TEXT,
  event_type TEXT NOT NULL,
  target_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  target_pulse_id UUID REFERENCES pulses(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MULTI-TARGET VOTES TABLE (Profiles, Pulses and Posts)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pulse_id UUID REFERENCES pulses(id) ON DELETE CASCADE,
  posts_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Evita que el mismo usuario vote dos veces al mismo contenido exacto
  UNIQUE (voter_id, receiver_id, pulse_id, posts_id),
  CHECK (voter_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS votes_receiver_idx ON votes (receiver_id);
CREATE INDEX IF NOT EXISTS votes_pulse_idx ON votes (pulse_id) WHERE pulse_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS votes_posts_idx ON votes (posts_id) WHERE posts_id IS NOT NULL;

-- Trigger: enforce max 5 posts (delete oldest)
CREATE OR REPLACE FUNCTION enforce_post_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM posts WHERE user_id = NEW.user_id) >= 5 THEN
    DELETE FROM posts WHERE id = (
      SELECT id FROM posts
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS post_limit_trigger ON posts;
CREATE TRIGGER post_limit_trigger
  BEFORE INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION enforce_post_limit();

-- Trigger: update karma on vote insert/update/delete (Multi-target safe)
CREATE OR REPLACE FUNCTION update_karma_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 1 THEN
      UPDATE profiles SET
        votes_received_positive = votes_received_positive + 1,
        karma_score = karma_score + 1
      WHERE id = NEW.receiver_id;
      UPDATE profiles SET total_votes_given_positive = total_votes_given_positive + 1
      WHERE id = NEW.voter_id;
    ELSE
      UPDATE profiles SET
        votes_received_negative = votes_received_negative + 1,
        karma_score = karma_score - 1
      WHERE id = NEW.receiver_id;
      UPDATE profiles SET total_votes_given_negative = total_votes_given_negative + 1
      WHERE id = NEW.voter_id;
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 1 AND NEW.vote_type = -1 THEN
      UPDATE profiles SET
        votes_received_positive = votes_received_positive - 1,
        votes_received_negative = votes_received_negative + 1,
        karma_score = karma_score - 2
      WHERE id = NEW.receiver_id;
      UPDATE profiles SET
        total_votes_given_positive = total_votes_given_positive - 1,
        total_votes_given_negative = total_votes_given_negative + 1
      WHERE id = NEW.voter_id;
    ELSIF OLD.vote_type = -1 AND NEW.vote_type = 1 THEN
      UPDATE profiles SET
        votes_received_positive = votes_received_positive + 1,
        votes_received_negative = votes_received_negative - 1,
        karma_score = karma_score + 2
      WHERE id = NEW.receiver_id;
      UPDATE profiles SET
        total_votes_given_positive = total_votes_given_positive + 1,
        total_votes_given_negative = total_votes_given_negative - 1
      WHERE id = NEW.voter_id;
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 1 THEN
      UPDATE profiles SET
        votes_received_positive = votes_received_positive - 1,
        karma_score = karma_score - 1
      WHERE id = OLD.receiver_id;
      UPDATE profiles SET total_votes_given_positive = total_votes_given_positive - 1
      WHERE id = OLD.voter_id;
    ELSE
      UPDATE profiles SET
        votes_received_negative = votes_received_negative - 1,
        karma_score = karma_score + 1
      WHERE id = OLD.receiver_id;
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
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY profiles_select ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_insert ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Posts Policies
CREATE POLICY posts_select ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY posts_insert ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY posts_delete ON posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Pulses Policies
CREATE POLICY pulses_select ON pulses FOR SELECT TO authenticated USING (true);
CREATE POLICY pulses_insert ON pulses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY pulses_delete ON pulses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Stories Policies
CREATE POLICY stories_select ON stories FOR SELECT TO authenticated USING (expires_at > now());
CREATE POLICY stories_insert ON stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY stories_delete ON stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Votes Policies
CREATE POLICY votes_insert ON votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);
CREATE POLICY votes_select_own ON votes FOR SELECT TO authenticated USING (auth.uid() = voter_id);
CREATE POLICY votes_update_own ON votes FOR UPDATE TO authenticated USING (auth.uid() = voter_id);
CREATE POLICY votes_delete_own ON votes FOR DELETE TO authenticated USING (auth.uid() = voter_id);

-- Analytics Policies
CREATE POLICY analytics_insert ON behavioral_analytics FOR INSERT TO authenticated WITH CHECK (true);