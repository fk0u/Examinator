# 8. QA & Testing Strategy (Test Plan)

Rencana Pengujian (_Test Plan_) ini disusun oleh tim Quality Assurance untuk mengevaluasi fungsionalitas dan uji penetrasi batas sistem Examinator SaaS. Strategi pengujian dibagi menjadi 4 matriks vertikal.

---

## 1. Unit & Integration Testing (Backend - Bun/Elysia)

Target dari uji ini adalah jaminan mutu stabilitas per-module di isolasi.

| Area Uji          | Kasus Ulang (Test Case)                                                                                                            | Ekspektasi                                                                                                | Prioritas |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :-------- |
| **Auth Guard**    | Pengiriman GET ke `/api/auth/me` tanpa memberikan token JWT.                                                                       | Server mengembalikan Status HTTP Code `401 Unauthorized` & Payload JSON tolak balak.                      | KRITIS    |
| **Auth Register** | Registrasi dengan format _password_ yang dikirim telanjang.                                                                        | Kolom `password` di DB Prisma **HARUS** dalam format enkripsi Hash bcryptjs (Mencegah plain-text log).    | KRITIS    |
| **Prisma Upsert** | _Post_ rute `/api/attempts/:id/answer` menggunakan _optionId_ dan _questionId_ ke tabel yang sama 2 kali berurutan berturut-turut. | Relasi record Jawaban (`Answer`) tidak menjadi ganda (_duplicate_), record yang tua ditimpa dengan mulus. | TINGGI    |
| **RBAC Logic**    | Akun di-_role_ sebagai `STUDENT` memaksakan metode penghapusan DELETE ke rute CRUD `/api/exams/1`.                                 | Akses dihalau menggunakan `403 Forbidden Access`.                                                         | KRITIS    |

---

## 2. E2E (End-to-End) & Fungsional UI (Frontend - Qwik)

Menjembatani pengujian skenario fungsionalitas murni yang meniru tingkah laku (behaviour) pangguna nyata pada peramban/klien ujian siswa.

| Skenario Alur Pengguna   | Prosedur Simulasi                                               | Indikator Keberhasilan (Pass Criteria)                                                                                                                               |
| :----------------------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Timer Auto-Submit**    | Pengurangan waktu ujian dari sisa _10 detik_ hingga _0_.        | Pada jeda angka `00:00`, peramban perantara (_Hook Timer_) meneruskan API panggil submisi `/api/attempts/submit` dan keluar otomatis menuju riwayat dashboard siswa. |
| **Responsif Form Login** | Tampilan dipersempit ke resolusi mobile (375x812px - iPhone X). | Struktur elemen form Flexbox Glassmorphism di `/client/src/routes/index.tsx` menyesuaikan diri, margin utuh, tidak ada geseran _overflow horizontal_.                |
| **State Persistency**    | Mere-fresh (F5) halaman Ujian Siswa di tengah pengerjaan.       | Data Jawaban Pilihan Ganda kembali terekstrak dari state (Persisten), tak ada yang raib kembali keruh.                                                               |

---

## 3. Heuristic Anti-Cheat Validation (Integrasi Modul Proctoring)

Bagian ini divalidasi dengan sangat spesifik terhadap penyusup perangkat lunak peramban nakal atau kecerobohan OS. Pengujian secara asertif melalui peramban uji terpisah.

| Trigger Simulasi    | Validasi Respon Klien (_Frontend Emit_)                                                                                 | Validasi Sinkronisasi WS Admin / Dashboard                                                                                                  |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Minimize Window** | Memantik _Event_ Hook DOM `visibilitychange` sekonyong-konyong.                                                         | Modul klien siswa bereaksi `Peringatan: Berpindah Tab/Keluar Tab`. Modal overlay merah bergetar muncul.                                     | Parameterisasi tabel Dashboard Admin _Online Table_ meloncat (_Trigger Emit_) persekian milidetik yang sama menjadi Status **🔴 Ditandai**. Angka hitung pelanggaran (+1). |
| **Webcam Denial**   | Menghentikan paksa perizinan (_Revoke_) blok opsi kamera web Chrome dari status Diizinkan menuju Dimatikan (_Blocked_). | Indikator status `useVisibleTask` kamera (`cameraEnabled.value = false`) dan memperlihatkan logo lencana 📷 OFF di bagian atas ujian siswa. | Bar dasbor bagian rekap statistik Proktor `"📷 Kamera OFF"` secara eksklusif angka numerik ikut terdongkrak seketika via event bus.                                        |

---

## 4. Performance & Stress Load Benchmarking

Evaluasi _Throughput_ dari arsitektur Runtime "Elysia.js Bun.js Engine" + "uWebSockets native".

1. **Simulasi Ratusan Beban (_Load Spike_):**
   - Pemanfaatan kakas _k6_ atau _Apache JMeter_ (_Stress Tool_).
   - Menembakkan 5,000 requests per sekon (RPS) terhadap endpoint JWT Login yang ringan `/api/health` untuk mengkurva seberapa rendah alokasi memori VPS saat koneksi dibanjiri tanpa Henti.
   - **DoR Evaluasi**: API Web mestimasi memuati di bawah latensi maksimal `~25 milidetik`, tidak ada interupsi dan tanpa "502 Bad Gateway".

2. **WebSocket Penetrasi Multiplexer:**
   - Script _headless_ yang membuka koneksi spesifik WS Ujian (300 channel siswa berbarengan, mensimulasi penghentakkan sinyal API Pindah Tab).
   - **DoR Evaluasi**: 300 Pijar notifikasi _Live Feed_ Alarm Ticker yang dirender pada Dashboard Proktor _UI loop_ tidak menyumbat RAM Chrome Klien Admin (Tidak berujung pada Page Freeze berkat manipulasi V-DOM hemat).
