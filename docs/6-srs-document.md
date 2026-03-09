# 6. Software Requirements Specification (SRS)

**Dokumen Standar IEEE 830-1998 yang Diadaptasi untuk Pengembang Agile**

**Nama Proyek:** Examinator - CBT Proctoring SaaS  
**Versi Dokumen:** 1.0.0  
**Tanggal:** Maret 2026

---

## 1. Pendahuluan (Introduction)

### 1.1 Tujuan (Purpose)

Dokumen SRS ini bertujuan untuk menjabarkan spesifikasi perangkat lunak sistem _Computer-Based Test_ (CBT) "Examinator" dan fungsionalitas pengawasannya (_Proctoring_) dalam ekosistem sekolah menengah (Kurikulum Merdeka). Dokumen ini menjadi acuan mutlak _(Source of Truth)_ bagi developer, Quality Assurance (QA), dan pemangku kepentingan (_Stakeholder_).

### 1.2 Ruang Lingkup (Scope)

Sistem Examinator berfokus pada:

1. **Penyajian Soal Ujian (Delivery)**: Mesin ujian berbasis web yang tidak bergantung pada instalasi _exe_ lokal.
2. **Pengawasan Keamanan (Security)**: Modul _Anti-Cheat_ preventif (Window Blur, Fullscreen exit, Context-menu block, Kamera otomatis).
3. **Manajemen Data (Administration)**: Panel _CRUD_ untuk Ujian, User, Soal, dan Analisis Nilai.

Sistem tidak mencakup: Modul pembayaran siswa, atau fitur gamifikasi internal (untuk saat ini).

### 1.3 Referensi & Standar

- **WebRTC API**: Standar kapabilitas getUserMedia.
- **RESTful Architecture**: Prinsip desain antarmuka aplikasi.
- **OAuth 2.0/JWT**: Standar keamanan token.

---

## 2. Deskripsi Umum (Overall Description)

### 2.1 Perspektif Produk

Examinator dibangun sebagai _Self-hosted SaaS_. Oleh karena lingkungan jaringan sekolah menengah di Indonesia yang sering berhadapan dengan _bandwidth_ sempit atau _latency_ tinggi, produk ini menggunakan arsitektur pemisahan _Edge-Ready_ (Qwik UI) dan _Asynchronous Runtime_ (Bun/Elysia.js) untuk menghasilkan penggunaan memori di bawah 50MB per instance backend.

### 2.2 Fungsionalitas Produk (Product Functions)

1. **Engine Ujian**: Manajemen sesi persisten dengan _auto-save_ per tindakan.
2. **Dashboard Real-Time**: Sinkronisasi instan <50ms dari tindakan siswa ke layar _Proctor_.
3. **Perekaman Bukti**: Unggah _blob_ rekaman kamera asinkron secara pasif guna meminimalisir interupsi navigasi siswa.

### 2.3 Lingkungan Operasi (Operating Environment)

- **Client**: Modern Browser (Chrome 90+, Firefox 88+, Safari 14+) berjalan di Windows, Linux, Android, atau iOS. Wajib mendukung JavaScript ES2020.
- **Server OS**: Distribusi Linux Berbasis Debian/Ubuntu, Docker Support.
- **Server DB**: MySQL 8.0.x.

---

## 3. Persyaratan Spesifik (Specific Requirements)

_(Detail ini merupakan manifestasi dari Epics Agile menjadi spesifikasi teknis kekakuan tinggi)._

### 3.1 Fungsi Antarmuka Eksternal (External Interface Requirements)

#### 3.1.1 Antarmuka Pengguna (UI)

- Sistem **HARUS** (MUST) responsif, minimal kompatibel hingga lebar layar 320px (Mobile portrait).
- Sistem **HARUS** (MUST) menyediakan indikator visual _timer_ ujian di pojok teratas antarmuka ujian.
- Tema antarmuka (Design System) berhaluan _Dark Mode First_ menggunakan variasi skema _slate_ dan _emerald_ untuk menegaskan kontras bacaan soal.

#### 3.1.2 Antarmuka Perangkat Keras (Hardware Interfaces)

- **Kamera (Webcam)**: Klien **HARUS** mampu berinteraksi dengan periferal kamera via API `navigator.mediaDevices.getUserMedia()`. Permintaan resolusi ideal dibatasi `640x480` pada 15 fps untuk menekan penumpukan memori.

#### 3.1.3 Antarmuka Perangkat Lunak (Software Interfaces)

- **Database Connector**: Perangkat lunak berinteraksi dengan DBMS menggunakan konektor protokol Prisma berbasis TCP/IP (Port Standar 3306).
- **WebSocket Protocol**: Port wss/ws berjalan di atas port yang sama dengan HTTP lalu mengalami _Connection Upgrade_ menggunakan `uWebSockets.js` internal Bun.

### 3.2 Kebutuhan Fungsional (Functional Requirements)

1. **FR-AUTH-01**: Sistem harus memverifikasi sesi aktif menggunakan `JWTBearer` yang berlaku maksimal 7 hari.
2. **FR-CBT-01**: Pengatur waktu (_Timer_) harus dimanage di _state_ frontend dengan pencocokan absolut _Start/End Time_ dari Server (NTP Fallback) untuk menghindari modifikasi jam lokal oleh siswa.
3. **FR-PRC-01**: Modul Proctoring **HARUS** mendeteksi properti `document.hidden` ketika terjadi perubahan fokus tab browser. Jika metrik menjadi `true`, sistem menghasilkan _event_ pelanggaran.
4. **FR-PRC-02**: Saat event pelanggaran terpantik, sistem menangkap MediaStream dari kamera, mengonversi blob ke basis `image/jpeg` atau `video/webm` lalu melakukan HTTP `POST /api/cheat-logs`.

### 3.3 Kebutuhan Non-Fungsional (Non-Functional Requirements / NFR)

#### 3.3.1 Kinerja (Performance)

- **Waktu Muat (Load Time)**: Halaman aplikasi Web Qwik (TTV - _Time To View_) **HARUS** memuat di bawah 500ms pada koneksi 3G berkat mekanisme _zero-hydration_.
- **Skalabilitas Concurrency**: Server WebSockets (Bun.js) **HARUS** mampu mempertahankan minimal 2,000 koneksi persisten _idle_ dan 500 koneksi _active/message-intensive_ tanpa jeda lebih dari 0.1 detik di mesin CPU 2-Core.

#### 3.3.2 Ketersediaan (Availability) & Reliabilitas

- Menggunakan PM2 Daemon, layanan **HARUS** otomatis bangkit (_restart_) kurang dari 5 detik bila terjadi _kernel panic_ pada Node/Bun JS.

#### 3.3.3 Keamanan (Security)

- Otorisasi di tingkat rute Elysia JS **HARUS** dijalankan secara deterministik (Guard Routes) berdasarkan klaim `role`.
- Serangan Injeksi SQL tertangkal (Mitigasi Bawaan ORM Prisma via Parameterized Statements).

---

## 4. Analisis Mode Kegagalan (FMEA - Failure Mode & Effect Analysis)

| Risiko / Modul            | Mode Kegagalan                                  | Dampak                                                             | Penanggulangan (Mitigasi)                                                                                                                      |
| :------------------------ | :---------------------------------------------- | :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **Penyimpanan (Uploads)** | Disk server `uploads/` penuh akibat video siswa | Gagal menyimpan _cheat evidence_, _App Crash_ jika tidak di-catch. | Modul backend mengompresi gambar jadi resolusi rendah `.jpg`. Memberi limit video maksimum 3 detik (~200KB).                                   |
| **Websocket (WSS)**       | Koneksi siswa terputus karena sinyal HP hilang  | Proktor keliru menganggap siswa keluar.                            | WS Hook mengimplementasi _exponential backoff reconnect_ otomatis di balik layar (tidak disadari pengguna).                                    |
| **Sesi Token (JWT)**      | Cookie/Localstorage dihapus tidak disengaja     | Siswa terlempar dari ujian ke halaman login.                       | FR-CBT-01 memastikan status "IN_PROGRESS" persist di Database MySQL. Begitu siswa Login ulang, sistem langsung me-_restore_ jawaban dan timer. |

---

_Tanda Tangan & Persetujuan Dokumen SRS (Digital Signature): Koure - Chief Architect Engineer_
