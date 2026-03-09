<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nDatabase+Schema+%26+ERD&font=Montserrat" alt="Database Schema Banner" />
</p>

# 3. Database Schema 🗄️

Dokumen ini memuat skema database yang dikelola oleh Prisma ORM (`server/prisma/schema.prisma`). Database menggunakan MySQL secara relasional untuk mempertahankan integritas data ujian dengan jaminan keamanan ACID.

## 🗺️ Relasi Entitas (ERD)

```mermaid
erDiagram
    User ||--o{ Exam : creates
    User ||--o{ UserExamSession : attempts
    Exam ||--o{ Question : contains
    Exam ||--o{ UserExamSession : logs
    UserExamSession ||--o{ ProctorLog : monitors

    User {
        string id PK
        string email
        string name
        string password
        enum role "ADMIN | STUDENT"
        datetime createdAt
    }

    Exam {
        string id PK
        string title
        string description
        datetime startTime
        datetime endTime
        int duration
        string authorId FK
        datetime createdAt
    }

    Question {
        string id PK
        string examId FK
        string content
        json options
        string correctAnswer
        int points
    }

    UserExamSession {
        string id PK
        string userId FK
        string examId FK
        enum status "IN_PROGRESS | COMPLETED | FLAGGED"
        int score
        datetime startedAt
        datetime completedAt
    }

    ProctorLog {
        string id PK
        string sessionId FK
        string eventType "TAB_SWITCH | BLUR | FULLSCREEN_EXIT"
        string details "JSON Metadata/Warning metrics"
        string evidenceUrl "Lokal /uploads/path"
        datetime createdAt
    }
```

## 📖 Deskripsi Model Lanjut (Advanced Dict)

### 1. `User` (Identitas Hak Akses)

Menampung entitas profil dengan batasan izin:

- **`role`**: Mengindikasi izin. Hanya pengguna ber-tipe `ADMIN` yang diizinkan memanipulasi baris data `Exam` dan mengakses papan dasbor `/admin` monitor.

### 2. `Exam` (Struktur Paket Ujian)

Induk kerangka soal:

- **`startTime`** / **`endTime`**: Penetapan kronometri pembatasan jadwal di dalam rentang waktu yang direstui oleh server.
- **`duration`**: Kuota menit efektif. Digunakan di klien oleh timer _Count-down_.

### 3. `Question` (Distribusi Soal)

- **`options`**: Tipe `JSON` yang menaungi larik variasi opsi `A, B, C, D`.
- **`correctAnswer`**: Dikunci dan hanya diobservasi tatkala `UserExamSession` dikirim untuk kalkulasi skoring parsial server.

### 4. `UserExamSession` (Tiket Masuk Ujian)

- **`status`**: State Machine penentu kelangsungan status sesi ujian (`IN_PROGRESS` -> `COMPLETED`, atau dipaksa diskualifikasi secara sejuk oleh Pendidik `FLAGGED`).
- **`score`**: Kalkulasi perolehan poin mutlak akhir yang tertulis secara independen sesaat sesudah pengumpulan `POST /api/exams/submit`.

### 5. `ProctorLog` (Ledakan Tsunami Audit Forensik)

Arsip penggelaran interupsi pelanggaran. Menyimpan historis kejahatan proctoring:

- **`eventType`**: Jenis penyelewengan (_Tab, Blur, Focus, Fullscreen_).
- **`details`**: Konteks anomali (Deskripsi metadata, kronometri).
- **`evidenceUrl`**: Tautan mutlak media barang bukti (`/uploads/{video_id}.webm` atau `.jpg`). Diambil dari tangkapan pelapor kamera sisipan klien ketika peringatan dilesatkan.

---

> _**Catatan Keselamatan**: Data rahasia kandidat seperti `password` telah diasimilasikan algoritma asimetrik kuat (Bcrypt) pra-insersi lewat lapisan konfig DB prisma middleware (bun `password.hash`)._
