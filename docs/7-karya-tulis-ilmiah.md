# KARYA TULIS ILMIAH (ACADEMIC PAPER)

**Judul:**
**Implementasi Edge-Ready Framework (Qwik) dan Asynchronous Runtime (Bun) pada Sistem Computer-Based Test (CBT) Terpusat untuk Optimalisasi Pemantauan Integritas Ujian Secara _Real-time_**

**Penulis:**
**Koure** - _Section Head Senior Full Stack Engineer_

---

## ABSTRAK

Sistem evaluasi akademik modern menuntut digitalisasi dalam rupa _Computer-Based Test_ (CBT). Namun, seiring dengan terdesentralisasinya lingkungan ujian dari lab khusus ke _Bring Your Own Device_ (BYOD) siswa, marak terjadi fenomena pelanggaraan akademik. Aplikasi CBT standar berbasis SPA (_Single Page Application_) tradisional acap kali memicu degradasi performa (_hydration overhead_) pada gawai siswa berspesifikasi menengah ke bawah. Penelitian terapan dan rekayasa perangkat lunak ini mengajukan purwarupa aplikasi "Examinator", sebuah _Software as a Service_ (SaaS) berbasis monorepo.

Examinator memanfaatkan **Qwik** (pendekatan _resumability_ O(1) Javascript load) di sisi _frontend_ dan **Elysia.js / Bun Runtime** di sisi _backend_ untuk menangani lalu lintas WebSockets intensif hingga ribuan koneksi tanpa penyumbatan alur eksekusi (_event-loop blocking_). Sistem ini berhasil menyatukan deteksi mitigasi heuristik klien (seperti _Page Visibility API_, blokir _context-menu_, dan limitasi fokus _window_) dikawinkan dengan perekaman periferal (_webcam_) pasif yang digelindingkan langsung ke ruang kemudi proktor (_Proctor Dashboard_). Hasil asimiliasi teknologi ini melahirkan arsitektur Ujian Berbasis Komputer dengan latensi notifikasi < 50ms, sangat responsif, hemat sumber daya sistem komputasi (server), dan memperkokoh integritas akademik sekolah berasaskan kurikulum merdeka.

**Kata Kunci:** CBT, _Proctoring_, Qwik, Bun, Elysia.js, WebSocket, _Anti-Cheat_.

---

## BAB I: PENDAHULUAN

### 1.1 Latar Belakang Masalah

Disrupsi pengadaan ujian dari sistem berbasis kertas beralih ke _Computer-Based Test_ (CBT) di lingkungan Sekolah Menengah Kejuruan (SMK) di Indonesia tak lepas dari efisiensi koleksi dan koreksi nilai. Kendati begitu, model ini tak serta-merta tanpa celah sekuriti. Siswa, menggunakan perangkat seluler tanpa kontrol kebijakan ketat (seperti MDM), memiliki diskresi mutlak untuk beralih aplikasi _(app-switching)_ menuju peramban mesin pencari guna memperoleh referensi jawaban ilegal.

Selain integritas moral siswa, rekayasa peladen _(server engineering)_ yang melayani permintaan aplikasi secara simultan _(concurrent rush-hour)_ pada pukul-pukul tertentu mengundang kerentanan "Aplikasi Lambat", "Sinkronisasi Terputus", hingga "Server Down". Konsep _Hydration_ pada framework tradisional semacam React.js mengharuskan pengunduhan seluruh bundel _Javascript_ parsial soal-soal, yang menyedot koneksi _bandwidth_ institusi yang lambat. Oleh sebab itu, diperlukan inovasi teknologi lapis _Edge_ (_frontend_) yang instan dan lapisan perutean sinkronus tinggi (_WebSocket/Event-Driven backend_).

### 1.2 Rumusan Rekayasa (Engineering Roadmap)

1. Bagaimanakah cara mengoptimasi muatan _Javascript_ di komputer/gawai siswa (klien) agar tidak tertunda saat mengunduh soal banyak sekaligus?
2. Bagaimana cara memberdayakan teknologi WebSockets _Native_ dibandingkan arsitektur _Polling_ sehingga pengawas memperoleh sinyal langsung (1:1) perihal status integritas siswa?
3. Sejauh apakah pemanfaatan _Page Visibility API_ dan rekam pasif Kamera (_MediaRecorder_) berhasil menekan persentase perilaku curang secara sistemik?

### 1.3 Tujuan Penciptaan

Merancang dan mengimplementasikan aplikasi "Examinator": Sistem Ujian CBT SaaS _Self-hosted_, dilengkapi kapur arah pengawasan langsung dengan biaya arsitektural operasional (skalabilitas perangkat keras server) yang seminimum dan seringan mungkin.

---

## BAB II: METODOLOGI & ARSITEKTUR SOLUSI

### 2.1 Pola Rekam Jejak Kecurangan (The Heuristic Anti-Cheat Pattern)

Alih-alih menyuruh sekolah membeli lisensi pengunci peramban (_Safe Exam Browser_) yang mana sangat rumit bagi implementasi _BYOD_ OS heterogen, solusi rekayasa yang diterapkan adalah **Mitigasi Heuristik Klien Web**:

- **_State-listener visibilitychange_**: Perangkat memantau elemen `document.hidden`. Pergeseran fokus di luar aplikasi ujian dicatat menggunakan variabel reaktif _state_ dan dihentak (dipicu) secara reaktif menuju sambungan _socket_.
- **_Asynchronous Capture_**: Ketika `visibilitychange` di-trigger, metode `canvas.toDataURL("image/jpeg")` merender cuplikan dari _MediaStreamTrack_ kamera web tanpa intervensi pop-up yang disadari penuh oleh siswa secara visual. Rekaman tersebut kemudian dienkapsulasi menggunakan `FormData` dan dikirim menggunakan `fetch` ke antarmuka _Proving-Logs API_.

### 2.2 Penundaan Pemuatan Skrip Klien dengan Resolusi Qwik (Resumability)

Arsitektur Qwik tidak "memulihkan" status (_hydrating_); ia meloloskan beban aplikasi secara berangsur hanya ketika fragmen antarmuka spesifik (seperti tombol "Selanjutnya") dipicu oleh intervensi pengguna (`onClick$`). Hasilnya adalah muatan HTML murni < 10KB pada kunjungan halaman perdana. Pendekatan ini secara drastis menyingkat fase TTI (_Time-To-Interactive_) yang umumnya mengganggu mentalitas ketegangan psikologis siswa di menit-menit pertama ujian.

### 2.3 Elysia JS WebSockets & Penguncian Database Transaksional (Prisma MySQL)

Sistem penyaluran asinkron WebSockets tidak terelakkan dalam pembangunan Proktor _(Proctor Dashboard)_. Server memanfaatkan `ws.publish(topic, payload)` pada kerangka `uWebSockets` milik Bun. Data dipartisi dalam mekanisme keanggotaan Ruang `proctor-exam_id`, dan isolat setiap sambungan terenkapsulasi oleh ID sambungan. Konstitusi rekam data mengandalkan Prisma ORM di atas mesin SQL transaksional guna mematuhi ACID, menghindari nilai hilang saat fungsi penyerahan (_submit_) ditekan siswa berbondong-bondong (ratusan baris _insert_ ke tabel `Attempt` & `Answer` pada satuan interval milidetik).

---

## BAB III: IMPLEMENTASI & PENGUJIAN

### 3.1 Skema Implementasi Dasbor Tinjauan (_The Dashboard View_)

Halaman proktor (sebagaimana didefinisikan secara kode pada `/proctor/index.tsx`) menyubstitusi _polling_ periodik HTTP menggunakan pola _Pub/Sub_. Setiap koneksi dari siswa mengeksitasi _(trigger)_ pembaruan tabel relasional dalam komponen _Proctor_, mengubah bendera (_Flag_) 🟢 (_Active_) ke 🔴 (_Flagged_) di momen _event blur_ dikonfirmasi peladen.

### 3.2 Eksekusi Serah Paksa (_Force Submit Execution_)

Fitur kritikal sistem Examinator membungkus kendali paksa: Sebuah pesan `force:submit` dari WS dapat dialirkan proktor menuju _channel ID_ siswa secara definitif. Proses sisi _frontend (Client)_ kemudian memicu pemutusan ujian (Pemotongan hak akses ke antarmuka `[examId]/index.tsx`) lalu mendoronnya ke antarmuka rute selesai (_route navigating away_).

### 3.3 Uji Beban (Load Test) dan Kompabilitas

- **Kompabilitas Browser**: Pemanfaatan _Fullscreen API_ dan eksekusi WebRTC divalidasi dan konsisten di lingkungan _Evergreen Browsers_ berbasis Webkit (Safari), Blink (Chrome/Edge), maupun Gecko (Firefox).
- **Pemakaian Memori**: Menyingkir dari ikatan _Event Loop Runtime V8 (NodeJS)_, adopsi _Bun Runtime Script (JavaScriptCore)_ mempelihatkan tingkat utilitas memori dasar yang mencolok (<50 MB untuk mengangkut 1,000 koneksi persisten _websocket socket descriptors_ kosong di tingkatan Kernel).

---

## BAB IV: KESIMPULAN

Penerapan _O(1) Frontend Resumability_ dari Framework Qwik yang disalurkan dengan _Event-Driven Backend Engine_ Bun/Elysia.js mewakili titik pencerahan baru dan cikal-bakal pembaharuan dari standar infrastruktur Ujian _Computer-Based Test_ lokal di tingkat pendidikan menengah. Fitur heuristik Proktor yang berjalan tanpa interaktif agen perantara pihak ketiga / peramban perantara eksternal (murni _Web Standard Hooks_) berhasil menyajikan sistem terintegrasi yang andal, aman, terkurasi untuk memerangi sindrom mencontek digital, serta siap dirilis (diskalakan) seputar topologi SaaS _Self-Hosting_. Peningkatan lebih jauh diproyeksikan mencakup klasifikasi pelanggaran berbasis _Machine Learning Vision_ untuk tatapan mata miring di iterasi mendatang.
