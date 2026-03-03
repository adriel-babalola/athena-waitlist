# Athena Waitlist

Waitlist landing page for **Athena** — the AI study companion that finds the perfect YouTube videos to explain anything. Collects email sign-ups with a MongoDB backend and deploys as a single Vercel project.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, Motion (Framer Motion), Lucide React |
| **Backend** | Vercel Serverless Functions (Node.js) / Express (local dev) |
| **Database** | MongoDB Atlas |
| **Deployment** | Vercel |

## Project Structure

```
athena-waitlist/
├── api/
│   └── waitlist.js          # Vercel serverless function (GET & POST /api/waitlist)
├── client/
│   ├── public/              # Static assets (logo, favicon, icons)
│   ├── src/
│   │   ├── App.jsx          # Root component — fetches count, orchestrates pages
│   │   ├── main.jsx         # Entry point
│   │   ├── index.css         # Global styles + Tailwind
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── WaitlistHero.jsx   # Email sign-up form with honeypot + validation
│   │       ├── Features.jsx
│   │       ├── SocialProof.jsx
│   │       ├── SuccessModal.jsx
│   │       └── Footer.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                  # Express server (local development only)
│   ├── index.js
│   ├── .env.example
│   └── package.json
├── vercel.json              # Vercel deployment config
├── package.json             # Root — concurrently scripts + mongodb dep
└── README.md
```

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (free tier works fine)

### Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure environment
cp server/.env.example server/.env
# Edit server/.env and add your MongoDB connection string

# 3. Start dev server (client + API)
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3001

### Environment Variables

Create `server/.env` from `server/.env.example`:

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string (required) | — |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `http://localhost:5173` |
| `NODE_ENV` | `development` or `production` | `development` |
| `PORT` | Express server port | `3001` |

## Deploying to Vercel

### 1. Connect repository

Import this folder (`athena-waitlist/`) as the root directory in the Vercel dashboard.

### 2. Set environment variables

In **Vercel → Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your Atlas connection string |
| `ALLOWED_ORIGINS` | `https://your-domain.vercel.app` (comma-separate multiple) |
| `NODE_ENV` | `production` |

### 3. Ensure MongoDB Atlas allows Vercel IPs

In Atlas → **Network Access**, add `0.0.0.0/0` (allow all) or Vercel's IP ranges.

### 4. Deploy

Vercel auto-builds on push. Manual deploy:

```bash
npx vercel --prod
```

## API Endpoints

### `GET /api/waitlist`

Returns the current waitlist count.

```json
{ "count": 142 }
```

### `POST /api/waitlist`

Join the waitlist.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Success (201):**
```json
{
  "success": true,
  "position": 143,
  "count": 143
}
```

**Errors:** `400` (validation), `409` (duplicate email), `429` (rate limited), `503` (database unavailable)

## Security

- **CORS** locked to `ALLOWED_ORIGINS`
- **Rate limiting:** 5 requests / 15 min per IP
- **Honeypot** anti-bot field
- **Input sanitization:** strips `$`, `{`, `}`, max 255 chars
- **Email validation** + unique MongoDB index
- **Security headers:** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS (production)
- **Request body limit:** 16 KB

## License

Private — all rights reserved.
