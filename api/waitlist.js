import { MongoClient } from 'mongodb';

/* ─── CONFIG ─── */
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'athena';
const COLLECTION = 'waitlist';

// Rate-limit: 5 requests per IP per 15 min (in-memory, resets per cold start)
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipMap = new Map();

/* ─── DB CONNECTION (cached across warm invocations) ─── */
let cachedClient = null;

async function getDb() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI not configured');
  if (!cachedClient || !cachedClient.topology?.isConnected?.()) {
    cachedClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    await cachedClient.connect();
  }
  return cachedClient.db(DB_NAME);
}

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

function setCorsHeaders(res, origin) {
  const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'];

  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

/* ─── HANDLER ─── */
export default async function handler(req, res) {
  const origin = req.headers.origin;
  setCorsHeaders(res, origin);

  // Preflight
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* ── GET — return waitlist count ── */
  if (req.method === 'GET') {
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
  }

  /* ── POST — join waitlist ── */
  if (req.method === 'POST') {
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
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
