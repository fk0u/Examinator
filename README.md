# 🎓 Examinator

> Self-hosted CBT (Computer-Based Test) Proctoring SaaS for SMK Indonesia — Kurikulum Merdeka

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Stack](https://img.shields.io/badge/stack-Qwik%20%2B%20Elysia%20%2B%20MySQL-orange)

## ✨ Features

- **🖥️ CBT Engine** — Full exam-taking interface with timer, question navigation, auto-submit
- **🛡️ Anti-Cheat Detection** — Tab switch (Page Visibility API), fullscreen exit, window blur, right-click blocking
- **📸 Camera Proctoring** — Semi-mandatory camera with 3-sec photo/video capture on cheat detection
- **📡 Realtime Dashboard** — WebSocket-powered proctor dashboard for 300+ concurrent students
- **👥 Role Management** — Admin, Operator/Proctor, Student with full RBAC
- **🎨 Modern UI** — Dark theme, glassmorphism, smooth animations, responsive design

## 🏗️ Tech Stack

| Layer        | Technology                                                            |
| ------------ | --------------------------------------------------------------------- |
| **Frontend** | [Qwik](https://qwik.dev) + [Tailwind CSS v4](https://tailwindcss.com) |
| **Backend**  | [Elysia.js](https://elysiajs.com) (Bun runtime)                       |
| **Database** | MySQL + [Prisma ORM](https://prisma.io)                               |
| **Realtime** | Native WebSocket (via uWebSockets)                                    |
| **Auth**     | JWT (7-day expiry) + bcrypt                                           |

## 📋 Prerequisites

- [Bun](https://bun.sh) v1.0+ (backend runtime)
- [Node.js](https://nodejs.org) v18+ (frontend build)
- [MySQL](https://mysql.com) 8.0+ (database)

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/your-org/examinator.git
cd examinator

# Install root deps
npm install

# Install server deps
cd server && bun install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Setup MySQL Database

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database and user
CREATE DATABASE examinator_db;
CREATE USER 'examinator_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON examinator_db.* TO 'examinator_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configure Environment

```bash
# Copy env template
cp .env.example .env

# Edit .env with your MySQL credentials
# DATABASE_URL="mysql://examinator_user:your_password@localhost:3306/examinator_db"
# JWT_SECRET=your-random-secret-key-here
```

### 4. Initialize Database

```bash
# Generate Prisma client
cd server && bunx prisma generate

# Push schema to database
bunx prisma db push

# Seed with sample data
bun run prisma/seed.ts
cd ..
```

### 5. Run Development

```bash
# Run both server and client
npm run dev

# Or separately:
npm run dev:server  # http://localhost:5000
npm run dev:client  # http://localhost:5173
```

### 6. Open in Browser

- **Login Page**: http://localhost:5173
- **API Health**: http://localhost:5000/api/health
- **Prisma Studio**: `cd server && bunx prisma studio`

## 🔑 Demo Accounts

| Role     | Username            | Password      |
| -------- | ------------------- | ------------- |
| Admin    | `admin`             | `admin123`    |
| Operator | `operator`          | `operator123` |
| Student  | `siswa1` – `siswa5` | `siswa123`    |

## 📁 Project Structure

```
examinator/
├── client/                 # Qwik Frontend
│   └── src/
│       ├── routes/         # File-based routing
│       │   ├── student/    # Student dashboard + exam
│       │   ├── proctor/    # Realtime monitoring
│       │   └── admin/      # Admin panel
│       ├── components/     # Reusable UI components
│       └── lib/            # API client, WS, auth helpers
│
├── server/                 # Elysia.js Backend
│   ├── prisma/             # Schema + seed
│   └── src/
│       ├── routes/         # API endpoints
│       ├── ws/             # WebSocket handlers
│       ├── middleware/      # Auth JWT
│       └── lib/            # DB + upload helpers
│
├── .env.example            # Environment template
└── package.json            # Root workspace scripts
```

## 🔌 API Endpoints

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| POST   | `/api/auth/login`          | Login, returns JWT  |
| POST   | `/api/auth/register`       | Register new user   |
| GET    | `/api/auth/me`             | Get current user    |
| GET    | `/api/exams`               | List exams          |
| POST   | `/api/exams`               | Create exam (admin) |
| POST   | `/api/attempts/start`      | Start exam attempt  |
| POST   | `/api/attempts/:id/answer` | Save answer         |
| POST   | `/api/attempts/:id/submit` | Submit exam         |
| POST   | `/api/cheat-logs`          | Log cheat event     |
| GET    | `/api/cheat-logs/stats`    | Cheat statistics    |
| WS     | `/ws/proctor`              | Realtime proctoring |

## 🚢 Production Deployment

```bash
# Build client
npm run build:client

# Run with PM2
pm2 start server/src/index.ts --interpreter bun --name examinator

# Or with Nginx reverse proxy
# See docs/nginx.conf for sample config
```

## 📜 License

MIT — Free for personal and commercial use.
