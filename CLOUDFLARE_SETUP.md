# Pengaturan Deploy Cloudflare Pages

Agar situs tidak tampil hitam/kosong dan bisa terhubung ke Supabase, **wajib** set variabel lingkungan di Cloudflare.

## 1. Environment variables (wajib)

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → project **klaskonstruksi-lms**.
2. Tab **Settings** → **Environment variables**.
3. Tambahkan untuk **Production** (dan **Preview** jika dipakai):

| Nama | Nilai | Encrypt |
|------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase Anda (https://xxx.supabase.co) | Tidak |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key dari Supabase | Ya (disarankan) |

4. **Penting:** centang **Build** (atau set di "Build configuration") agar variabel ini dipakai saat **build**, bukan hanya saat runtime.  
   Di Next.js, `NEXT_PUBLIC_*` di-inline saat build; kalau tidak diset saat build, nilai akan kosong di browser.

## 2. Build configuration

- **Build command:** `npx @cloudflare/next-on-pages@1`
- **Build output directory:** (kosongkan; output dipakai otomatis oleh adapter)
- **Root directory:** (kosongkan jika repo root adalah project Next.js)

## 3. Setelah mengubah env

Setiap kali menambah/mengubah environment variables, lakukan **redeploy** (trigger build baru), karena nilai `NEXT_PUBLIC_*` dibekukan saat build.

## 4. Jika halaman tetap hitam/kosong

- Cek **Deployments** → deployment terbaru → **View build logs**: pastikan build sukses dan tidak ada error.
- Cek **Browser DevTools** (F12) → **Console**: lihat apakah ada error JavaScript (mis. 404 script, CORS, atau error Supabase).
- Pastikan env `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah di-set untuk environment **Build** dan sudah di-redeploy setelah diset.

## 5. Error "searchParams.entries() is not iterable" / favicon 503

- Proyek ini sudah menyertakan **instrumentation.ts** (polyfill URLSearchParams) dan **wrangler.toml** dengan `compatibility_date = "2025-01-29"` untuk mengurangi error di Cloudflare Edge.
- Favicon dilayani dari **public/favicon.ico** (static); pastikan file ini ada dan deploy ulang.
- **Surfe.be ERROR / content.js** → itu dari **ekstensi browser** (bukan dari situs); bisa diabaikan atau nonaktifkan ekstensi saat testing.
