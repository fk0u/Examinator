<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nAPI+Reference+%26+Documentation&font=Montserrat" alt="API Reference Banner" />
</p>

# 4. API Reference 🔌

API dikembangkan secara murni di atas _framework performance-oriented_ **Elysia.js** dengan _prefix namespace_ `/api`.
Semua API yang dikategorikan terproteksi (Private) memerlukan header asimetrik: `Authorization: Bearer <JWT_TOKEN>`.

---

## 🔒 Authentication API

### `POST /api/auth/register`

Mendaftarkan entitas pengguna pelajar/pengajar baru di dalam pangkalan eksistensi pangkalan (_Database_).

- **Body Request**:
  ```json
  {
    "email": "siswa@smk.id",
    "password": "strongPassword123",
    "name": "Budi Raharjo",
    "role": "STUDENT"
  }
  ```
- **Response**: `200 OK` (Berisi parameter otorisasi _Token JWT_ siap pakai).
- **Validasi Rute**: Memverifikasi duplikasi format unik `email` sebelum inisialisasi penyimpanan.

### `POST /api/auth/login`

Pertukaran kredensial otentifikasi.

- **Body Request**: `{ "email": "admin@smk.id", "password": "root" }`
- **Response**: `200 OK` (Penyandian penyerahan variabel pengaman Token Bearer JWT berbatas limitasi kedaluwarsa waktu _Expires in 7 Days_).

---

## 📚 Exam API

_(Rute membutuhkan Bearer Token Header)._

### `GET /api/exams`

Mengunduh daftar paket ujian terbuka.

- **Query Params**: Berpotensi menangkap rincian filter pagination yang dialokasikan di URL Parameters.
- **Response**: JSON Array katalog daftar `<Exam>[]` (Tidak membuka kunci jawaban `Question.correctAnswer`).

### `GET /api/exams/:id`

Melakukan pengikatan detail struktur komplit paket Ujian beserta baris-baris daftar isian instrumen tes pertanyaan objektif (_Questions_).

### `POST /api/exams`

_(Hanya Otorisasi Role = `ADMIN`)_
Mendesain paket ujian kurikulum anyar beserta kompsisi soal utuh.

- **Body Request**:
  ```json
  {
    "title": "Ujian Akhir Semester Fisika",
    "description": "Fisika Kuantum & Dinamika Rotasi",
    "startTime": "2026-03-09T08:00:00Z",
    "endTime": "2026-03-09T10:00:00Z",
    "duration": 120,
    "questions": [
      {
        "content": "Hukum Gaya...",
        "options": ["A", "B"],
        "correctAnswer": "A",
        "points": 10
      }
    ]
  }
  ```

---

## 👁️‍🗨️ Validasi Proctoring (Real-Time Websockets)

Sebagai pondasi pemantauan kecepatan sub-milidetik, Elysia.js memperdayakan modul infrastruktur Bun uWebSockets C++. Kanal di bawah ini mengedarkalkan matriks trafik telemetrik kepada sentra administrator tanpa henti (_Streaming_).

### `WS /ws/proctor`

- **Protokol**: Standar murni Websockets (diakses via objek natif browser `new WebSocket('ws://localhost:8080/ws/proctor')`).
- **Autentikasi Saluran Akses**: Modul pengeksekusi mensyaratkan pelampiran argumen `token` di barisan url string (`?token=JWT...`) demi membuka palang pembatas validasi interaksi logis.

**Tumpuan Mekanisme Lalu-Lintas Pesan (Message Payload Syntax)**

1. **Format Pelaporan Klien (Pengiriman Peserta):** Pelajar menyetorkan jejak digital manakala menyangkut skema pelanggaran disiplin.
   ```json
   {
     "type": "CHEAT_EVENT",
     "data": {
       "sessionId": "usr_exam_ses_123",
       "eventType": "TAB_SWITCH",
       "details": "Peserta Alt-Tab ke jendela Brave Browser (Google Search).",
       "evidenceUrl": "/uploads/video_evd_001.webm"
     }
   }
   ```
2. **Format Transmisi Balik Kanal (Penerimaan Admin Observer):** Siaran perbanyakan multikast (Pusat `WS.publish` mentransmisikan replika bukti logikal menuju koneksi terowongan _live-feeds_ komputer Pendidik).

---

## 📁 Barang Bukti Multimedia API (_Evidence Pipeline_)

### `POST /api/upload`

Meneruskan muatan aliran bit video (_Blob File Stream_) kamera menuju wadah penyimpanan persisten `uploads/` peladen sentral.

- **Form Data**: `file` (Menampung serpihan blob klip rekaman 3-detikan Webcam berekstensi mp4/webm paska dicetuskan oleh perlakuan anomali Proctoring Blur Event).
- **Response**: `200 OK { url: "/uploads/unqHsh_12948.webm" }` (Alamat string _Relative path_ disuntikkan menyatu ke barisan laporan `evidenceUrl` entiti `ProctorLog`). Pusat tidak memperbolehkan klien tamu secara sembarang mengakses direktori berpasif membedah baris kode tersebut tanpa kredensial kuat.
