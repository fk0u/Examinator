<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nSoftware+Requirements+Specification&font=Montserrat" alt="SRS Document Banner" />
</p>

# 6. Software Requirements Specification (SRS) 📐

**Dokumen Standar IEEE 830-1998 yang Diadaptasi Secara Lanjutan untuk Pengembang Ekosistem Agile Modern**

**Nama Proyek:** Examinator - Pengawasan CBT (SaaS Berbasis Web)  
**Tengara Versi Dokumen:** 1.0.0 (Edisi Publikasi Ilmiah Top 10 Wakatime Developer)  
**Tanggal Penerbitan:** Maret 2026

---

## 1. Pendahuluan

### 1.1 Tujuan Proyek (Purpose)

Gagasan rancang bangun dokumen piranti lunak (SRS) ini memaparkan segala deskripsi detail, kendala-kendala pemrosesan, dan persyaratan non-fungsional (_Non-Functional Requirements_) yang difabrikasi sedemikian rupa ke dalam produk platform "Examinator". Dokumen ditujukan bagi konsumsi kolektif pemegang kepentingan; terkhusus Komite Admin Pendidik, Staf Pengembangan, Pemasar B2B Sekolah, hingga Auditor Ketahanan Keamanan Sistem.

### 1.2 Cakupan (Scope)

Sistem memayungi perihal pendaftaran dan identifikasi Pengguna, Pembuatan Konstruksi Sesi Ujian oleh Guru, Perhitungan Skor Otomatisasi (Scoring), serta Fokus Super Mutlak pada mekanisme deteksi dini pengawasan kecurangan _Multi-layer_ proctoring. Perangkap tersebut berupa observasi DOM: Hilangnya Fokal Kamera, Penggantian Visibilitas Tab Browser (DOM `Document.hidden`), Eksitasi Layar Penuh _Fullscreen_, dan Pengambilan Hak Akses Mikroskopis API media peramban _MediaRecorder API Camera Streams_.

---

## 2. Deskripsi Keseluruhan Parameter (Overall Description)

### 2.1 Prespektif Model Perangkat Lunak

Layanan Aplikasi Web berdiri sendirian secara independensi mutlak dan bukan merupakan instrumen sub-servis maupun gubahan sistem lama _(Standalone Monorepo Software Architecture)_. Berjejaring murni mengaplikasikan arsitektur berbalut kerangka C/S (_Client-Server_). Celah masuk terentang dua: satu buat Murid/Penguji CBT, serta satu Dasbor Papan Pemantauan Pengawasan Pendidik (_Teacher Monitoring Panel_).

### 2.2 Atribusi Pengguna Kunci

| Tipe Kategori Profil | Jenjang Otorisasi (Level) | Gambaran Perilaku Pemakaian                                                            |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| Pelajar Ujian        | _STUDENT_ (Biasa)         | Mengerjakan form CBT; dibatasi lingkungan peramban mode terkunci.                      |
| Pengawas Ujian       | _ADMIN_ (Supervision)     | Terkoneksi kanal _WebSockets_ seketika; mendeteksi getaran sinyal abnormalitas curang. |

---

## 3. Persyaratan Fungsional Khusus (Functional Capabilities)

_SRS Konvensional dipecah selaras fungsionalitas fiturnya yang berjejak riwayat (Epic-Based Use Case mapping)._

- **F-1 (Authentikasi JWT Mutlak):** Mengharamkan pengguna merambah wilayah `/student` tanpa restu kalibrasi _JSON Web Token_ sah (Berjalan via perantara middleware router `onBeforeHandle` Elysia.js).
- **F-2 (Ujian Reaktif):** Antarmuka CBT harus reaktif mengadopsi fusi bingkai peramping status (_Resumable Reactive State Qwik_).
- **F-3 (Beban Ujian Dinamis):** Guru bebas mengawurkan ragam variasi soal ABCDE majemuk; setiap hitungan pilihan bernilai rasio poin unik.
- **F-4 (Algoritma Penangkapan Kecurangan Real-Time):** Detak jantung proctoring berpedoman pada `window.addEventListener('blur')` dipadankan `document.visibilityState`. Jikalau _Event_ ini menembus kuota kemaafan, maka gawai wajib mengambil _Snapshot 3 Detik MediaRecorder_ guna pelacakan konkrit valid. Pelaporan ditransfer serentak detik itu juga melewati protokol WSS menuju pangkalan Server Proktor!

## 4. Persyaratan Non-Fungsional Penuh Skala (Non-Functional Requirements)

1.  **Daya Kapasitas Performa (_Performance Index_)**:
    Uji beban memaparkan sistem sanggup ditekan oleh ledakan `10,000 Concurrent Connections TCP WebSocket` berkat sandaran kokoh _Bun uWebsockets Engine_ di ekosistem peranti keras peladen terdedikasi `Ubuntu CPU 4-Cores 8GB RAM`. Pemuatan waktu render LCP layar (_Lighthouse_) < `1.2` Detik.

2.  **Proteksi Forensik Log Mutasi Transaksi (Security/Auditability)**:
    Data otentikasi kata sandi tidak boleh berwujud teks plos (**Plain Text**), mutlak diarep dalam pembungkusan garam dekripsi asimetrik (Hashing). Rangkaian rekaman dosa pelanggaran _ProctorLog_ tak dapat dipadamkan secara mandiri via API biasa.

3.  **Metrik Ketahanan Beroperasi Asuransi Layanan (_Reliability/Availability_)**:
    Platform dikhususkan mencapai tolok ukur _Uptime_ server rata-rata `99.9%` saat Pekan Ujian Akhir, dilindungi pengawasan pengawas sirkuit penangkal _Crash_ dari skrip PM2 (_Process Daemon_).

_Menyelesaikan Dokumentasi Teks Standar Spesifikasi Kebutuhan Proyek - Examinator CBT_ 🎓
