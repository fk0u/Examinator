<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nProduct+Backlog+%26+Sprint+Planning&font=Montserrat" alt="Product Backlog Banner" />
</p>

# 1. Product & Sprint Backlog 📋

Dokumen ini mendefinisikan visi produk, target pengguna, dan daftar fitur (_User Stories_) yang disusun menggunakan metodologi Agile (Scrum).

## 🎯 Visi Produk (Product Vision)

Menciptakan platform _Computer-Based Test_ (CBT) terdesentralisasi, aman, dan supercepat di Indonesia dengan mekanisme _Proctoring_ canggih, menggunakan teknologi terkini (Qwik + Bun) untuk memastikan efisiensi biaya infrastruktur sekolah, namun dengan fitur pengawasan (_Anti-Cheat_) tingkat dewa.

## 👤 Target Pengguna (User Personas)

- **Ahmad (Guru / Pengawas Ujian)**: Menginginkan pembuatan soal, pemantauan peserta ujian secara _real-time_, dan pelaporan indikasi kecurangan dengan akurat.
- **Budi (Siswa SMK & Peserta Ujian)**: Menginginkan akses ujian tanpa lag (_zero-latency_), tidak memberatkan gawai, dan transparan.
- **Siti (Administrator TI / Proktor Pusat)**: Butuh pengerahan server massal yang irit (_low footprint_) serta pemantauan log peladen mutakhir.

## 📦 Daftar Tunggu Produk (Product Backlog Items - PBI)

_Prioritas diurutkan dari yang tertinggi (Epic -> Story -> Task)._

### Epic 1: Manajemen Ujian Inti (Core Exam Management) 📝

- **As a Teacher**, I want to create a new exam with multiple-choice questions, so that I can evaluate my students.
- **As a Teacher**, I want to set the start and end time of an exam, to enforce strict deadlines.
- **As a Teacher**, I want to randomly shuffle questions per student, to prevent mass cheating in classrooms.

### Epic 2: Pengawasan Kelas Gahar (Advanced Proctoring) 👁️

- **As an Admin**, I want the system to alert me _real-time_ via WebSockets when a student opens a new tab.
- **As an Admin**, I want the system to require webcam access and take a 3-second snapshot/video context when a blur/unfocus event happens.
- **As an Admin**, I want to force students into fullscreen mode and flag them when they exit.

### Epic 3: Ujian Tingkat Murid (Student Exam Interface) 🎓

- **As a Student**, I want an interactive quiz interface that loads instantly (Resumable Qwik components).
- **As a Student**, I want progress auto-saving so I don't lose data if my connection drops.
- **As a Student**, I want a clear warning if the system detects I've minimized the browser window.

---

## 🏃 Sprint Planning (Refined Estimates)

### Sprint 1: Penyiapan Infrastruktur & UI Kerangka (Foundation) 🏗️

- **S1-01**: Setup Monorepo (Bun, Qwik, Elysia, Prisma, Tailwind).
- **S1-02**: Konfigurasi Database Schema untuk `User`, `Exam`, `Question`.
- **S1-03**: Bangun Login/Registrasi API + JWT Authentication.
- **S1-04**: Buat komponen UI Auth (Login & Sign Up) dengan TailwindCSS.

### Sprint 2: Implementasi Mesin CBT Inti (Core CBT) 🚀

- **S2-01**: Bangun API CRUD Ujian dan Soal.
- **S2-02**: Integrasikan _Dashboard_ Siswa (Daftar ujian aktif).
- **S2-03**: Bangun UI Halaman Mengerjakan Soal.
- **S2-04**: Integrasi fungsi Simpan Jawaban secara _real-time_.

### Sprint 3: Mekanisme Proctoring & Websockets (Anti-Cheat & Validation) 🛡️

- **S3-01**: Integrasi Elysia WebSockets (`/ws/proctor`).
- **S3-02**: Implementasi _Hooks Browser_ (Visibility API, Blur/Focus, Fullscreen API) di Qwik _Client_.
- **S3-03**: Mekanisme Tangkapan Webcam (MediaRecorder) dan pengunggahan file bukti.
- **S3-04**: Bangun Dashboard Admin dengan _Live Stream Data_ / WS Events log atas kecurangan.

> **Status Saat Ini**: Sprint 1, 2, dan 3 telah diimplementasikan sepenuhnya dengan sukses _(100% Selesai)_.
