<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="60" alt="TypeScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="60" alt="Tailwind" />
  <img src="https://bun.sh/logo.svg" width="60" alt="Bun" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/MySQL-Dark.svg" width="60" alt="MySQL" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Prisma.svg" width="60" alt="Prisma" />

  <h1 align="center">🎓 Examinator v1.0</h1>

  <p align="center">
    <strong>Advanced Self-hosted CBT (Computer-Based Test) Proctoring SaaS</strong><br>
    <em>Tailored for SMK Indonesia (Kurikulum Merdeka)</em>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge&logo=github" alt="Status" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
    <img src="https://img.shields.io/badge/Bun-1.0+-black?style=for-the-badge&logo=bun" alt="Bun" />
  </p>
</div>

<hr />

## 🌟 Apa itu Examinator?

**Examinator** adalah platform Computer-Based Test (CBT) modern yang berfokus pada **integritas ujian** dan **performa tinggi**. Dibangun khusus untuk kebutuhan sekolah (khususnya SMK di Indonesia yang menerapkan Kurikulum Merdeka) yang membutuhkan solusi self-hosted yang ringan namun sanggup menangani ratusan siswa secara bersamaan (_concurrent_).

Aplikasi ini menggunakan **Qwik** untuk meminimalisir payload Javascript di frontend (mencapai _instant load_), dan **Elysia.js** di backend yang berjalan di atas **Bun** untuk kecepatan luar biasa.

---

## ✨ Fitur Unggulan (Core Features)

### 🖥️ CBT Engine Berkecepatan Tinggi

- **Resumability**: Frontend dibangun dengan Qwik framework untuk performa maksimal di perangkat siswa dengan spek rendah.
- **State Recovery**: Jawaban siswa tersimpan otomatis secara berkala (_auto-save_). Jika terputus, siswa dapat melanjutkan tepat dari titik terakhir.

### 🛡️ Anti-Cheat & Smart Proctoring

- **Real-time Event Tracking**: Deteksi perpindahan tab (Page Visibility API), keluar dari mode Fullscreen, dan Window Blur.
- **Action Blocking**: Mencegah klik kanan (Context Menu) dan blokir fungsi Copy/Paste.
- **Semi-Mandatory Camera**: Memerlukan akses kamera. Jika terdeteksi kecurangan (tab diganti, dsb), sistem otomatis mengambil foto/video berdurasi 3 detik sebagai barang bukti.

### 📡 Live Proctor Dashboard (WebSockets)

- **Monitoring Ratusan Siswa**: Proktor (Pengawas) dapat melihat status setiap siswa secara langsung (🟢 Aktif, 🔴 Ditandai/Curang, ✅ Selesai).
- **Live Alert Feed**: Setiap pelanggaran yang dilakukan siswa langsung berbunyi dan muncul di feed pengawas secara _real-time_ dengan WebSockets native (`uWebSockets`).
- **Force Submit**: Pengawas dapat menghentikan ujian siswa secara paksa jika terbukti melakukan pelanggaran berat.

### 🎨 Modern & Premium UI/UX

- Menggunakan **Tailwind CSS v4** dengan **Glassmorphism design**.
- **Dark Mode First** untuk kenyamanan mata selama ujian berlangsung dengan animasi interaktif (micro-animations, staggering load).

---

## 🏗️ Arsitektur & Teknologi

Examinator dirancang sebagai arsitektur **Monorepo** untuk mempermudah development.

| Kategori     | Teknologi Utama                                                    | Alasan Pemilihan                                                              |
| :----------- | :----------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Frontend** | [Qwik](https://qwik.builder.io/)                                   | Load instan, zero hydration overhead, cocok untuk internet lambat.            |
| **Styling**  | [Tailwind CSS v4](https://tailwindcss.com/)                        | Utilitas CSS modern untuk desain premium yang cepat.                          |
| **Backend**  | [Elysia JS](https://elysiajs.com/)                                 | Framework backend tercepat untuk runtime Bun.                                 |
| **Runtime**  | [Bun](https://bun.sh/)                                             | Sangat cepat, memiliki built-in WebSocket, bundler, dan runner.               |
| **Database** | [MySQL](https://www.mysql.com/) + [Prisma](https://www.prisma.io/) | Relasional untuk integritas data yang kuat, Prisma untuk Type-Safety.         |
| **Keamanan** | JWT + bcrypt                                                       | Stateless authentication, Role-Based Access Control (Admin, Operator, Siswa). |

---

## 📸 Screenshots (Preview)

> _Tambahkan gambar screenshot di folder `docs/assets/` dan ganti placeholder di bawah ini saat siap._

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>Halaman Login (Glassmorphism)</strong></td>
      <td align="center"><strong>Dashboard Proktor (Realtime WS)</strong></td>
    </tr>
    <tr>
      <td><img src="https://placehold.co/600x400/1e293b/a8b2d1?text=Login+Page" alt="Login" /></td>
      <td><img src="https://placehold.co/600x400/1e293b/a8b2d1?text=Proctor+Dashboard" alt="Proctor Dashboard" /></td>
    </tr>
    <tr>
      <td align="center"><strong>Antarmuka Ujian Siswa</strong></td>
      <td align="center"><strong>Panel Admin & Statistik</strong></td>
    </tr>
    <tr>
      <td><img src="https://placehold.co/600x400/1e293b/a8b2d1?text=Student+Exam+UI" alt="Student UI" /></td>
      <td><img src="https://placehold.co/600x400/1e293b/a8b2d1?text=Admin+Panel" alt="Admin Panel" /></td>
    </tr>
  </table>
</div>

---

## 🚀 Panduan Instalasi (Quick Start)

### 1. Kebutuhan Sistem (Prerequisites)

Pastikan Anda sudah menginstal:

- [Bun v1.0.0+](https://bun.sh/)
- [Node.js v18+](https://nodejs.org/) (untuk build frontend)
- [MySQL v8.0+](https://www.mysql.com/)

### 2. Clone Repositori

```bash
git clone https://github.com/organization/examinator.git
cd examinator
```

### 3. Instalasi Dependensi Terpusat

Berkat arsitektur workspace, Anda cukup menjalankan satu perintah dari root folder:

```bash
# Otomatis menginstal package di root, server, dan client
npm install

# Atau masuk secara manual:
# cd server && bun install
# cd ../client && npm install
```

### 4. Konfigurasi Database

Buat sebuah database baru di MySQL server Anda:

```sql
CREATE DATABASE examinator_db;
CREATE USER 'examinator_user'@'localhost' IDENTIFIED BY 'rahasia123';
GRANT ALL PRIVILEGES ON examinator_db.* TO 'examinator_user'@'localhost';
FLUSH PRIVILEGES;
```

Konfigurasi file Environment:

```bash
# Duplikasi template .env
cp .env.example .env

# Edit .env dan masukkan URL koneksi MySQL Anda
# Contoh: DATABASE_URL="mysql://examinator_user:rahasia123@localhost:3306/examinator_db"
```

### 5. Migrasi & Seeding Database

Jalankan perintah berikut untuk mensinkronisasi skema ke database dan memasukkan data sampel (Akun Demo):

```bash
# Di dalam folder root
npm run db:push

# Atau di folder server
cd server
bunx prisma generate
bunx prisma db push
bun run prisma/seed.ts
```

### 6. Menjalankan Aplikasi (Development)

Satu perintah untuk menjalankan Backend dan Frontend bersaman secara beriringan:

```bash
npm run dev
```

🌐 **Akses Aplikasi:**

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Database GUI (Prisma Studio)**: Buka terminal baru, ketik `cd server && bunx prisma studio`

---

## � Akun Demo (Testing)

Proses seeding telah secara otomatis membuat akun-akun berikut untuk keperluan uji coba:

| Role (Peran) | Username   | Password      | Keterangan                                                      |
| :----------- | :--------- | :------------ | :-------------------------------------------------------------- |
| **Admin**    | `admin`    | `admin123`    | Akses penuh manajemen soal, user, statistik kemacetan.          |
| **Proctor**  | `operator` | `operator123` | Akses monitoring langsung kegiatan ujian, live alert websocket. |
| **Siswa 1**  | `siswa1`   | `siswa123`    | Akun ujian siswa. Ada `siswa1` sampai `siswa5`.                 |

---

## 📁 Struktur Direktori Utama

```text
examinator/
├── client/                     # (Frontend) Qwik & Tailwind CSS
│   ├── src/
│   │   ├── components/         # Reusable UI component (auth, modal)
│   │   ├── lib/                # API client (Axios/Fetch), WS client, auth logic
│   │   └── routes/             # File-based routing
│   │       ├── admin/          # Route Admin
│   │       ├── proctor/        # Route Proctor Monitoring
│   │       └── student/        # Route Siswa & Ujian
│   └── package.json
│
├── server/                     # (Backend) Bun & Elysia JS
│   ├── prisma/
│   │   ├── schema.prisma       # Skema database (User, Exam, Attempt, CheatLog)
│   │   └── seed.ts             # Script pembuat data default
│   ├── src/
│   │   ├── middleware/         # Autentikasi JWT guard & Role check
│   │   ├── routes/             # Endpoint HTTP API Controller
│   │   └── ws/                 # Websocket server logic & Rooms event
│   └── package.json
│
├── package.json                # Root package untuk NPM Workspaces & Scripts
└── README.md
```

---

## � Lisensi & Atribusi

Proyek ini dilisensikan di bawah **MIT License** — Anda bebas menggunakan, memodifikasi, dan mendistribusikannya baik untuk tujuan komersial maupun pribadi.

---

_Dibuat dengan ❤️ untuk pendidikan Indonesia yang lebih baik, efisien, dan jujur._
