# Dasar Keselamatan (Security Policy)

Mewakili pengurusan tertinggi **Examinator**, darjat keselamatan serta keutuhan (_integrity_) sistem peperiksaan berkomputer merupakan teras prioriti kelangsungan kami. Kami bersikap proaktif mencantas punca kelompongan titik buta kerentanan pangkalan (_Vulnerabilities_) bahkan memateri komitmen merawat pepijat menjejas sekuriti secepat daya yang munasabah.

## Sokongan Semasa (Supported Versions)

Model rawatan keselamatan (_Security Patches_) cuma difokuskan berterusan terhadap kitaran edisi semasa perisian sahaja.

| Nilai Versi (Version) | Berstatus Disokong                 |
| --------------------- | ---------------------------------- |
| v1.0.x                | :white_check_mark: (Terkini/Aktif) |
| < v1.0                | :x: (Sudah Ditinggalkan/Lapuk)     |

## Pelaporan Kelemahan Integriti (Reporting a Vulnerability)

**JANGAN SESEKALI TAMPILKAN LAPORAN PENEMUAN KECACATAN SEKURITI KOD KAMI DI LAMAN TANYA JAWAB TERBUKA SEPERTI 'GITHUB ISSUES' MAHUPUN 'DISCUSSIONS'.**

Andai kalian menemui mana-mana eksploitasi di penjuru lipatan arkitektur Examiner, segeralah muat naik emel sulit menuju alamat pakar tindak balas keselamatan krew pelayan teknikal kami: **[security@examinator.dev]**.

Butir laporan perlu dijana kemas menuruti ketetapan rantaian berikut:

- Kenal pasti model Serangan (Kondisi seperti: XSS, SQLi, RCE, mahupun Authentication Bypass).
- Langkah urutan mencetuskan punca kerosakan (_Full steps to reproduce_ - merangkumi keperluan rentetan beban _payload_ penyerang).
- Takrifan anggaran tahap kerosakan dan daya ledakan impak kerentanan jikalau ianya diguna pakai oleh jembalang pengodam.
- Sebaran lampiran sokongan seperti rekod Logs, Tangkapan Layar _Screenshots_, draf pengesahan koding _PoC (Proof-of-Concept)_.

### Tata Cara Mengemudi Krisis Keselamatan (Security Response Process)

1. **Pengiktirafan Nota (Acknowledgement)**: Tuntutan penerimaan surat akuan disahkan paling lekas < 48 jam berturut-turut sedari mesej emel dilabuh.
2. **Penelitian Siasatan**: Angkatan pakar pemantau akan merungkai siasatan bedah siasat tahap kritikal acuan pemarkahan skala sistem global bertaraf _CVSS scoring system_.
3. **Mekanika Tambalan (Patching)**: Skrip tampalan koding digubal, dirumus, diasah serta disemarakkan menerusi _Private repository mirror_ melainkan ketirisan pra-matang.
4. **Penzahiran Temuduga Awam (Disclosure & Advisory)**: Sebaik sahaja jahitan kod terikat sasa, edisi penambahan cawangan _releases_ baru dikibarkan, diiringi sebaran warta Pemakluman Tahap Amaran (_Security Advisory_). Menginsafi pendekatan Pelaporan Berhemah (_Responsible Disclosure_), sepotong kredit berbangga bakal diukir merakam tahniah buat daya kognitif genius anda (kecuali atas pemintaan, hak awda dipelihara agar dilimpahi 'Awan Anonimiti').

## Modifikasi Penyelidikan Diharamkan Sama Sekali (Prohibited Security Research)

Semarak semangat menimba ilmu tiada sempadannya, namun sekatan memagari teras kelangsungan mutlak _Demo Infrastructure_ operasional sistem berstatus publik kita terpakai jika dipaksa rempuh melampaui batasan ini (klasfikasi teror _Malicious Intent_):

- Banjiran Serangan Skala Lebar Serentak Kesesakan Trafik (_Volumetric/ Denial of Service DoS/DDoS attacks_).
- Manipulasi helah kelicikan penyamaran tipu daya (_Social engineering/ phishing / phreaking_) disasarkan kepada guru staf Examinator mahupun pentadbir teras siber.
- Rentapan infrastruktur pelayan kelengkapan secara melulu sentuhan berbaur pencerobohan fizikal ke tapak.
- Ekstrak Data Mencuri Muat (_Exfiltration_), manuver pelupusan nilai mutlak, atau penukaran elemen _database_ selagi hak milik aset bukan sandaran persetujuan mutlakmu. (Diwajibkan pengujian hanya berpijak berlabuh di teritorial stesen pangkalan pelayan maya isolasi klon tempatan / Lokal `localhost`).

## Pengisytiharan Limitasi Rangka Lingkungan Keamanan Setempat (Known Security Boundaries)

### Pelolosan Muslihat Peperiksaan (Anti-Cheat Evasion)

Nadi pergerakan Examinator terperangkap berdiri di atas tapak catur penyemak imbas sistem klien (_Browser-level heuristics_ Page Visibility, manipulasi log skrin Fullscreen, kamera visual perakam _MediaRecorder_). Memandangkan penjara kita patuh menurut garis panduan alam sanbox spesifikasi rasmi Web, maka, kami akui **Lompong pencerobohan tahap pelayan teras gajet (_kernel-level OS tampering_), muslihat pengaburan terowong mesin maya (Virtual Machine OS guest escape), mahupun pengintipan perakam luaran wayar kabel tambahan (HDMI Video Capture/Splitter) masih lolos rentas sempadan kawalan mutlak keampuhan radar semata-mata di bawah payung teknologi 'Pelayar Web' lazim.**

### Audit Bersih Integrasi Entiti Ketiga (Dependency Auditing)

Tulang rujukan keistimewaan arsitektur ditumpang bersama pustaka enjin pelaksana (Bun Ecosystem serta entiti awam permodulan NPM packages module). Rekodan fail kerosakan pemecut tersemat oleh utusan isyarat CLI (seperti utusan laporan semakan automatik audit NPM `npm audit`) manakala entiti masalah BERKENAAN ADALAH diakui sifar secara mustahil dihidupkan (Mustahil Mampu Dirangsang Membenam Mudarat) ke dasar selok-belok putaran sistem nadi nyawa Examiner (`Context Runtime Application Space`) lalu pakej bungkusan kerosakan begini sekadar di letakkan bersusunatur ke giliran bilik pengemaskinian status biasa _Regular Maintenance_ membanding dijenamakan menjadi kecemasan terburuk Hari Kosong Kiamat Siber _Critical Zero-Day Events_.

Jengkal Seribu Tanda Pengiktirafan Penghargaan bagi anda penyebar payung perpaduan pendidik teristimewa, menyedapkan keabadian reputasi kejujuran dan amanah pengorbanan pendidikan madani bersama-sama.
