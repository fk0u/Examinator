# Menyumbang Budaya Pembangunan Kod kepada Examinator

Bismillah dan sejuta penghargaan kerana anda sudi bertandang menyumbang kepada projek terbuka **Examinator**! Komuniti kognitif seperti andalah yang melonjakkan Examinator bertindak cemerlang menterjemah revolusi pendidikan digital serta kerangka ujian pengawasan (CBT) yang teramin rapi di Asia dan serantau wawasan sejagat.

Pematuhan tata kelola disiplin pengaturcaraan merujuk penghargaan secara telus terhadap perintis pengurusan induk pembangunan projek terbuka ini secara muhibah. Justeru sebagai isyarat timbal balik, krew kami rela membimbing permasalahan kod (issue), mengulas penarikan seruan PR kalian selari merapatnya interaksi kerjasama sihat murni.

## 🧠 Permulaan Senibina Aplikasi (Technical Primer)

Awas dan selidiki _tech stack_ teknologi dominan Examinator ini sebelum merekayasa bait rantaian pangkalan kod anda:

- **Lapis Muka Hadapan Klien Ujian**: Kerangka _Qwik framework_ (beracujuan gabungan hibrid SSR/SSG di persekitaran ciri pengecilan saiz melampau _resumability_) diserasikan gaya _Tailwind CSS v4_.
- **Kendalian Servis Utama Pelayan**: _Bun runtime engine_ bersendi perpustakaan prestasi muktamad Elysia.js + pacuan hubungan penjalin pantas Websocket-C.
- **Enjin Hubungan Pangkalan Data (DB)**: Prisma ORM diangkut serentak bertunjangkan enjin MySQL konvensional.

Kita mematuh ketat acuan penggabungan fail sejagat (_Monorepo_). Mohon menyemak seliaan lengkap berstatus arkitekturnal di direktori folder perindustrian komprehensif `docs/` buat pencerahan tuntas.

## 🛠 Kaedah Pembangunan Rutin (_Development Workflow_)

### 1. Cabang Klon Pembangunan (_Fork & Clone_)

1. Eksport klon berantai maya (_Fork_) di GitHub peribadi kalian.
2. Sedut (_Clone_) direktori repo virtual berkenaan terus tertanam sub-direktori terminal mesin pembina tempatan awda.
3. Sinkronasi talian rentas rujukan punca asas kod asal master Examinator menerusi tag _upstream remote_ buat keterjaminan kesinambungan terkini fail masa kini mendepani perselisihan konflik (_merging issues_).

### 2. Set Up Konfigurasi Menyeluruh Repositori Mesin Sendiri

Pangil rangkai arahan NPM terminal kod utama bagi mula tugas pengkodan awal:

```bash
npm install
npm run db:push
npm run dev
```

### 3. Pemupukan Tatalaku Modul (_Branching Strategy_)

Aktiviti kami menekankan penyusunan berlandaskan susun atur rafi disiplin. Seksa seribu satu larangan mencantum kemasukan kerja mutlak terhadap pohon pemusatan utama bernama sub direktori `main` tanpa pengamalan _branch baru_. Sentiasa menyemak cabang:

- Model Pembaikian Penambahan Fungsi: `feat/terma-baru-inovasi-pelajar-dll` (e.g., `feat/facial-recognition`)
- Model Penyelamatan Pepijat Rosak Batal (Fix Bug): `fix/nama-kerosakan-kritikal-anda` (e.g., `fix/websocket-reconnect`)
- Model Selenggara Urusan Pengagihan Pendokumentasian: Berikan penarikan _chores / docs_ (seperti : `docs/kemaskini-api-rute-baru`).

### 4. Format Kemasukan Komit Git Standard (Conventional Commits)

Sistem pembungkus muatnaik (_Semantic Version_) menagih pamatuhan etika amalan pengeksportan berformat kod _Conventional Commits_ GitHub Antarabangsa. Ianya mempermudah enjin merangkum kompilasi buku _CHANGELOG_ perisian secara layan sendiri (Automasi skalar pelancaran siri).

Standard Pemformatisasian Skrip: `<kelas-tujuan-pengolahan>(<fokus-sub-bidang-masalah>): <topik-rumusan-kerja-kod-dalam-inggeris/BM>`

**Panduan Konkret Analogi Reka Cipta Commits**:

- `feat(proctor): memasukkan rangkap amaran deteksi audio kepada pemangkin *anti-curang student hook*`
- `fix(auth): membenahi selisih *timezone* pembatalan JWT agar login tidak terbongkar pantas`
- `style(ui): menyerikan olahan CSS kekaburan tembus cahaya elemen transisi animasi pendaftaran`
- `refactor(db): mengolah sintaks enjin query mengelak sekatan pertanyaan berganda terhadap data`

### 5. Asas Jaminan Tahap Tinggi Kualiti Aturan Kod Perisian

- **TypeScript**: Pertahankan spesifikasi definisi pembolehubah statik. Elakkan sama sekali kegunaan entiti jenis `any` memendekkan skop tipografi pengaturcaraan anda. Rujuk kepada parameter autogenerasi model Entiti prisma pangkalan maklumat sedia terbina teguh.
- **Antarmuka Penstailan Visual CSS (Styling)**: Unit antaramuka berasaskan sintak hierarki gabungan fungsian Qwik merelakan hanya corak modul kependekan utiliti Tailwiind v4 semata-mata di guna (class-based CSS). Tolak tepi gaya serantau internal HTML CSS Styles selagi terdaya.
- **Pembersihan Modul Pembantu Kesalahan (Linting ESLint)**: Kesemua kod wajar melalui ketetapan semakan perakam automatik. Jalankan proses pemeliharaan amalan pemformatisasian di pangkalan terminal skrin: `npm run lint`.
- **Aktiviti Pengasingan Ujian Mutu Penilaian API Endpoint Integrasi**: Jika membina subkategori _Endpoints REST Elysia/Backend Web_ mohon salurkan juga serpihan blok unit jaminan simulasi serangan API tekanan-stres keutuhan serentak pengesanan anomali beban integrasi di pangkalan belakangnya.

## 🚀 Pelangsingan Rantaian Tarik Cantum Laporan Permintaan Cadangan (Pull Request - PR)

Sederhananya: Langkah penghuraian muktamad gabungan pembaikan (_PR Steps_):

1. **Rebase**: Mengemaskini percabangan rantai kod dengan jejak rentetan _main upstream repo_ untuk menjinak kebersilangan penolakan _conflict files_.
2. **Push**: Melonjak dorongan naik repositori penawanan rantauan cawangan (Git Push repo github / gitlab cloud origin masing-masing).
3. **Membuka Permintaan (Open PR GitHub)**: Pindah dan masuk halaman pautan tapak _Examinator_ asal kemudian mencaduk butang navigasi pengesahan hijau muda berbunyi 'New Pull Request'.
4. **Ringkasan Intisari Ulasan (PR Text Body Template)**: Berhati-hati semasa menjawab kaveat _checklist_ templat sumbangan pelbagai. Rungkai rentetan logikal rasional jawapan apa yg ditangani oleh perbaikian itu dan warta nombor tiket (_issue #123 tag link ref_).
5. **Penilaian Kolektif Panel Ulasan Pentadbir Induk Kumpulan Repositori Semakan**: Kami wakil pemelihara tegar tak henti mendepani analisis keberkesanan perubahans perisian kalian. Ini rutin sihat penaklukan kualiti elit Wakatime Leaderboard; ketepikan perasaan peribadi tatkala saranan ditolak atas asas kebersiham kejuruteraan sistemik mutlak. Betulkan semula pindaan merujuk petunjuk panel kami secepat kudrat berupaya agar merapat masa terbiar (_idle code pull merging review gap_).

Teruskan Kecemerlangan Mengemudi Komuniti Sains Inovasi Komputer Pembikinan Aplikasi Siber Bertaraf Sempurna Antarabangsa!
