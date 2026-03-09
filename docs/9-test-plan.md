<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nQA+%26+Testing+Strategy&font=Montserrat" alt="QA Test Plan Banner" />
</p>

# 9. QA & Testing Strategy (Test Plan) 🧪

Rencana Pengujian (_Test Plan_) ini disusun oleh tim Quality Assurance untuk mengevaluasi fungsionalitas dan uji penetrasi batas sistem Examinator SaaS. Strategi pengujian dibagi menjadi 4 matriks vertikal.

---

## 1. Uji Fungsional Unit Komponen Modular (Unit Unitary & API Isolation)

- **Parameter Pengujian Beban Backend (_API Route Sandbox_)**:
  Menyemprotkan iterasi simulasi pengiriman ratusan parameter bodong (_Mock payloads_) dan input injeksi rentan langsung diarah ke Rute Titik Masuk `POST /api/exams` atau `POST /api/auth/login`.  
  _Target Penerimaan_: Elysia Validator `t.String()` harus mencekik, menolak input kosong, membuang input SQLi, dan melempar sisa eksepsi Status HTTP `400 Bad Request` stabil.
- **Komponen Fungsional Lapis Atas (_Qwik UI Render Integrity_)**:
  Pengujian isolasi pemuatan grafik CSS halaman Utama (_Login/Register_). Komponen interaktif _Submit Button_ dilarang meledak (crash/unclickable) biarpun koneksi internet asinkron lambat _(3G throttling)_.

## 2. Uji Integrasi Logika Berantai (E2E / End-To-End Workflows Pathways)

Mereproduksi skenario turunan pengguna tulen di arena maya dari titik hulu merambat menuju hilir tanpa putus sinkron.

1. **Flow Proktorisasi Valid**:
   `[Siswa Login] -> [Klik Ujian MTK] -> [Baca Tata Tertib] -> [Kamera Menyala API Akses Izin Ok] -> [Mengerjakan Soal 1...2...3] -> [Tebak Skor & Klik Simpan (Submit Exam)]`.
2. **Kalkulator Asimiliasi Basis Data**:
   Angka skoring terakhir Paska penutupan wajib bersayap komparasi sama persis dengan angka simulasi kalkulasi di Tabel _Prisma UserExamSession.score_.

## 3. Matriks Pengujian Skenario Kecurangan Absolut (The Proctored Adversarial Simulator) 🕵️

Mencubit limit eksploitasi sensor sistem dengan melancarkan "Gaya Culas Pelajar Penipu". Parameter wajib Ujikaji lolos anti-cheat:

| Aksi Provokasi Curang (Adversarial Vector)          | Ekspektasi Mitigasi Sistem Murni (Pass Criteria)                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| _Tab Switching_ / Minimize Window Browser           | Klien meneriakan status event curang lewat pelongsor rute websocket `CHEATING_FLAG_TAB_AWAY` detik itu juga.                                      |
| Memakai _Screen capture tool_ di _background_       | Event `window.blur` menyala, Merekam cuplikan media rekaman kamera lalu dikirim `/uploads` dan melampirkanya ke entiti tabel _ProctorLog_.        |
| Menekan Lari Paksa `Esc` kelur _Fullscreen_         | Muncul peringatan pemblokan akses tes raksasa (Overlay blokir UI).                                                                                |
| Diskoneksi jaringan tiba-tiba (Sabotase kabel Wifi) | Nilai skor poin sementara tersokong sistem simpan _State_ jawaban dan re-sinkronisasi lancar ketika internet pulih bertaut kembali ke Server WSS. |

## 4. Uji Pemukulan Beban Ekstrem Bertubi (Stress & Load Burn-In Test) 🚀

Platform skala provinsi (_SaaS Multi-Tenant_) takkan kompromi di kala lautan pelajar masuk portal di menit 08:00 AM serempak.

- **Kapasitas Sasar Serangan (Artillery WebSocket Test)**: Penetrasi serbuan `5,000` mesin _socket client dummies_ ke kordinat `ws://localhost:8080/ws/proctor`.
- **Indeks Kelolosan Evaluasi (Acceptance Treshold)**: Bun.js Runtime server Wajib tegar berdiri (Zero TCP Connection Dropped) dan menahan kebocoran Memori (No OOM - Out of Memory exception panic) serta mempertahankan perputaran denyut transmisi proctoring stabil dibawah indeks kelambatan `50ms`.

Integritas dijamin 100%. Tak Perlu Takut Gagal Saat Terjun Perang Ke Dunia Nyata! 🛡️
