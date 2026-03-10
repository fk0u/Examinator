<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nChangelog+(Agile+Sprint+Log)&font=Montserrat" alt="Changelog Banner" />
</p>

# 📋 Changelog — Examinator CBT Proctoring SaaS

> Seluruh perubahan yang tercatat pada proyek ini didokumentasikan mengikuti format [Keep a Changelog](https://keepachangelog.com/) yang diadaptasi dengan metodologi **Agile Scrum Sprint** internal KILOUX.

Konvensi penamaan: `[MAJOR.MINOR.PATCH]` mengacu pada [Semantic Versioning](https://semver.org/).

---

## [1.2.0] — 2026-03-10 _(Sprint 4 — Landing Page & i18n)_

### 🎯 Sprint Goal

Membangun marketing landing page imersif untuk Examinator dengan branding resmi, migrasi rute login ke `/login`, dan dukungan multi-bahasa.

### ✨ Added (Fitur Baru)

- **Landing Page Examinator** — Halaman pemasaran imersif di rute root `/` dengan desain level Awwwards.
  - **Loading Screen Apple-Style** — Animasi typewriter multilingual (Hello, Halo, Bonjour, こんにちは, Hola, Ciao, dll.) dengan cursor blink efek ala Apple keynote.
  - **Hero Section** — Headline "Masa Depan Penilaian Digital" dengan stats bar (10K+ Koneksi, <1.2s LCP, 99.9% Uptime, 3s Snapshot).
  - **6 Kartu Fitur Detail** — Tab Detection, Window Blur, Camera Snapshot, Fullscreen Enforcement, Resumability O(1), WebSocket Real-Time.
  - **Tech Stack Section** — 5 teknologi (Qwik, Elysia.js, Bun, Prisma, MySQL) + 3 architecture layers dengan tags deskriptif.
  - **Dokumentasi Section** — 5 kartu link interaktif (Karya Tulis Ilmiah, SRS IEEE, System Architecture, API Reference, Deployment Guide).
  - **Tim Pengembang** — Profil developer: Al-Ghani Desta Setyawan (Tech Lead), Hilal Sulthanul Adzam (Frontend), Diaz Daffa Aulia (Backend).
  - **CTA Section** — Dark section dengan ajakan "Siap untuk Transformasi?" dan tombol menuju Dashboard.
  - **Scroll-triggered Animations** — IntersectionObserver untuk animasi stagger setiap section saat di-scroll.
  - **Background Blobs** — 3 gradient blob animasi floating dengan noise texture overlay.
- **Sistem i18n 5 Bahasa** (`src/lib/i18n.ts`) — Dukungan penuh untuk:
  - 🇮🇩 Bahasa Indonesia
  - 🇲🇾 Bahasa Melayu
  - 🇬🇧 English
  - 🇪🇸 Español
  - 🇩🇪 Deutsch
  - Language switcher dropdown di navbar dengan pergantian konten real-time.
- **Rute Login Terpisah** (`/login`) — Login form dipindahkan dari root ke rute dedikasi `/login/index.tsx`.

### 🔒 Security

- **Penghapusan Role Selector** — Menghapus pemilihan role (Admin/Proktor/Siswa) dari form login untuk mencegah eksposur arsitektur internal. Role ditentukan server-side setelah autentikasi.

### 🎨 Changed (Perubahan)

- Branding utama diubah dari "KILOUX" menjadi "Examinator" — KILOUX disebutkan di footer sebagai naungan organisasi.
- Navbar menjadi sticky dengan backdrop-blur effect.
- Hero section padding diperkecil agar konten lebih rapat ke navigasi.

### 📁 File Baru

| File                                | Deskripsi                                        |
| ----------------------------------- | ------------------------------------------------ |
| `client/src/lib/i18n.ts`            | Sistem terjemahan 5 bahasa dengan type-safe keys |
| `client/src/routes/login/index.tsx` | Halaman login terpisah dengan animasi IRA Design |

### 📁 File Dimodifikasi

| File                                        | Perubahan                               |
| ------------------------------------------- | --------------------------------------- |
| `client/src/routes/index.tsx`               | Refaktor total → Marketing Landing Page |
| `client/src/components/auth/login-form.tsx` | Hapus role selector UI                  |

---

## [1.1.0] — 2026-03-10 _(Sprint 3 — Login UI Refinement)_

### 🎯 Sprint Goal

Menyempurnakan antarmuka login menjadi hyper-premium dengan desain imersif, responsivitas penuh, dan UX yang lebih baik.

### ✨ Added

- **Login Split-Screen Layout** — Desain dua panel: kiri (branding + ilustrasi 3D abstrak), kanan (form login).
- **Animasi SVG Blob** — Latar belakang animasi IRA Design dengan gradien vibrant.
- **Show/Hide Password** — Toggle visibility pada input password.
- **Placeholder Input** — Input field dengan placeholder deskriptif tanpa border kotak hitam.
- **Motion Animations** — Fade-in stagger untuk elemen form menggunakan library `motion`.

### 🐛 Fixed

- **Responsivitas 100% Scale** — Konten fit-to-screen tanpa horizontal scroll di resolusi 1080p.
- **Left Panel Overflow** — Teks dan elemen di panel kiri tidak lagi terpotong pada viewport kecil.
- **Footer Visibility** — Footer dan status "System Online" sekarang terlihat di scale 100%.
- **Text Alignment** — Semua teks di panel kiri rata kiri secara eksplisit.

### 🎨 Changed

- Migrasi dari desain glassmorphism ke split-screen IRA Design.
- Typography panel kiri diterjemahkan ke Bahasa Indonesia ("Meningkatkan standar penilaian digital").
- Padding dan margin dikurangi untuk memastikan konten muat di 100vh.

---

## [1.0.0] — 2026-03-09 _(Sprint 2 — Core Application)_

### 🎯 Sprint Goal

Membangun fondasi aplikasi CBT dengan autentikasi, routing, dashboard siswa, dan komponen UI inti.

### ✨ Added

- **Sistem Autentikasi JWT** — Login endpoint dengan JSON Web Token, role-based access control (ADMIN/STUDENT).
- **Dashboard Siswa** (`/student`) — Halaman utama siswa dengan daftar ujian dan navigasi.
- **Dashboard Admin** (`/admin`) — Panel administrasi untuk manajemen ujian dan pengguna.
- **Dashboard Proktor** — Realtime monitoring panel via WebSocket.
- **Komponen UI Inti** — Clock widget, time-based greeting, avatar component, sidebar navigasi.
- **User Profile Page** — Halaman profil pengguna dengan kemampuan edit.
- **Backend Server Elysia.js** — REST API lengkap dengan CORS, JWT middleware, dan file upload handler.
- **WebSocket Proctor Module** (`/ws/proctor`) — Kanal real-time untuk pemantauan ujian.
- **Prisma ORM Schema** — Model database: User, Exam, Question, Option, Attempt, Answer, CheatLog.
- **Cheat Detection Hooks** — `useProctoring` hook dengan Page Visibility API, Window Blur, dan Fullscreen detection.
- **Camera Capture** — MediaRecorder API untuk snapshot 3-detik saat kecurangan terdeteksi.

### 📚 Documentation

- `docs/1-product-backlog.md` — Product & Sprint Backlog
- `docs/2-system-architecture.md` — Arsitektur Sistem (Mermaid diagrams)
- `docs/3-database-schema.md` — Skema Database & ERD
- `docs/4-api-reference.md` — Referensi API Endpoints
- `docs/5-deployment-guide.md` — Panduan Deployment Produksi
- `docs/6-srs-document.md` — SRS Bersertifikasi IEEE 830-1998
- `docs/7-karya-tulis-ilmiah.md` — Karya Tulis Ilmiah & Penelitian
- `docs/8-agile-ceremonies.md` — Agenda Panduan Agile Scrum
- `docs/9-test-plan.md` — Metodologi QA & Test Plan

---

## [0.1.0] — 2026-03-09 _(Sprint 1 — Project Bootstrap)_

### 🎯 Sprint Goal

Inisialisasi proyek monorepo dengan scaffolding frontend (Qwik) dan backend (Elysia.js/Bun).

### ✨ Added

- **Monorepo Structure** — Root workspace dengan `client/` (Qwik + Vite) dan `server/` (Elysia.js + Bun).
- **Qwik Frontend Scaffold** — Hasil `npm create qwik@latest` dengan integrasi Tailwind CSS v3.
- **Elysia.js Backend Scaffold** — Server entry point dengan konfigurasi dasar.
- **README.md** — Dokumentasi instalasi, fitur utama, dan arsitektur.
- **README.id.md** — Versi Bahasa Indonesia dari README.
- **Repo Health Files** — CODE_OF_CONDUCT, CONTRIBUTING, LICENSE (MIT), SECURITY policy dalam 4 bahasa.
- **Git & Environment Config** — `.gitignore`, `.env.example`, `concurrently` untuk dev script.

---

## 📊 Sprint Velocity Summary

| Sprint                  | Tanggal    | Story Points | Status     |
| ----------------------- | ---------- | :----------: | ---------- |
| Sprint 1 — Bootstrap    | 2026-03-09 |      8       | ✅ Selesai |
| Sprint 2 — Core App     | 2026-03-09 |      21      | ✅ Selesai |
| Sprint 3 — Login UI     | 2026-03-10 |      13      | ✅ Selesai |
| Sprint 4 — Landing Page | 2026-03-10 |      21      | ✅ Selesai |

**Total Story Points Delivered:** 63

---

## 👥 Kontributor

| Nama                    | Role               | Kontribusi Utama                        |
| ----------------------- | ------------------ | --------------------------------------- |
| Al-Ghani Desta Setyawan | Tech Lead Engineer | Arsitektur sistem, integrasi teknologi  |
| Hilal Sulthanul Adzam   | Frontend Engineer  | Landing page, login UI, i18n, animasi   |
| Diaz Daffa Aulia        | Backend Engineer   | Elysia.js API, WebSocket, Prisma schema |

---

<p align="center">
  <strong>Examinator</strong> — Di bawah naungan <strong>KILOUX</strong><br/>
  <em>Dibangun dengan standar tinggi Indonesia 🇮🇩</em>
</p>
