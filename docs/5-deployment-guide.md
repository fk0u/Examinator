<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nDeployment+Guide&font=Montserrat" alt="Deployment Guide Banner" />
</p>

# 5. Deployment Guide 🚀

Panduan operasional server guna memastikan aplikasi siap pada lingkungan **Production** (skala rilis umum / sekolah). Dokumen ini merangkum proses kompilasi bundel, penataan _Daemon_ proses peladen, hingga pengerahan Reverse Proxy menggunakan **NGINX**.

## 🧰 Prasyarat Production

1. **Sistem Operasi**: Linux Ubuntu 22.04 LTS (Disarankan) atau Debian.
2. **Kompilator (Runtime)**: Bun Runtime terinstal merata (`curl -fsSL https://bun.sh/install | bash`).
3. **Database Relasional**: Instansi layanan aktif MySQL/MariaDB.
4. **Alat Pendukung Tambahan (Tools)**: Git, PM2 (Opsional tapi disarankan manajer _daemon OS uptime_), NGINX.

---

## 🛠️ Langkah Pemasangan (Step-by-Step Build)

### 1. Menyiapkan Kloning Distribusi Pangkalan

Unduh dan letakkan skrip di dalam repositori wadah seperti `/var/www/examinator`.

```bash
git clone https://github.com/examinator/examinator.git /var/www/examinator
cd /var/www/examinator
bun install # Pasokan modul-modul npm tree dari Bun package manager
```

### 2. Formulasi Integrasi Database

Berikan persetujuan parameter kreden sial yang dituju (edit di file titik rentan `.env`).

```bash
cp .env.example .env
bun run db:push
bun run db:generate
```

### 3. Kompilasi Front-End Statik (Klien Qwik)

Bangun dan kemas bungkusan kompilasi terdistribusi (Rakit kerangka Qwik Vite Bundle menjadi rilis optimisasi minified build).

```bash
cd client
bun run build
cd ..
```

_Hasil artefak statis HTML/JS diekspor otomatis ke direktori antarmuka `client/dist` layaknya pangkalan Node SSR build. Namun di kasus kita, semua rute client Qwikcity akan di-serve kembali oleh Elysia Backend Plugin (`@elysiajs/static` / `qwikCity` middleware server)._

---

## 🚦 Menjalankan Pembangkit Server Latar Belakang (PM2 Daemon)

Gunakan PM2 untuk menjaga konsistensi eksekusi memori (`uptime`) asinkron Bun Server paska putus SSH, dan merestart modul sekonyong-konyong seandainya _Kernel panic/crash_ terjadi.

```bash
npm install -g pm2
pm2 start server/src/index.ts --name "examinator-backend" --interpreter ~/.bun/bin/bun
pm2 save
pm2 startup
```

_Server aktif dan kini melayani gerbang port `8080` (Backend API + SSR Frontend Qwik + WebSockets Proctor)._

---

## 🛡️ Konfigurasi Reverse Proxy NGINX & SSL Secure WSS Server

Langkah maha-krusial: **Examinator WAJIB berjalan di ekosistem Secure HTTPS (`https://`)!**
Jika tidak, sistem proteksi protokol kemulusan Web Standar _Browser Security_ akan **MEMBLOKIR Izin Akses Sensor Kamera (_MediaDevices.getUserMedia_)**.

> **⚠️ Peringatan (Must-read)**: Konfigurasi NGINX ini memerlukan persetujuan spesifik direktif (_HTTP Upgrade header protocol_) demi merawat keutuhan jalinan nafas ganda koneksi HTTP biasa dan **Tunnel WebSocket**.

**Formulasi Blok Server NGINX (`/etc/nginx/sites-available/examinator`)**:

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name examinator.sekolah-anda.sch.id;

    # Alamat Jalur Kunci Gembok SSL Certbot LetsEncrypt
    ssl_certificate /etc/letsencrypt/live/sekolah-anda.sch.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sekolah-anda.sch.id/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_addrs;

        # WEBSOCKET PROXY TUNNEL UPGRADE HEADERS (MANDATORY UNTUK /WS/PROCTOR!)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Kelonggaran Beban Unggahan Bukti Laporan Video Ukuran Besar
        client_max_body_size 50M;
    }
}
```

Tautkan `symlink` NGINX dan dorong pelepasan (_restart daemon network proxy_):

```bash
ln -s /etc/nginx/sites-available/examinator /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

Selesai. Ekosistem Examinator telah meroket fungsionalitasnya menatap ranah _Web World Wide_. Sanggup melayani pengawasan simultan dengan tangkapan kamera lancar! 🎓🚀
