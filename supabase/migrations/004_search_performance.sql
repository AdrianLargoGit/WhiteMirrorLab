CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX profiles_trgm_idx ON profiles USING gin (username gin_trgm_ops, display_name gin_trgm_ops);