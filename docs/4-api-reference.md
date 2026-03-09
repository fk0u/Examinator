# 4. API Reference

API dikembangkan di atas framework Elysia.js dengan prefix rute `/api`.
Semua API yang diproteksi memerlukan header `Authorization: Bearer <JWT_TOKEN>`.

## 🔒 Authentication API

### `POST /api/auth/register`

- **Body**: `{ "username", "password", "fullName", "role" ("STUDENT"|"OPERATOR"|"ADMIN"), "kelas"? }`
- **Response**: `{ "token", "user" }`
- Menginjeksi _hash_ kata sandi melalui `bcrypt.hash`.

### `POST /api/auth/login`

- **Body**: `{ "username", "password" }`
- **Response**: `{ "token", "user" }`
- Memvalidasi _password_ dengan `bcrypt.compare`.

### `GET /api/auth/me`

- **Header**: Bearer Token
- **Response**: Data profil diri user yang terafirmasi _token_-nya.

---

## 📝 Exam Management

### `GET /api/exams`

- **Response**: Rincian jumlah _Exam_ (Jika pengguna Siswa, hanya memuat _Exam_ bersatus `active`).

### `POST /api/exams` _(Admin Only)_

- **Body**: `{ "title", "subject", "duration", "passingScore", "description" }`
- **Response**: Entitas _Exam_ baru dibuat.

### `PATCH /api/exams/:id` _(Admin Only)_

- **Body**: `{ "active" }` (Digunakan agar Ujian dapat online dan diakses Siswa).

### `DELETE /api/exams/:id` _(Admin Only)_

- **Aksi**: Menghapus sesi beserta data turunan soal.

---

## 📌 Attempts (Sesi Berjalan Siswa)

### `GET /api/attempts/my`

- **Response**: Mengambil rekap status Ujian _(In-Progress)_ bagi si pengguna sendiri.

### `POST /api/attempts/start`

- **Body**: `{ "examId", "cameraEnabled" }`
- **Response**: `{ "attempt": { ..., exam: { questions: [...] } } }`
- Memulai sesi, menyimpan _StartTime_, dan mengembalikan struktur utuh dari soal (Akan dirender Klien _Qwik_).

### `POST /api/attempts/:id/answer`

- **Body**: `{ "questionId", "optionId" }`
- **Aksi**: Terjadi fungsi internal _upsert_. Secara konstan Klien akan _hit_ API ini begitu soal dijawab (_auto-save_).

### `POST /api/attempts/:id/submit`

- **Aksi**: Mengakhiri status ujian, secara otomatis sistem _Backend_ akan memberikan proses perbandingan _Option_ benar (Skoring/Penilaian Otomatis), dan menyimpan `score` akhir.

---

## ⚠️ Anti-Cheat Logs & Monitoring

### `POST /api/cheat-logs`

- **Body**: `{ "attemptId", "cheatType", "description" }` _(multipart/form-data)_
- Jika `file` dilampirkan, Bun.js akan menyimpan langsung ke `/uploads`. Merekam database log pelanggaran.

### `GET /api/cheat-logs/stats` _(Proctor/Admin)_

- **Response**: Agregat analitik pelanggaran _(Count)_.

---

## 📡 WebSockets API

Host Berada di `ws://[HOST]:[PORT]/ws/proctor`.

- **Client `send` Events:**
  - `student:join`: Mengabari Proktor bahwa siswa siap di sesi (Menyala Hijau 🟢).
  - `student:submit`: Mengabari penyelesaian.
  - `cheat:detected`: _Event_ seketika agar Proktor memperoleh bunyi _Alarm/Ticker Sidebar_.
  - `proctor:join`: Registrasi operator ke kanal `Room`.
  - `admin:force_submit`: Proktor menyuruh klien siswa tutup layar sesegera mungkin di tengah jalan _(Disconnect/Terminate)._
- **Client `on` Events:**
  - `proctor:state`: Kumpulan Array ratusan daftar profil siswa saat itu juga.
  - `cheat:alert`: Payload notifikasi pelanggaran.
