CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS books_title_trgm_gin_idx
ON books USING GIN (title gin_trgm_ops);
