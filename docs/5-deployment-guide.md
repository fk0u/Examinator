# 5. Deployment Guide

Panduan operasional server guna memastikan aplikasi siap pada lingkungan **Production** (skala rilis umum / sekolah).

## 🧰 Prasyarat Production

1. **Sistem Operasi**: Linux Ubuntu 22.04 LTS (Disarankan) atau Debian.
2. **Reverse Proxy**: NGINX.
3. **Database**: MySQL Server versi 8.0+.
4. **Runtime Backend**: Bun CLI (Terbaru).
5. **Node.js**: Node 18+ & NPM (Untuk _build tool_ khusus UI Klien).
6. **Process Manager**: PM2.

## 📦 Tahap Kompilasi (Build Phase)

Sebelum peluncuran, frontend harus dirakit menjadi format statis (_SSR_ produksi).

### 1. Bangun UI Web (Qwik)

```bash
# Instal *deps* secara menyeluruh di root
npm install

# Build UI
cd client
npm run build
```

Hasil keluaran Klien statis/node akan masuk dalam direktori `client/dist/` atau terdistribusi dalam skrip perantara internal server `server/` (jika menggunakan integrasi adaptor _elysia-qwik_), berhubung implementasinya RESTful murni: build _Static Assets_ bisa diamankan di belakang Nginx.

### 2. Konfigurasi Produksi (.env)

Buka `/server/.env` dan jangan biarkan statusnya `.example` atau default. Gunakan _generator random string_ untuk `JWT_SECRET`. Atur host menjadi `0.0.0.0`.

## 🔌 Memulai dengan PM2

BUN sebagai runtime tunggal belum mendukung banyak daemon default Linux, tapi bersinergi baik dengan _Process Manager 2_ (PM2) menggunakan bendera (_flag_) penafsir (_interpreter_).

1. Menjalankan _Elysia API_ di latar belakang dan merestart ketika terjadi _crash_:

   ```bash
   cd server
   pm2 start src/index.ts --name examinator-api --interpreter bun
   ```

2. Tampilkan Monitor PM2:
   ```bash
   pm2 monit
   ```

## 🌐 NGINX & SSL (Penting Kritis!)

> **PERINGATAN! Browser (Chrome, Firefox) menolak total fungsi API Webcam (`getUserMedia()`) jika domain tidak diakses menggunakan HTTPS.** Ini bukan pilihan. Jika memakai domain asli (bukan `localhost`), maka wajib pakai sertifikat SSL.

### 1. Skrip _Block_ Konfigurasi Virtual NGINX `(/etc/nginx/sites-available/examinator)`

```nginx
server {
    listen 80;
    server_name ujian.namasekolah.sch.id;

    # Alihkan HTTP selalu ke HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ujian.namasekolah.sch.id;

    # SERTIFIKAT SSL (Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/ujian.namasekolah.sch.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ujian.namasekolah.sch.id/privkey.pem;

    location / {
        # Routing Aplikasi Frontend Statis
        proxy_pass http://localhost:5173; # Ganti dengan port serve Qwik
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        # Routing API Backend
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # KONFIGURASI PENTING UNTUK WEBSOCKET:
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade; # Menaikkan derajat dari http -> ws
        proxy_set_header Connection "Upgrade";
        proxy_read_timeout 86400; # Jangan matikan ws socket timeout
    }
}
```

### 2. Mulai Kembali NGINX

```bash
sudo ln -s /etc/nginx/sites-available/examinator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Dengan begitu, arsitektur sudah matang untuk dilepas ke klien akhir siswa.
