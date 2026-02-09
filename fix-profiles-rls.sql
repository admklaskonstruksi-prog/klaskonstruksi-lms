-- ===========================================
-- FIX: Profiles RLS Policy
-- ===========================================
-- Jalankan script ini di Supabase SQL Editor
-- untuk memperbaiki policy yang terlalu ketat

-- Hapus policy lama yang bermasalah
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Buat policy baru yang lebih sederhana

-- 1. Semua authenticated user bisa lihat profil sendiri
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

-- 3. Admin bisa lihat semua profil (menggunakan service role untuk query admin)
-- Untuk sementara, biarkan admin juga pakai policy "view own profile"
-- Nanti bisa ditambahkan policy khusus admin jika diperlukan

-- Verifikasi: Cek apakah profile sudah ada
-- SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';

-- Jika profile belum ada, insert manual:
-- INSERT INTO profiles (id, full_name, role) 
-- VALUES ('YOUR_USER_ID', 'Askara', 'admin');
