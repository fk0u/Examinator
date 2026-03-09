<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/38bdf8?text=Examinator\nSystem+Architecture&font=Montserrat" alt="System Architecture Banner" />
</p>

# 2. System Architecture 🏗️

Examinator mengadopsi arsitektur **Monorepo** untuk menyatukan _frontend_ dan _backend_ dalam satu repositori, memfasilitasi integrasi dan _deployment_ yang lebih kohesif.

## 🌉 Gambaran Arsitektur

Arsitektur aplikasi dipisahkan menjadi tiga lapisan (layer) logis utama berarsitektur hibrida _Client-Server_:

1. **Presentation Layer (Frontend)**: Digerakkan oleh _Qwik Framework_ di peladen asinkronus (memanfaatkan Vite bundler).
   - Berjalan dengan strategi SSR (Server-Side Rendering) dan pemulihan status instan (Resumability/$O(1)$) untuk menghindarkan transfer muatan _JavaScript Hydration_ yang menumpuk.
   - Mewadahi sensor-sensor proctoring terpusat langsung dari sisi klien melalui _hooks_ kustom _Native Web Browser API_ (Visibility, Fullscreen, MediaDevices).
2. **Logic & API Layer (Backend)**: Diusung di atas **Elysia.js** yang dieksekusi melalui **Bun Runtime**.
   - Melayani REST API standar (Autentikasi, Sinkronisasi Exam, CRUD Manajerial).
   - Memiliki modul _Real-Time Multiplexing Websockets (`/ws/proctor`)_ yang ditulis di atas instansi native performa elit milik Bun.
3. **Data Persistence Layer (Database)**: Dikelola oleh **Prisma ORM** yang diintegrasikan secara Type-Safe ke skema **MySQL** (Relational Database). Semuanya tercatat memanami integritas ACID (_Atomicity, Consistency, Isolation, Durability_).

---

## 📐 Topologi Server & Komponen

```mermaid
graph TD;
    subgraph Client [Browser End-Users]
        Q[Qwik Frontend App]
        V[Video MediaRecorder API]
        E[Events: Focus, Visibility]
    end

    subgraph CDN / Load Balancer
        N[NGINX Reverse Proxy]
    end

    subgraph Backend Server (Bun Runtime)
        H[REST API: Elysia Router]
        W[WebSockets: /ws/proctor]
        Auth[JWT Authentication]
        Up[Upload Storage Middleware]
    end

    subgraph Persistence Layer
        DB[(MySQL Database)]
        P{Prisma ORM Gateway}
    end

    Q -->|HTTPS/REST| N
    Q -->|WSS Realtime| N
    V -->|HTTPS POST| N
    E -->|WSS Event| N

    N -->|Proxy Pass 8080| H
    N -->|Proxy Pass 8080| W

    W --> Auth
    H --> Auth
    H --> Up

    Auth --> P
    Up --> LocalFS[Local File System]

    P <--> DB
```

## 📂 Struktur Direktori Monorepo (Tree)

```bash
my-cbt-app/
│
├── client/                     # Qwik Frontend (Vite)
│   ├── src/
│   │   ├── components/         # Komponen UI (Buttons, Cards, Navbar)
│   │   ├── routes/             # Routing Qwik City (Pages)
│   │   │   ├── /login
│   │   │   ├── /student
│   │   │   └── /admin
│   │   ├── lib/                # Modular utilities (Hooks Anti-Cheat, Store WS)
│   │   └── root.tsx            # Akar presentasi Qwik
│   └── package.json            # Dependensi lokal client (Tailwind v4)
│
├── server/                     # Elysia Backend (Bun)
│   ├── prisma/
│   │   └── schema.prisma       # Skema Database & Relasi ORM
│   ├── src/
│   │   ├── routes/             # Rute HTTP RESTful
│   │   ├── ws/                 # Rute WebSocket untuk Live Proctoring
│   │   ├── lib/                # Konfigurasi Konektor db.ts, hashing, dll.
│   │   ├── config/             # Pengenalan variabel ENV
│   │   └── index.ts            # Titik masuk utama Peladen Bun/Elysia
│   ├── uploads/                # Brankas penampungan bukti foto/video (Cheat logs)
│   └── package.json            # Dependensi server Elysia (JWT, Swagger)
│
├── docs/                       # Dokumentasi Agile
├── package.json                # Akar Monorepo
├── concurrently              # Skrip eksekusi sinkron (npm run dev)
└── ...
```

## 🔒 Konsep Arsitektur Anti-Mencontek (_Proctoring Engine_)

Sistem Pengawasan Bertingkat didesain sedemikian rupa mematuhi Standar Kerancu-an Ekosistem Web (_Web Standardization Sandbox Restrictions_):

1. **Media Penyadapan Antarmuka (Front-Line Heuristics)**:
   Modul `useProctoring` memegang kendali atas interupsi DOM.
   - `document.addEventListener('visibilitychange')`: Pemantauan navigasi tab.
   - `window.addEventListener('blur')`: Pemantauan interaksi peramban ketika tidak aktif (_Alt+Tab_ atau Notifikasi OS Pop-up).
   - `document.addEventListener('fullscreenchange')`: Menjebak siswa kembali ke mode penuh (_Fullscreen enforced_).
2. **Pengambilan Bukti Visual (Zero-Trust Snapshot)**:
   Saat limit batas teguran toleransi terlewati, fungsi perekaman sekunder terpicu: Klien `MediaRecorder` merakam 3 detik video asinkronus dan diunggah (POST /api/upload) lalu nama file di-pautkan (_Binded_) ke notifikasi WebSocket ke pihak pelayan (server) pusat.
3. **Admin Monitoring Papan Kontrol (_Live Dashboard_)**:
   Dasbor _Admin (/admin/monitor)_ menginkubasi koneksi statis (`new WebSocket(...)`). Data aliran diproses tanpa intervensi HTTP _Polling_, menghasilkan matriks aktivitas siswa murni secara _real-time_.
