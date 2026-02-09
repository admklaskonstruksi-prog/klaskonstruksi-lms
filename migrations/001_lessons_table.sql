-- ===========================================
-- MIGRATION 001: Lessons Table
-- ===========================================
-- Jalankan script ini di Supabase SQL Editor
-- 
-- Perubahan:
-- 1. Drop tabel lessons lama (jika ada dari schema awal)
-- 2. Buat tabel lessons baru dengan struktur sederhana
-- 3. Tambahkan RLS policies
-- ===========================================

-- Step 1: Drop tabel lama jika ada (hati-hati, ini akan hapus data!)
-- Uncomment jika yakin ingin menghapus
-- DROP TABLE IF EXISTS lessons CASCADE;
-- DROP TABLE IF EXISTS levels CASCADE;

-- Step 2: Buat tabel lessons baru (langsung ke courses, tanpa levels)
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_id TEXT, -- Bunny Stream Video ID
  duration INTEGER DEFAULT 0, -- Duration in seconds
  position INTEGER DEFAULT 0 NOT NULL, -- Order of lesson in course
  is_preview BOOLEAN DEFAULT FALSE NOT NULL, -- Free preview lesson
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_position ON lessons(course_id, position);

-- Trigger untuk auto-update updated_at
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- RLS POLICIES untuk lessons
-- ===========================================

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies jika ada
DROP POLICY IF EXISTS "Public can view published lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can do everything with lessons" ON lessons;
DROP POLICY IF EXISTS "Anyone can view lessons of published courses" ON lessons;

-- 1. Public bisa lihat lessons dari published courses
CREATE POLICY "Anyone can view lessons of published courses"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id 
      AND courses.is_published = TRUE
    )
  );

-- 2. Authenticated users dengan role admin bisa CRUD semua lessons
-- Menggunakan check langsung ke auth.jwt() untuk menghindari recursion
CREATE POLICY "Admins can manage all lessons"
  ON lessons FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- ===========================================
-- Update tabel user_progress untuk reference lessons baru
-- ===========================================

-- Jika tabel user_progress sudah ada dan reference ke lessons lama,
-- kita perlu update. Untuk fresh install, skip bagian ini.

-- ALTER TABLE user_progress 
-- DROP CONSTRAINT IF EXISTS user_progress_lesson_id_fkey;

-- ALTER TABLE user_progress
-- ADD CONSTRAINT user_progress_lesson_id_fkey 
-- FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;

-- ===========================================
-- Optional: Remove video_url dari courses jika ada
-- ===========================================
-- ALTER TABLE courses DROP COLUMN IF EXISTS video_url;

-- ===========================================
-- Verifikasi
-- ===========================================
-- SELECT * FROM lessons LIMIT 5;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lessons';
