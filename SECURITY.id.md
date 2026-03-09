<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/ef4444?text=Examinator\nKebijakan+Keamanan&font=Montserrat" alt="Security Banner" />
</p>

# Kebijakan Keamanan (Security Policy) 🛡️

Di organisasi **Examinator**, terjaminnya keamanan serta integritas muruah proses kelangsungan ujian merupakan prioritas tertinggi kami yang tak bisa ditawar-tawar. Kami menyikapi potensi munculnya kerentanan sistem (_Vulnerabilities_) secara ekstrem dan amat berkomitmen membereskan _bug_ secara bertanggung jawab dan tangkas serba kilat.

## Dukungan Versi Terkini (Supported Versions) ✅

Model pemutakhiran tambalan keamanan (_Security Patches_) hanya diberlakukan penuh secara berkelanjutan pada siklus versi mayor yang saat ini tengah bergulir (Aktif).

| Angka Rilis (Version) | Dukung Pembaruan                   |
| --------------------- | ---------------------------------- |
| v1.0.x                | :white_check_mark: (Terkini/Aktif) |
| < v1.0                | :x: (Sudah Dilepas/Kedaluwarsa)    |

## Pelaporan Celah Kerentanan (Reporting a Vulnerability) 🚨

**JANGAN PERNAH MENGUMBAR ATAU MELAPORKAN PENEMUAN BUG CELAH KEAMANAN KE DALAM LAMAN PUBLIK 'GITHUB ISSUES' ATAUPUN 'DISCUSSIONS'.**

Apabila dengan ketekunan Anda tak sengaja atau berniat menelusuri penemuan celah lubang eksploitasi di dalam jeroan arsitektur sekuriti Examinator, mohon segera kirimkan notifikasi pelaporan deteksi secara tertutup dengan cara mendraft surel elektronik (_Email_) dan bidikkan korespondensinya kepada pimpinan garda respons sekuriti internal kami di alamat: **[security@examinator.dev]** (suntinglah alamat ini menyesuaikan kanal institusi spesifik anda nanti paska _Forking_).

Wajib bagimu guna merincikan secara spesifik beberapa kriteria elemen di bawah ini di dalam laporan temuan tersebut:

- Tipe/Kalkulasi tipe kerentanan serangan (Sebut saja mIsal: XSS, SQLi, RCE, atau Authentication Bypass/Lepas Kuasa).
- Tahap demi tahap utuh cara memprovokasi kemunculan duplikasi kerentanan secara kronologis (_Full steps to reproduce_ - dilengkapi tuntutan khusus muatan _payloads_ perusak/konstruksi modifikasi peladen config).
- Potensi proyeksi seberapa parah daya ledak destruktif yang bisa dieskalasi lewat celah kerentanan tersebut.
- Sebarkan pula berkas penunjang seperti jejak Logs server, foto _Screenshots_, atau serpihan manuskrip _PoC (Proof-of-Concept) code_.

### Garis S.O.P Respons Tanggap Darurat (Security Response Process) 🕵️

1. **Pengakuan Transmisi (Acknowledgement)**: Para penemu wajib dikirimkan bukti tiket pengakuan penerimaan berkas pelaporan investigasi paling lambat tak lewat dari jeda waktu 48 jam paska transmisi email.
2. **Investigasi Detektif**: Regu barisan insinyur kita bakal menerjunkan analis menyelusuri jejak forensik ancaman disinggung di aduan dan berlanjut mengkalkulasi skoring bahaya lewat rincian tabel _CVSS scoring system_.
3. **Mekanisme Penambalan (Patching)**: Solusi perbaikan di-koding, divalidasi uji coba dan dirakit komplit melalui suaka brankas _Private repository mirror_ agar mencegah kebocoran prematur yang dieksploitasi oleh _hacker_.
4. **Pernyataan Publik (Disclosure & Advisory)**: Tatkala kode penambal dijahit matang dan _Release_ pembaruan kode versi mutakhir terbit digelindingkan, baru setelahnya peluncuran rilis Lembar Penasehat Keamanan (_Security Advisory_) ditebar ke panggung publik. Kami mempercayai filosofi Pelaporan Bertanggung Jawab (_Responsible Disclosure_) lantas mencantumkan kredit kebanggan (_Bounty Credit/Hall of Fame_) ditujukan apresiatif mengukir apresiasi khusus disemat atas penemuan jenius anda (kecuali jika anda condong lebih sudi dibiarkan sebagai entitas 'Anonimus' tampa nama).

## Pengecualian Riset Keamanan Terlarang (Prohibited Security Research) 🚫

Setinggi apapun minat dan toleransi kebebasan kami menyokong jiwa intelijensi penemuan penguji lepas independen, namun larangan di bawah ini berlaku haram jika diekskusi menyenggol kerangka server _Demo Infrastructure_ operasional publik kita (segala perbuatan di area ini otomatis diklasifikasikan _Malicious Intent / Siber Teroris_):

- Serbaneka bentuk serangan Volumetrik Pembanjiran LaluLintas (_Volumetric/ Denial of Service DoS/DDoS attacks_).
- Menjalankan taktik manipulasi tipu muslihat psikis (_Social engineering_ semimil _phishing / phreaking_) menargetkan staf administrasi, pengembang utama tau sub-pesert didik Examinator.
- Akses destruksi invasi sabotase wujud nyata _Hardware Data Center_ infrastruktur _Bare Metal_.
- Penarikan ekstrak (_Exfiltration_), manuver penghangusan (Deletions), modifikasi nilai gubahan modifikasi alterasi mutasi segala elemen gugusan kepingan _data base_ yang bukan otorisasi sah mu. Silakan bereksperimen murni melalu ruang angkasa buatan Virtual _Isolasi Local Research Environment_.

_Atensi Notisi: Sebagai etika landasan, selalu bangun pangkalan `localhost` kloning instansi Examinator di laptop periset masing-masing bila hendak menggelar simulasi stres tempur destruktif._

## Pendeklarasian Batas Daya Toleransi Eksepsional Keamanan Maklum (Known Security Boundaries) ⚠️

### Manipulasi Regresi Anti-Mencontek (Anti-Cheat Evasion)

Platform Examinator sepenuhnya berpijak di atas pergelaran fitur pemicu level antarmuka *API peramban (*Browser-level heuristics* semisal Page Visibility, event tangkapan Fullscreen, pengawasan video *MediaRecorder* stream) merajut rumusan dugaan indikator penipuan tes anak didik. Dan mengingat kerangka kerja jasad kita di batasi mematuhi aturan sandboxing *Browser Sandbox Web Web Standard*, kami memproklamasikan keterbatasan \*\*Pengakuan absolut bahwasannya manipulasi sabotase yang membedah level terdalam (*kernel-level OS tampering\*), kamuflase eskapisme kotak virtual (Virtual Machine OS guest escape), atau penggunaan penyadap rekaman wujud piranti keras tambahan siluman HDMI Video Capture/Splitter itu sudah jauh di luar radius kuasa deteksi teknologi murni standar 'Peramban Web'.\*\*

Laporan cemerlang membongkar celah-celah regresi mekanisme peramban bawaan sangat direstui kehadirannya, walau tak tertutup limitasi bahwa mitigasi solusinya dapat di cap stempel tak terjamah di ranah _'Accepted Risks' (Risiko Dimaklumi)_ semisal solusinya menuntut invasi radikal di tingkatan injeksi privelese Administrasi Hak Akses Sistem Operasi (Level OS Administrator Kernel).

### Pemindaian Modul Pihak Ketiga Independen (Dependency Auditing)

Tulang punggung kerangka kita disangga rujukan kemutakhiran ekosistem kompilator canggih (Bun Ecosystem serta rentetan Paket perpusakaan NPM packages module npm). Penumpukan laporan temuan modul pustaka kelemahan paket kerentanan pustaka dari lapooran audit otomatis semprotan perintah diagnostik terminal (berangkat dari alarm terminal `npm audit` lazimnya dan perangkat semacam lainnya) bila secara hakekatnya TIDAK BISA atau _Mustahil DiEkskusi Pemicunya ke dalam teritorial limitasi alur khusus kode 'Examinator Runtime Context'_ maka mereka akan kami antrikan sabar menyusul disela _Regular Maintenance updates time window_ ketimbang diperlakukan bak letupan status darurat Bencana Zero-Day _Critical Events_.

Ribuan Puji Penghormatan bagi niat mulia menjaga benteng Examinator serta menjaga kompas nurani integritas sivitas Pendidikan Tetap Murni Terjamin Aman Sentosa Kokoh Tak Tertandingi! 🎓
