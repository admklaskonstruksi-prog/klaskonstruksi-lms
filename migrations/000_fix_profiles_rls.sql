-- ===========================================
-- FIX 000: Profiles RLS (Run this FIRST!)
-- ===========================================
-- Jalankan script ini PERTAMA untuk fix infinite recursion error
-- ===========================================

-- Hapus SEMUA policy lama pada profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users" ON profiles;

-- Buat policy baru yang SEDERHANA (tanpa recursion)

-- 1. User bisa lihat profil sendiri
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. User bisa update profil sendiri  
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. System bisa insert profil (untuk trigger auto-create)
CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Verifikasi policies
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
