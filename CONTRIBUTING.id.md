<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nPedoman+Kontribusi&font=Montserrat" alt="Contributing Banner" />
</p>

# Berkontribusi pada Examinator 🤝

Pertama-tama, terima kasih banyak telah mempertimbangkan untuk berkontribusi pada **Examinator**! Komunitas seperti Anda-lah yang membuat Examinator menjadi alat inovatif pelopor pendidikan digital dan pengawasan (proctoring) Ujian CBT yang aman.

Dengan mengikuti panduan ini, Anda menghargai waktu para kontributor inti dan _maintainer_ yang mengelola proyek sumber terbuka ini. Sebagai gantinya, mereka akan membalas rasa hormat itu dengan membantu merespons masalah (issue) Anda, mengulas kode, dan memuluskan penyelesaian _Pull Request_ (PR) Anda.

## 🧠 Dasar Arsitektur Proyek (Primer)

Sebelum menyentuh baris kode, pastikan Anda memahami _tech stack_ kami:

- **Frontend**: Framewrok Qwik (Hybrid SSR/SSG dengan pemulihan _resumability_ ekstrem) didukung Tailwind CSS v4.
- **Backend**: Bun Runtime menggunakan _library router_ Elysia.js + infrastruktur koneksi _native uWebSockets_.
- **Database**: Prisma ORM diikat ke dalam MySQL.

Kami menerapkan strategi berbasis _Monorepo_. Silakan merujuk ke folder instruksi `docs/` guna menggali pemahaman mengenai landasan-landasan arsitektur kami lebih dalam.

## 🛠 Alur Kerja Pengembangan (Workflow)

### 1. Pembelahan (Fork) & Kloning (Clone)

1. Fork proyek (repo) di platform GitHub.
2. Salin _Fork_ tersebut secara lokal ke perangkat PC/Server lokal.
3. Pertahankan sinkronisasi jarak jauh (_Upstream Remote_) menuju repositori asli kami.

### 2. Memutar Mesin Lokal

```bash
npm install
npm run db:push
npm run dev
```

### 3. Startegi Percabangan (Branching)

Kami menggunakan model percabangan yang ketat. Jangan pernah merapatkan _commit_ secara langsung (_Direct Push_) ke cabang utama `main`. Selalu manfaatkan cabang buatan baru (_New Branch_) apabila anda tergerak memperbaiki masalah teknis (_bugs_) atau mengembangkan kapabilitas (_feature_):

- Fitur (Features): Gunakan prefiks `feat/nama-fitur-anda` (Contoh logis: `feat/facial-recognition`)
- Perbaikan Rusak (Bug Fixes): Prefiks `fix/nama-perbaikan` (Contoh logis: `fix/websocket-reconnect`)
- Beban Kerja Biasa (Chores/Docs): `chore/dependency-updates` atau subjeck penulisan `docs/update-api-spec`

### 4. Kaidah Pencatatan Perubahan (Conventional Commits)

Kami mewajibkan setiap kontribusi mematuhi **Conventional Commits**. Disiplin pembukuan historis ini bersifat esensial (krusial) mengotomatiskan generator `CHANGELOG` log rilis dan mengatur angka versi semantik (_Semantic Versioning_) sistem kami.

**Pola Format**: `<jenis-tipe>(<lingkup-cakupan>): <subjek-pernyataan>`

**Contoh-contoh Semantik**:

- `feat(proctor): tambahkan fitur pendeteksi audio kepada *anti-cheat hooks*`
- `fix(auth): perbaiki ketidakselarasan zona waktu batas masa kadaluarsa JWT`
- `style(ui): perbarui efek *blur backdrop filter* gaya *glassmorphism* di kartu utama`
- `refactor(db): mengoptimalkan kapasitas muat (*throughput*) perihal kuiri kueri pangkalan data`

### 5. Standardisasi Mutu Kode (Code Quality)

- **TypeScript**: Ketatkan deklarasi alias menggunakan `tipe` ketat. Hindari penulisan entitas parameter primitif `any` dalam kondisi apapun. Manfaatkan generasi kelas bawaan/bantuan ORM Prisma guna lalu-lintas lintas-pemetaan pelbagai tabel database.
- **Styling**: Tampilan CSS pada Qwik komponen WAJIB bersandar utilitas atom kelas modular Tailwind v4. Jangan deklarasikan style inline.
- **Linting**: Periksa kode buatan Anda via instruksi pamungkas `npm run lint` untuk menetralisir _warnings_ dan potensi degradasi.
- **Pengujian (Testing)**: Kalau seandainya melahirkan API Rute _Endpoint_ di Elyisia.JS baru (_NEW_), perkuat pula pembuktian kode unit uji (parameter percobaan integrasi stress-test beban api).

## 🚀 Mengajukan Proposal Gabungan (Pull Request / PR)

1. **Rebase**: Sebelum dilepas (_Push_), sejajarkan perbaharuan dengan menarik jejak _rebase_ terbitan `main` (supaya anti bentrok selisih barisan file gubahan).
2. **Push**: Dorong cabang draf milikmu menju repositori percabangan _Fork_ milik pribadi Anda.
3. **Buka Laman PR (Open PR)**: Berpindahlah mengunjungi halaman GitHub Induk _Examinator_ dan gagaslah tekan tombol hijau interaktif "New Pull Request".
4. **Deskripsi Teksual**: Elaborasikan kegunaan PR lewat rujukan template dengan komplit. Beritahu kenapa modul tambahan itu memecahkan kebuntuan dengan korelasi isu tercantum (misalnya: referensi #123).
5. **Ulasan Berkala (Review)**: Para pemelihara (_Core Maintainer_) kode inti senantiasa sedia me-review proposal sintak barisan skrip yang engkau sodorkan. Ingat-ingatlah tiada tendensi sentimen personal dalam evaluasi; kita seyogyanya saling terpacu pada dedikasi keunggulan teknis. Evaluasikan perbaikan seturut instruksi balasan rekan pelaksana.

## 🐛 Tata Cara Pelaporan Permasalahan Fatal (Bugs)

Perkara disfungsi sistem (kegagalan memproses instruksi perangkat lunak) akan ditelusuri melewati kanal Pelaporan Masalah GitHub (_Issues tracker_). Kriteria pelaporan bug bermutu WAJIB melampirkan isian:

- **Penggunaan Templat Bug Bawaan**: Paparkan arsitektur _OS_, tipe/versi Mesin Rambah Peramban Browser, dan tahap per tahap urutan berjangkitnya kegagalan aplikasi yang sanggup dicoba ulang oleh tim teknisi dalam kondisi identik.
- **Kepala Judul Deskriptif (Clear Title)**: Tulis ringkasan esensial permasalahan ke dalam sebuah kalimat.
- **Laporan Visual Tangkapan Gambar/Log Diagnostik Peringatan**: Jangan membiarkan kita meraba tanpa tuntunan petunjuk; serahkan foto konsol browser alat inspeksi, riwayat jejak pesan (Server Trace), atau lampiran videografi bilamana yang janggal terkait tampilan User-Interface/GUI Klien Siswa/Admin.

## 💡 Mencetuskan Rekomendasi Fitur (Proposing Enhancements)

Konsep inovatif akan diformulasi terdedikasi pula menjadi kategori lembar laporan _GitHub Issues_:

- Presentasikan argumentasi mengapa kapabilitas pemutakhiran ekstensi itu rasional dan secara universal diimpikan jutaan insan pengguna sekolah mayoritas, dan bukan khayalan skenario kegunaan langka nan menyimpang/ _niche edge-cases_.
- Sajikanlah barisan cetak biru bayangan kode semu, kerangka gambar visual maket purwarupa (_wireframes_).

Terima Tentu Kasih Atas Segudang Dedikasi Berperan Menjaga Ketangguhan Masa Depan Digital Pendidikan! 🎓
