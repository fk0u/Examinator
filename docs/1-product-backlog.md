# 1. Product & Sprint Backlog

Dokumen ini mendefinisikan visi produk, target pengguna, dan daftar fitur (User Stories) yang disusun menggunakan metodologi Agile (Scrum).

## 🎯 Visi Produk (Product Vision)

Menciptakan platform Computer-Based Test (CBT) yang sangat cepat, ringan, dan aman untuk mencegah kecurangan, didesain khusus untuk memenuhi kebutuhan SMK di Indonesia yang menerapkan Kurikulum Merdeka.

## 👥 Target Pengguna (User Personas)

1. **Admin Sekolah**: Mengelola data utama (Siswa, Mata Pelajaran, Ujian, Soal).
2. **Operator (Proctor/Pengawas)**: Memantau jalannya ujian secara langsung (realtime), menindaklanjuti peringatan kecurangan.
3. **Siswa**: Menjalani ujian dengan antarmuka yang responsif, stabil, dan minim distraksi.

---

## 📋 Product Backlog & Sprints

Pembangunan Examinator dibagi menjadi **3 Sprint Utama** (masing-masing 1 minggu).

### Sprint 1: Core Engine & Basic Detection (MVP)

**Fokus:** Membangun fondasi utama CBT dan deteksi dasar.

| ID  | User Story                                                                                            | Role    | Priority | Status  |
| :-: | :---------------------------------------------------------------------------------------------------- | :------ | :------- | :------ |
| US1 | Sebagai **Admin**, saya ingin mengatur daftar ujian dan soal (CRUD).                                  | Admin   | P0       | ✅ Done |
| US2 | Sebagai **Siswa**, saya ingin login dan melihat daftar ujian saya.                                    | Siswa   | P0       | ✅ Done |
| US3 | Sebagai **Siswa**, saya ingin mengerjakan ujian dengan timer dan auto-save.                           | Siswa   | P0       | ✅ Done |
| US4 | Sebagai **Proktor**, saya ingin sistem mendeteksi perpindahan tab (Page Visibility).                  | Proktor | P0       | ✅ Done |
| US5 | Sebagai **Proktor**, saya ingin sistem mendeteksi apabila siswa keluar dari layar penuh (Fullscreen). | Proktor | P0       | ✅ Done |

### Sprint 2: Realtime Proctoring & Camera

**Fokus:** Pemantauan langsung dan pencegahan kecurangan berbasis perangkat keras.

| ID  | User Story                                                                                                       | Role    | Priority | Status  |
| :-: | :--------------------------------------------------------------------------------------------------------------- | :------ | :------- | :------ |
| US6 | Sebagai **Siswa**, saya harus memberikan izin kamera untuk memulai ujian.                                        | Siswa   | P0       | ✅ Done |
| US7 | Sebagai **Proktor**, saya ingin melihat dashboard dengan Websocket untuk memantau ratusan siswa secara langsung. | Proktor | P0       | ✅ Done |
| US8 | Sebagai **Proktor**, sistem harus menghentikan (_Force Submit_) ujian secara otomatis jika waktu habis.          | Proktor | P1       | ✅ Done |
| US9 | Sebagai **Admin**, saya dapat melihat ringkasan status semua ujian (aktif/nonaktif).                             | Admin   | P1       | ✅ Done |

### Sprint 3: Analytics & Polish

**Fokus:** Rekapitulasi, UX micro-animations, dan optimalisasi.

|  ID  | User Story                                                                                                            | Role    | Priority | Status  |
| :--: | :-------------------------------------------------------------------------------------------------------------------- | :------ | :------- | :------ |
| US10 | Sebagai **Admin**, saya dapat memonitor total pelanggaran/cheat lewat ringkasan statistik.                            | Admin   | P1       | ✅ Done |
| US11 | Sebagai **Proktor**, saya ingin sidebar _Live Alerts_ yang menampilkan notifikasi pelanggaran secara _ticker_.        | Proktor | P2       | ✅ Done |
| US12 | Sebagai **Pengguna**, saya ingin mendapatkan pengalaman UI yang premium dengan Glassmorphism dan transisi yang halus. | All     | P2       | ✅ Done |

---

## 📈 Kriteria Penerimaan (Definition of Done)

1. **Fungsional**: Fitur berjalan sesuai User Story tanpa _fatal bugs_.
2. **Kinerja**: Waktu loading UI < 1 detik (berkat Qwik).
3. **Keamanan**: Endpoint dilindungi oleh JWT Middleware.
4. **Desain**: Sesuai dengan spesifikasi Tailwind v4 (Dark Theme & Glassmorphism).
