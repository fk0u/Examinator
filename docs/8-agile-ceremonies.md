# 7. Advanced Agile Ceremonies Guide

Sebagai penerapan kerangka kerja yang mumpuni, panduan metodologi ini diformulasikan menyesuaikan skenario pengembangan "Examinator" SaaS. Dokumentasi ini bukan teori usang, melainkan praktek _Applied Agile_ berspesifikasi atas arsitektur peranti lunak iteratif yang intens.

## 🧭 Siklus Epik & Sprint Rilis

Satu Sprint pengembang di tim inti (Engineer Utama, UI/UX, dan DevOps) dikalendarisasi sepanjang **1 Minggu (7 Hari)** guna menghasilkan iterasi kompilasi modul yang _Deployable_.

Proyek ini telah melalui 3 ekuivalensi Sprint:

1. **Sprint 1**: MVP API & Komponen Statis Klien.
2. **Sprint 2**: Modul Pelanggaran Klien (Anti-Cheat Hook) & Transmisi WS.
3. **Sprint 3**: Polishing Integrasi Antarmuka CSS, Rilis Dokumen, dan Infrastruktur Database.

---

## 📅 Seremoni Agile Tingkat Lanjut (Advanced Ceremonies)

### 1. Sprint Planning (Perancangan Taktis Sprint)

- **Partisipan**: Product Owner, Lead Engineer.
- **Fokus**: Alokasi poin (_Story Points_) menggunakan _Fibonacci sequence_ (1, 2, 3, 5, 8). Cerita pengguna (User Stories) dari Kebutuhan Siswa & Proktor (misal: "Sebagai proktor saya minta deteksi fullsceen") dievaluasi kompleksitas asinkronusnya.
- **Output Strategis**: Penetapan Sprint Goal (Misal: "Sprint 2 Goal: Implementasi CCTV berbasis MediaRecorder dan WebSocket Proxy terselesaikan penuh tanpa _memory leak_").

### 2. Daily Stand-up (Penyelarasan Rutin Harian)

- **Partisipan**: Engineer, DevOps.
- **Fokus Tingkat Lanjut**: Melampaui "Apa yang saya lakukan kemarin", setiap anggota menyingkapkan "_Technical Blockers_" sedini mungkin.
- **Skenario Nyata**: _“Kemarin saya menyatukan Page Visibility API klien (Qwik hook) The blocker is: Mobile Safari menjeda eksekusi script WebSockets saat dilatarbelakang, kita butuh fallback beacon API. Solusi hari ini: Saya akan mengimplementasi navigator.sendBeacon() sebagai pengganti putusnya WS.”_

### 3. Sprint Review (Tinjauan Demonstratif Iterasi)

- **Partisipan**: Seluruh Tim & Representatif Stakeholder (Pihak Sekolah).
- **Fokus Tingkat Lanjut**: Mengharamkan demonstrasi lewat "Kumpulan Slide/Presentasi". Yang ditunjukkan murni lingkungan UAT (_User Acceptance Testing_) produk rilis di browser (Show, Don't Tell).
- **Agenda**: Mendemonstrasikan secara _Live_ jika siswa melakukan klik layar di luar tab untuk dieksesusi layaknya proktor sejati dalam pengujian stres lokal multi-browser.

### 4. Sprint Retrospective (Retrospeksi Forensik Teknis)

- **Partisipan**: Internal Tim Teknis Saja.
- **Kerangka Lanjut (Start, Stop, Continue - Blameless Postmortems)**:
  - _Start_: Mulai mengonfigurasikan Prisma Migrations untuk _deployment_ skema agar tidak bertabrakan (Menerapkan Prisma `db push` khusus untuk Dev).
  - _Stop_: Berhenti mengerjakan utilitas kode repetitif CSS di berbagai rute; fokus pada satu komponen `/client/src/global.css` (Design system Tailwind v4 tunggal).
  - _Continue_: Meneruskan isolasi JWT Guard dalam fungsi internal perantara (Middleware layer) untuk setiap rute `/api` guna efisiensi barisan kode auth.

---

## ⚓ Pilar Standarisasi Kesuksesan Agile

### Atribut 1: Definition of Ready (DoR) - (Kesanggupan Pengerjaan Tugas)

Tugas (_User Story_) dilarang keras dimasukkan dari _Backlog_ ke fase _In-Progress/Execution_ Papan Sprint kecuali ia lolos syarat DoR:

1. Deskripsi alur logika sudah bersih.
2. Desain/Sketsa (_Mock/Blueprint API_) struktur relasional tabel JSON untuk basis data per rute sudah ditentukan.
3. (Tugas Frontend) Prasyarat ketersediaan `Endpoint` REST atau WebSocket Server lokal sudah disimulasasikan / di-mockup.

### Atribut 2: Definition of Done (DoD) - (Kualifikasi Selesai Suatu Pekerjaan)

"Selesai" di lingkungan "Examinator" berarti:

1. **Code Compiles**: Perintah `npm run build` merakit Klien tanpa kesalahan TypeScript (Strict Mode terpenuhi).
2. **Linting Valid**: Kode di _server/src_ sudah tidak mengadu benturan deklarasi atau penempatan modul Prisma _import_.
3. **Peer Reviewed**: Semua logika perantara dan validasi JWT yang baru tak sengaja mengekspos kata sandi ter-hash _user_ di _payload_ API respons JSON.
4. **Deployable Asset**: Panduan NGINX siap (Didokumentasikan secara paralel saat membangun arsitektur WebSockets untuk production).

Dengan penegakan ritme seremonial yang ketat, aliran kompilasi SaaS Ujian tidak akan menjebak rekayasawan proyek dalam labirin kompleksitas tumpang-tindih, melainkan mempertahankan rilis fungsional tangguh per minggunya.
