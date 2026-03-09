# 🧩 TTS Master - Crossword Builder & Player

Selamat datang di **TTS Master**, aplikasi pembuat Teka-Teki Silang (TTS) premium yang dibangun dengan teknologi full-stack modern. Project ini dirancang untuk memberikan pengalaman "Creator Studio" bagi pembuat puzzle dan pengalaman bermain yang responsif bagi pemain.

---

## 🚀 Fitur Utama
1.  **Smart Generator (Backtracking)**: Algoritma cerdas yang otomatis menyusun grid TTS dari daftar kata acak dengan optimasi persimpangan huruf (intersections).
2.  **Creator Studio**: Dashboard intuitif untuk membuat, merancang, dan mempublikasikan puzzle Anda sendiri.
3.  **Cross-Platform Player**: Grid interaktif yang mendukung navigasi keyboard penuh (arrow keys), auto-focus, dan validasi jawaban real-time.
4.  **Database Terintegrasi**: Sinkronisasi data menggunakan Supabase untuk menyimpan puzzle dan hasil skor.
5.  **Multiplayer Co-Op (Bonus)**: Mode bermain bersama teman secara real-time (sinkronisasi grid instan).
6.  **Sistem Skor & Leaderboard**: Papan peringkat otomatis berdasarkan kecepatan pengerjaan.
7.  **Export Pro**: Simpan hasil karya Anda dalam format **PDF** atau **Gambar (PNG)**.

---

## 🛠️ Tech Stack
-   **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS.
-   **Backend**: Supabase (PostgreSQL, Realtime DB, Auth).
-   **Icons**: Lucide React.
-   **Export Tools**: html-to-image, jsPDF.
-   **Animations**: Framer Motion (subtle), Canvas Confetti.

---

## ⚙️ Cara Menjalankan di Lokal

### 1. Persiapan Database (Supabase)
1.  Buat project baru di [Supabase](https://supabase.com).
2.  Jalankan kode SQL dari file `supabase_schema.sql` di SQL Editor Supabase untuk membuat tabel dan kebijakan keamanan (RLS).

### 2. Pengaturan Environment
Buat file `.env.local` di root folder dan masukkan API Key Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=alamat_url_supabase_anda
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_supabase_anda
```

### 3. Instalasi & Running
```bash
# Instal dependensi
npm install

# Jalankan server development
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🧠 Dokumentasi Algoritma
Project ini menggunakan algoritma **Intersection-Scoring Backtracking** untuk membangun grid:
1.  **Pre-processing**: Mensortir kata dari yang terpanjang ke terpendek untuk dijadikan jangkar utama.
2.  **Seed Placement**: Menempatkan kata pertama di pusat koordinat.
3.  **Recursive Matching**: Mencari sel yang sudah terisi, mencari huruf yang sama pada kata baru, dan mencoba menempatkannya (baik secara horizontal maupun vertikal).
4.  **Scoring & Validation**: Memeriksa aturan crossword (tidak boleh ada kata tetangga yang 'berdempetan' secara ilegal) dan memilih posisi dengan jumlah persimpangan huruf terbanyak.

---

## 🛠️ Masalah & Solusi
Selama pengembangan, kami menghadapi beberapa tantangan teknis:
-   **SSR Hydration Error**: Terjadi karena browser extension atau perbedaan waktu render server/client. *Solusi*: Menggunakan pola `mounted` state dan `suppressHydrationWarning`.
-   **ReferenceError: location is not defined**: Terjadi saat Vercel mencoba mem-build library browser-only (PDF/Image) di sisi server. *Solusi*: Implementasi **Dynamic Imports** sehingga library hanya dimuat saat di lingkungan client.
-   **RLS Permission**: Kesalahan akses database saat publish. *Solusi*: Mengatur kebijakan Row Level Security (RLS) PostgreSQL untuk mengizinkan `INSERT` secara publik.

---

### 🛡️ Lisensi & Hak Cipta
Dibuat oleh **Muhammad Azzam** untuk tugas seleksi/magang.
Akses Repository: [https://github.com/azzam380/TTS_Puzzle](https://github.com/azzam380/TTS_Puzzle)
