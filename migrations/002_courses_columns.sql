-- ===========================================
-- MIGRATION 002: Courses table - kolom yang dipakai app
-- ===========================================
-- Jalankan di Supabase: SQL Editor → New query → paste → Run
--
-- Memastikan tabel courses punya kolom:
-- - user_id (untuk "My Courses")
-- - is_published (untuk draft/publish)
-- - price (opsional)
-- - category, level (opsional, untuk filter/katalog nanti)
-- ===========================================

-- 1. user_id (wajib agar course masuk "My Courses")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE courses ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. is_published (checkbox "Langsung Publish?")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE courses ADD COLUMN is_published BOOLEAN DEFAULT FALSE NOT NULL;
  END IF;
END $$;

-- 3. price (untuk kursus berbayar/gratis)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'price'
  ) THEN
    ALTER TABLE courses ADD COLUMN price INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- 4. category (opsional - untuk filter/kategori kursus)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'category'
  ) THEN
    ALTER TABLE courses ADD COLUMN category TEXT;
  END IF;
END $$;

-- 5. level (opsional - level kursus umum)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'level'
  ) THEN
    ALTER TABLE courses ADD COLUMN level TEXT;
  END IF;
END $$;

-- Index untuk query "My Courses" (user_id)
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);

-- Verifikasi (opsional): lihat kolom tabel courses
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'courses'
-- ORDER BY ordinal_position;
