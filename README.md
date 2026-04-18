# 🎬 StreamVault — Full Stack Video Streaming Platform

A complete video streaming web app with Telegram ID login, admin panel, and a Telegram bot.

---

## 📁 Project Structure

```
streamvault/
├── backend/          # Node.js + Express REST API
├── frontend/         # Next.js web app
└── bot/              # Telegram bot (standalone)
```

---

## ⚡ Quick Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Your Telegram ID (from [@userinfobot](https://t.me/userinfobot))

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

**Key `.env` values:**
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Any long random string |
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `TELEGRAM_ADMIN_IDS` | Your Telegram ID(s), comma-separated |
| `FRONTEND_URL` | `http://localhost:3000` |

---

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

**Key `.env.local` values:**
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Your bot's username (without @) |
| `NEXT_PUBLIC_APP_NAME` | Your platform name |

---

### 4. Bot Setup

```bash
cd bot
npm install
cp .env.example .env
# Edit .env with your values
npm start
```

**Key `.env` values:**
| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Same token as backend |
| `TELEGRAM_ADMIN_IDS` | Your Telegram ID(s) |
| `BACKEND_API_URL` | `http://localhost:5000/api` |
| `FRONTEND_URL` | `http://localhost:3000` |

---

## 🔑 How Login Works

1. User visits `/login`
2. User enters their **Telegram ID** (get it from [@userinfobot](https://t.me/userinfobot))
3. Backend checks if the ID is in `TELEGRAM_ADMIN_IDS` → grants admin if yes
4. JWT token is issued and stored in cookies
5. User is redirected to home

---

## 🛡 Admin Panel

- Visit `/admin` in the browser
- **Admins** see the full dashboard: stats, video management, user management
- **Non-admins** see a "Coming Soon" page
- Admin IDs are set in backend `.env` → `TELEGRAM_ADMIN_IDS`

### Admin features:
- 📊 Dashboard stats (users, videos, views, bans)
- 🎬 Add videos (file upload or external URL)
- 🗑 Delete videos
- 👥 View all users
- 🚫 Ban / unban users
- 🛡 Promote / demote admins
- 📢 Broadcast message to all users via Telegram

---

## 🤖 Bot Commands

| Command | Access | Description |
|---------|--------|-------------|
| `/start` | All | Welcome + login info |
| `/myid` | All | Shows your Telegram ID |
| `/stats` | Admin | Platform statistics |
| `/users` | Admin | Recent users list |
| `/videos` | Admin | Recent videos list |
| `/broadcast <message>` | Admin | Send message to all users |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/telegram` | Login with Telegram ID |
| GET | `/api/auth/me` | Get current user |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | List videos (search, filter, paginate) |
| GET | `/api/videos/:id` | Get single video |
| GET | `/api/videos/categories` | Get all categories |
| POST | `/api/videos` | Upload video (Admin) |
| PUT | `/api/videos/:id` | Update video (Admin) |
| DELETE | `/api/videos/:id` | Delete video (Admin) |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/videos` | All videos (incl. unpublished) |
| PUT | `/api/admin/users/:id/ban` | Ban/unban user |
| PUT | `/api/admin/users/:id/admin` | Toggle admin |
| POST | `/api/admin/broadcast` | Broadcast to all users |

---

## 🚀 Production Deployment

### Backend
- Deploy to **Railway**, **Render**, or **VPS**
- Set all env variables in your hosting dashboard
- Use **MongoDB Atlas** for database

### Frontend
- Deploy to **Vercel** (recommended for Next.js)
- Set `NEXT_PUBLIC_API_URL` to your backend URL

### Bot
- Run on a **VPS** with `pm2`:
```bash
npm install -g pm2
pm2 start bot.js --name streamvault-bot
pm2 save
```

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, Tailwind CSS, React Player |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT + Telegram ID |
| Bot | node-telegram-bot-api |
| File Upload | Multer |
| Video Player | React Player (supports MP4, HLS, YouTube) |
