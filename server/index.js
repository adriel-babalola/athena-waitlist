import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

/* ─── CONFIG ─── */
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'athena';
const COLLECTION = 'waitlist';

// Rate-limit: max 5 requests per IP per 15 min window
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipMap = new Map();

const app = express();

/* ─── MIDDLEWARE ─── */
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '16kb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

/* ─── DB CONNECTION ─── */
let cachedClient = null;
let dbConnected = false;

async function getDb() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI not configured — add it to your .env file');
  if (!cachedClient || !cachedClient.topology?.isConnected?.()) {
    cachedClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 30000,   // 30s — generous for cold starts / slow networks
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    await cachedClient.connect();
    dbConnected = true;
    console.log('✓ Connected to MongoDB');
  }
  return cachedClient.db(DB_NAME);
}

// Validate connection on startup (non-blocking — server still starts)
(async () => {
  try {
    await getDb();
  } catch (err) {
    dbConnected = false;
    console.error('⚠ MongoDB startup connection failed:', err.message);
    console.error('  → Check MONGODB_URI in .env');
    console.error('  → Ensure your IP is whitelisted in Atlas (Network Access → Add Current IP)');
  }
})();

/* ─── HELPERS ─── */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[${}]/g, '').trim().slice(0, 255);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

function isValidName(name) {
  return /^[a-zA-Z\s'\-\.]{1,100}$/.test(name);
}

function rateLimitCheck(ip) {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    ipMap.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

/* ─── ROUTES ─── */

// GET /api/waitlist — return waitlist count
app.get('/api/waitlist', async (req, res) => {
  try {
    const db = await getDb();
    const count = await db.collection(COLLECTION).countDocuments();
    return res.status(200).json({ count });
  } catch (err) {
    console.error('GET /api/waitlist error:', err.message);
    const hint = err.message.includes('timed out')
      ? ' Check that your IP is whitelisted in MongoDB Atlas.'
      : '';
    return res.status(503).json({ error: 'Database unavailable.' + hint });
  }
});

// POST /api/waitlist — join waitlist
app.post('/api/waitlist', async (req, res) => {
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (!rateLimitCheck(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { name, email, honeypot } = req.body || {};

  // Honeypot: bots fill this hidden field — silently fake-succeed
  if (honeypot) {
    return res.status(200).json({ success: true, position: Math.floor(Math.random() * 500) + 100 });
  }

  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email).toLowerCase();

  if (!cleanName || !isValidName(cleanName)) {
    return res.status(400).json({ error: 'Please enter a valid name (letters only, max 100 chars).' });
  }
  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const db = await getDb();
    const coll = db.collection(COLLECTION);

    // Duplicate check
    const existing = await coll.findOne({ email: cleanEmail });
    if (existing) {
      const count = await coll.countDocuments();
      return res.status(409).json({ error: 'This email is already on the waitlist.', count });
    }

    const count = await coll.countDocuments();
    const position = count + 1;

    await coll.insertOne({
      name: cleanName,
      email: cleanEmail,
      position,
      ip: clientIp,
      joinedAt: new Date(),
      source: sanitize(req.headers['referer'] || 'direct'),
    });

    // Ensure unique index (idempotent)
    await coll.createIndex({ email: 1 }, { unique: true }).catch(() => {});

    return res.status(201).json({ success: true, position, count: position });
  } catch (err) {
    console.error('POST /api/waitlist error:', err.message);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This email is already on the waitlist.' });
    }
    const hint = err.message.includes('timed out')
      ? ' Check that your IP is whitelisted in MongoDB Atlas.'
      : '';
    return res.status(503).json({ error: 'Database unavailable.' + hint });
  }
});

// Periodic cleanup of rate-limit map to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipMap) {
    if (now - entry.start > RATE_LIMIT_WINDOW) ipMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW);

/* ─── START ─── */
const server = app.listen(PORT, () => {
  console.log(`Athena Waitlist server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  server.close();
  if (cachedClient) await cachedClient.close();
  process.exit(0);
});
