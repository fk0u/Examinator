# Panduan Kolaborasi Tim: Examinator CBT

Proyek **Examinator** dibangun dengan arsitektur **Monorepo** (Frontend Qwik, Backend Elysia.js, Database Prisma). Mengingat spesialisasi masing-masing anggota tim, berikut adalah formasi Line-up yang paling optimal untuk kelancaran pengembangan proyek ini:

---

## 👥 Line-up Tim & Pembagian Tugas

### 1. Hilal (Frontend Engineer)

Fokus murni pada segala hal di dalam folder `client/`.

- **Tanggung Jawab:**
  - Mendesain dan mengimplementasikan komponen UI menggunakan **Qwik** (`.tsx`).
  - Mengatur _state management_ dan _styling_ responsif menggunakan **Tailwind CSS**.
  - Mengintegrasikan API dari backend ke tampilan UI (termasuk _Datatables_, _Clock_, _Charts_).
  - Menangani UX, animasi ringan, dan _glassmorphism_ agar aplikasi terasa premium.
- **Fokus utama:** Folder `client/src/`

### 2. Diaz (Backend & Database Engineer)

Fokus pada segala hal di dalam folder `server/` dan integrasi _database_.

- **Tanggung Jawab:**
  - Merancang dan memelihara _endpoint_ REST API serta _WebSockets_ menggunakan **Elysia.js** (secara konsep sangat mirip dengan _FastAPI_, sehingga seharusnya Diaz akan sangat cepat beradaptasi).
  - Mengelola skema _database_ (`schema.prisma`) dan migrasi (_Prisma Migrate_).
  - Menulis _logic_ untuk autentikasi (JWT), manajemen sesi, dan mesin deteksi kecurangan (_anti-cheat engine_).
- **Fokus utama:** Folder `server/src/`, `server/prisma/`

### 3. Kamu / "Gw" (Project Manager / Fullstack All-Rounder)

Berfungsi sebagai _Leader_, jembatan tim, dan pendorong utama proyek agar rilis tepat waktu.

- **Tanggung Jawab:**
  - Membantu Hilal atau Diaz jika ada tugas kodingan yang _bottleneck_ (karena kamu fleksibel dan bisa _coding_ apa saja baik di server maupun client).
  - Mengarahkan _Product Vision_, penentuan prioritas fitur, dan menguji (_QA Testing_) aplikasi secara menyeluruh dari sisi _user_.
  - Mengurus infrastruktur _Deployment_ (VPS, CI/CD, Setup Database Server).
  - Manajemen _repository_, _Code Review_, merapikan dokumentasi (`docs/`), dan menangani jika terjadi konflik kode di Git (_Merge Conflicts_).
- **Fokus utama:** Fleksibel melintasi seluruh struktur proyek _monorepo_, Git Workflow, Dokumentasi Bisnis, Server _Deployment_.

---

## 🌳 Aturan Git & Git Flow

Karena kalian bekerja bertiga secara paralel di satu _repository_, **jangan pernah _coding_ atau _Push_ langsung ke cabang (branch) `main`**. Lakukan rutinitas berikut untuk mencegah kode saling tertimpa:

1.  Cabang utama adalah `main`. Ini adalah cabang _production_ yang harus selalu bersih dari _error_ atau _bug_.
2.  Setiap orang **wajib** membuat cabang baru (_branch_) saat mulai mengerjakan fitur atau _fix_ baru:
    - Hilal: `git checkout -b frontend/nama-fitur` (contoh: `frontend/exam-ui`)
    - Diaz: `git checkout -b backend/nama-fitur` (contoh: `backend/auth-api`)
    - Kamu: `git checkout -b chore/nama-tugas` atau `fix/nama-bug`
3.  Setelah selesai mengerjakan tugas di _branch_ masing-masing, lakukan _Commit_ lalu _Push_ ke GitHub/GitLab.
4.  Buat **Pull Request (PR)** (atau Merge Request) untuk menggabungkan kode kalian ke branch `main`.
5.  Sebagai _Leader_, Kamu (atau anggota lain secara _cross-review_) bertugas untuk me-_review_ kode tsb sebelum menekan tombol **Merge** ke `main`.
6.  Gunakan format penamaan _commit_ yang disepakati bersama (_conventional commits_) agar riwayat kode terbaca historisnya:
    - `feat: add new exam submission endpoint`
    - `fix: resolve UI bug on mobile sidebar`
    - `docs: update readme with setup instructions`

Dengan Line-up yang sangat strategis ini, Hilal dan Diaz bisa fokus 100% pada keahlian teknis spesifik mereka, sementara Kamu yang memastikan kualitas produk secara utuh, mengatur ritme kerja layaknya Tech Lead, dan menambal lubang apapun yang tertinggal! 🚀
