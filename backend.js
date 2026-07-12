const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Razorpay = require('razorpay');

const app = express();
const port = process.env.PORT || 3000;
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(), payment=(self "https://checkout.razorpay.com")');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com",
      "img-src 'self' data: blob: https://checkout.razorpay.com https://*.razorpay.com",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com https://accounts.google.com https://cdn.jsdelivr.net",
      "connect-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com https://accounts.google.com https://fonts.googleapis.com https://fonts.gstatic.com",
      "frame-src https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com https://accounts.google.com https://www.youtube.com https://youtube.com"
    ].join('; ')
  );
  next();
});

const baseUrl = (process.env.BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`)).replace(/\/$/, '');
const dataFile = path.join(__dirname, 'contacts.json');
const usersFile = path.join(__dirname, 'users.json');
const enrollmentsFile = path.join(__dirname, 'enrollments.json');
const transactionsFile = path.join(__dirname, 'transactions.json');
const appShellFile = path.join(__dirname, 'app-shell.html');
const manifestFile = path.join(__dirname, 'manifest.webmanifest');
const handbooksFile = path.join(__dirname, 'handbooks.json');
const notesAssetsDir = path.join(__dirname, 'assets', 'notes');
const dataScienceNotesFile = path.join(__dirname, 'assets', 'notes', 'data-science-python-handbook.pdf');
const aiKey = pickEnv(
  'OPENAI_API_KEY',
  'OPENAI_KEY',
  'OPENAI_SECRET_KEY',
  'OPEN_AI_KEY',
  'AI_API_KEY'
);
const anthropicKey = pickEnv('ANTHROPIC_API_KEY', 'CLAUDE_API_KEY');
const aiProvider = (pickEnv('AI_PROVIDER') || (anthropicKey && !aiKey ? 'anthropic' : 'openai')).toLowerCase();
const aiModel = pickEnv('OPENAI_MODEL', 'AI_MODEL') || 'gpt-4o-mini';
const anthropicModel = pickEnv('ANTHROPIC_MODEL', 'CLAUDE_MODEL') || 'claude-3-5-sonnet-latest';
const upiId = pickEnv('UPI_ID', 'PAYMENT_UPI_ID') || 'uft@upi';
const adminEmail = normalizeEmail(pickEnv('ADMIN_EMAIL') || 'Hzzzx06@gmail.com');

function pickEnv(...names) {
  for (const name of names) {
    const raw = process.env[name];
    if (typeof raw !== 'string') continue;
    const value = raw.trim().replace(/^['"]|['"]$/g, '');
    if (value && value !== 'undefined') return value;
  }
  return '';
}

function isValidGoogleClientId(value) {
  return /^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(String(value || '').trim());
}

function createRateLimiter({ windowMs, limit, keyPrefix }) {
  const buckets = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of buckets.entries()) {
      if (now >= data.resetAt) buckets.delete(key);
    }
  }, Math.max(windowMs, 30_000)).unref?.();

  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip || req.headers['x-forwarded-for'] || 'anon'}`;
    const now = Date.now();
    const entry = buckets.get(key) || { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }
    entry.count += 1;
    buckets.set(key, entry);
    if (entry.count > limit) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }
    next();
  };
}

function cleanText(input, maxLen = 1000) {
  return String(input || '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\b(select|insert|update|delete|drop|alter|union|exec|truncate)\b/gi, '')
    .replace(/[<>`{}[\]\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function loginSession(req, user, res, callback) {
  req.session.regenerate((regenErr) => {
    if (regenErr) {
      return callback(regenErr);
    }
    req.login(user, (loginErr) => {
      if (!loginErr) setAuthCookie(res, user);
      callback(loginErr);
    });
  });
}

function parseCookies(req) {
  return String(req.headers.cookie || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const index = part.indexOf('=');
      if (index > -1) acc[decodeURIComponent(part.slice(0, index))] = decodeURIComponent(part.slice(index + 1));
      return acc;
    }, {});
}

function getAuthSecret() {
  return process.env.SESSION_SECRET || 'uft-local-dev-secret-change-me';
}

function signValue(value) {
  return crypto.createHmac('sha256', getAuthSecret()).update(value).digest('hex');
}

function buildAuthPayload(user, extra = {}) {
  return {
    id: user.id,
    email: normalizeEmail(user.email || user.emails?.[0]?.value || ''),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Learner',
    avatar: user.avatar || user.photos?.[0]?.value || '',
    provider: user.provider || 'local',
    ts: Date.now(),
    ...extra
  };
}

function encodeSignedPayload(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${signValue(encoded)}`;
}

function decodeSignedPayload(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature || signValue(payload) !== signature) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch (_) {
    return null;
  }
}

function setAuthCookie(res, user) {
  const token = encodeSignedPayload(buildAuthPayload(user));
  const parts = [
    `hr_auth=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=86400'
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', 'hr_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}

function userFromAuthCookie(req) {
  const data = decodeSignedPayload(parseCookies(req).hr_auth || '');
  if (!data?.email) return null;
  const users = loadUsers();
  return users.find((user) =>
    String(user.id) === String(data.id) ||
    normalizeEmail(user.email || user.emails?.[0]?.value || '') === normalizeEmail(data.email || '')
  ) || {
    id: data.id,
    email: data.email,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    displayName: data.displayName || data.email,
    avatar: data.avatar || '',
    provider: data.provider || 'local'
  };
}

function getAuthenticatedUser(req) {
  if (req.isAuthenticated?.() && req.user) return req.user;
  return userFromAuthCookie(req);
}

function createAccountToken(user) {
  return encodeSignedPayload(buildAuthPayload(user, {
    purpose: 'local-account',
    passwordHash: user.passwordHash || '',
    createdAt: user.createdAt || new Date().toISOString()
  }));
}

function userFromAccountToken(token, email, password) {
  const data = decodeSignedPayload(token);
  if (!data || data.purpose !== 'local-account') return null;
  if (normalizeEmail(data.email || '') !== normalizeEmail(email || '')) return null;
  if (!verifyPassword(password, data.passwordHash)) return null;
  return {
    id: data.id,
    email: data.email,
    passwordHash: data.passwordHash,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    displayName: data.displayName || data.email,
    avatar: data.avatar || '',
    provider: data.provider || 'local',
    createdAt: data.createdAt || new Date().toISOString()
  };
}

function createNotesDownloadToken(tx) {
  return encodeSignedPayload({
    purpose: 'notes-download',
    productId: tx.productId,
    orderId: tx.orderId,
    paymentId: tx.paymentId,
    exp: Date.now() + 180 * 24 * 60 * 60 * 1000
  });
}

function verifyNotesDownloadToken(token, productId) {
  const data = decodeSignedPayload(token);
  if (!data || data.purpose !== 'notes-download') return null;
  if (data.productId !== productId) return null;
  if (!data.exp || Date.now() > Number(data.exp)) return null;
  return data;
}

const NOTES_PROMO_AMOUNT = 2;
const NOTES_PROMO_DURATION_MS = 10 * 60 * 1000;

function resolveNotesAsset(fileName) {
  const cleanName = path.basename(String(fileName || ''));
  if (!cleanName || cleanName !== String(fileName || '')) return null;
  const resolved = path.resolve(notesAssetsDir, cleanName);
  const root = path.resolve(notesAssetsDir) + path.sep;
  return resolved.startsWith(root) ? resolved : null;
}

function loadConfiguredHandbooks() {
  try {
    if (!fs.existsSync(handbooksFile)) return {};
    const parsed = JSON.parse(fs.readFileSync(handbooksFile, 'utf8') || '[]');
    const list = Array.isArray(parsed) ? parsed : parsed.handbooks;
    if (!Array.isArray(list)) return {};
    return list.reduce((map, item) => {
      const productId = cleanText(item.productId || item.id || '', 80).toLowerCase();
      const filePath = resolveNotesAsset(item.fileName || item.file || '');
      const amount = Number(item.amount || item.price || 399);
      if (!productId || !filePath || !amount || amount < 1) return map;
      map[productId] = {
        productType: 'notes',
        productId,
        courseId: Number(item.courseId || 0) || null,
        title: cleanText(item.title || 'Paid Handbook', 120),
        amount,
        originalAmount: Number(item.originalAmount || item.orig || amount) || amount,
        currency: cleanText(item.currency || 'INR', 10).toUpperCase(),
        assetUrl: `/api/notes/download/${encodeURIComponent(productId)}`,
        filePath,
        downloadName: cleanText(item.downloadName || `${productId}.pdf`, 120),
        category: cleanText(item.category || 'Project Handbook', 80),
        subtitle: cleanText(item.subtitle || 'Paid project handbook with practical steps and revision support.', 180),
        status: item.status === 'coming-soon' ? 'coming-soon' : 'available'
      };
      return map;
    }, {});
  } catch (err) {
    console.error('Error reading handbooks config:', err);
    return {};
  }
}

function createNotesPromoToken(productId) {
  return encodeSignedPayload({
    purpose: 'notes-promo',
    productId,
    amount: NOTES_PROMO_AMOUNT,
    exp: Date.now() + NOTES_PROMO_DURATION_MS
  });
}

function verifyNotesPromoToken(token, productId) {
  const data = decodeSignedPayload(token);
  if (!data || data.purpose !== 'notes-promo') return null;
  if (data.productId !== productId) return null;
  if (!data.exp || Date.now() > Number(data.exp)) return null;
  if (Number(data.amount) !== NOTES_PROMO_AMOUNT) return null;
  return data;
}

const LIVE_COURSE_PRODUCTS = {
  3: {
    productType: 'course',
    courseId: 3,
    title: 'Data Science',
    amount: 499,
    currency: 'INR',
    status: 'live'
  }
};

const NOTES_PRODUCTS = {
  'notes-3': {
    productType: 'notes',
    productId: 'notes-3',
    courseId: 3,
    title: 'Data Science Handbook',
    amount: 399,
    originalAmount: 999,
    currency: 'INR',
    assetUrl: '/api/notes/download/notes-3',
    filePath: dataScienceNotesFile,
    downloadName: 'humaixo-data-science-handbook.pdf',
    category: 'Data Skills',
    subtitle: 'Paid handbook for Data Science: Python revision points, practice flow, and project guidance.',
    status: 'available'
  },
  ...loadConfiguredHandbooks()
};

function loadTransactions() {
  try {
    if (!fs.existsSync(transactionsFile)) return { orders: {}, legacy: [] };
    const raw = JSON.parse(fs.readFileSync(transactionsFile, 'utf8') || '{}');
    if (Array.isArray(raw)) return { orders: {}, legacy: raw };
    return {
      orders: raw.orders && typeof raw.orders === 'object' ? raw.orders : {},
      legacy: Array.isArray(raw.legacy) ? raw.legacy : []
    };
  } catch (err) {
    console.error('Error reading transactions file:', err);
    return { orders: {}, legacy: [] };
  }
}

function saveTransactions(data) {
  try {
    fs.writeFileSync(transactionsFile, JSON.stringify(data || { orders: {}, legacy: [] }, null, 2));
  } catch (err) {
    console.error('Error writing transactions file:', err);
  }
}

function paymentProductSnapshot(product) {
  return {
    productType: product.productType,
    productId: product.productId || `course-${product.courseId}`,
    courseId: product.courseId || '',
    title: product.title,
    amount: product.amount,
    originalAmount: product.originalAmount || '',
    currency: product.currency || 'INR',
    assetUrl: product.assetUrl || '',
    promoApplied: product.promoApplied ? '1' : ''
  };
}

function transactionFromProduct(orderId, product, status = 'created') {
  return {
    id: `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    orderId,
    productType: product.productType,
    productId: product.productId || `course-${product.courseId}`,
    courseId: product.courseId || null,
    title: product.title,
    amount: Number(product.amount),
    originalAmount: product.originalAmount || null,
    currency: product.currency || 'INR',
    assetUrl: product.assetUrl || '',
    promoApplied: Boolean(product.promoApplied),
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

async function recoverTransactionFromRazorpayOrder(orderId) {
  if (!razorpay || !orderId) return null;
  try {
    const order = await razorpay.orders.fetch(orderId);
    const notes = order?.notes || {};
    const productType = cleanText(notes.productType || '', 40).toLowerCase();
    const productId = cleanText(notes.productId || '', 80).toLowerCase();
    const courseId = Number(notes.courseId || 0);
    const baseProduct =
      productType === 'notes'
        ? NOTES_PRODUCTS[productId || `notes-${courseId}`]
        : LIVE_COURSE_PRODUCTS[courseId];
    if (!baseProduct) return null;

    const amount = Number(notes.amount || 0);
    const expectedAmounts = new Set([
      Number(baseProduct.amount),
      ...(baseProduct.productType === 'notes' ? [1, NOTES_PROMO_AMOUNT] : [])
    ]);
    if (!expectedAmounts.has(amount) || Math.round(amount * 100) !== Number(order.amount)) {
      return null;
    }

    return transactionFromProduct(orderId, {
      ...baseProduct,
      amount,
      promoApplied: String(notes.promoApplied || '') === '1'
    });
  } catch (err) {
    console.error('Could not recover Razorpay order metadata:', err?.message || err);
    return null;
  }
}

function resolvePaymentProduct(body = {}) {
  const productType = cleanText(body.productType || '', 40).toLowerCase();
  const courseId = Number(body.courseId);
  const productId = cleanText(body.productId || '', 80).toLowerCase();

  if (productType === 'notes' || productId.startsWith('notes-')) {
    const key = productId || `notes-${courseId}`;
    const product = NOTES_PRODUCTS[key];
    if (!product || product.status !== 'available') return null;
    const promo = verifyNotesPromoToken(body.promoToken || '', key);
    if (promo) {
      return { ...product, amount: NOTES_PROMO_AMOUNT, promoAmount: NOTES_PROMO_AMOUNT, promoExpiresAt: promo.exp, promoApplied: true };
    }
    return { ...product };
  }

  if (productType === 'course' || courseId) {
    const product = LIVE_COURSE_PRODUCTS[courseId];
    if (!product || product.status !== 'live') return null;
    return { ...product };
  }

  return null;
}

function sendMaintenancePage(res, statusCode = 503) {
  res.status(statusCode).type('html').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>HUMAIXO | Temporarily Unavailable</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#030014;color:#e2e8f0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif}
main{width:min(560px,92vw);padding:32px;border:1px solid rgba(148,163,184,.22);border-radius:22px;background:rgba(15,23,42,.72);box-shadow:0 24px 90px rgba(0,0,0,.4)}
h1{margin:0 0 10px;font-size:clamp(28px,5vw,44px);line-height:1;background:linear-gradient(90deg,#38bdf8,#a78bfa,#ff7ab8);-webkit-background-clip:text;background-clip:text;color:transparent}
p{color:#cbd5e1;line-height:1.7}
a{display:inline-flex;margin-top:14px;color:#38bdf8;font-weight:800;text-decoration:none}
</style>
</head>
<body><main><h1>HUMAIXO</h1><p>The platform shell is temporarily unavailable. Please refresh in a moment. The health endpoint is active, so the service can recover cleanly after deployment updates.</p><a href="/">Try again</a></main></body>
</html>`);
}

function sendAppShell(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  if (!fs.existsSync(appShellFile)) {
    console.error('App shell file missing:', appShellFile);
    return sendMaintenancePage(res, 503);
  }
  res.sendFile(appShellFile, (err) => {
    if (err) {
      console.error('App shell delivery error:', err);
      if (!res.headersSent) sendMaintenancePage(res, 503);
    }
  });
}

const rateLimiters = {
  ai: createRateLimiter({ windowMs: 60_000, limit: 25, keyPrefix: 'ai' }),
  auth: createRateLimiter({ windowMs: 60_000, limit: 12, keyPrefix: 'auth' }),
  contact: createRateLimiter({ windowMs: 60_000, limit: 20, keyPrefix: 'contact' }),
  payment: createRateLimiter({ windowMs: 60_000, limit: 20, keyPrefix: 'payment' })
};

const razorpayKeyId = pickEnv(
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEYID',
  'RAZORPAY_ID',
  'RAZORPAY_LIVE_KEY_ID',
  'RAZORPAY_TEST_KEY_ID',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID'
);
const razorpayKeySecret = pickEnv(
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_KEYSECRET',
  'RAZORPAY_SECRET',
  'RAZORPAY_LIVE_KEY_SECRET',
  'RAZORPAY_TEST_KEY_SECRET'
);
let razorpay = null;

const hasRazorpayKeys = razorpayKeyId && razorpayKeyId !== 'undefined' && razorpayKeySecret && razorpayKeySecret !== 'undefined';
if (hasRazorpayKeys) {
  try {
    razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });
  } catch (err) {
    console.warn('Razorpay initialization failed:', err.message || err);
    razorpay = null;
  }
} else {
  console.warn('Razorpay credentials are not configured or invalid. Payment endpoints will be disabled.');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/manifest.webmanifest', (req, res) => {
  res.type('application/manifest+json');
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.sendFile(manifestFile);
});

app.use('/assets/notes', (req, res) => {
  res.status(403).json({ error: 'Notes are available only after successful payment.' });
});

const BLOCKED_STATIC_BASENAMES = new Set([
  'backend.js',
  'package.json',
  'package-lock.json',
  'vercel.json',
  'users.json',
  'contacts.json',
  'feedback.json',
  'enrollments.json',
  'transactions.json',
  'newsletters.json',
  'memory-notes.json',
  'workspace-tasks.json',
  'sem-plans.json',
  'travel-bookings.json',
  'travel-searches.json',
  'HUMAIX_REALM_BACKEND_AUDIT.md',
  'SECURITY.md'
]);

app.use((req, res, next) => {
  let pathname = '/';
  try {
    pathname = decodeURIComponent(new URL(req.originalUrl, 'http://localhost').pathname);
  } catch (_) {
    pathname = req.path || '/';
  }
  const basename = path.basename(pathname);
  const blocked =
    pathname.startsWith('/.') ||
    pathname.startsWith('/scripts/') ||
    BLOCKED_STATIC_BASENAMES.has(basename) ||
    /^\/(?:.*\/)?[^/]*\.(?:env|log|md|map)$/i.test(pathname);
  if (blocked) {
    return res.status(404).type('text/plain').send('Not found');
  }
  next();
});

app.use(express.static(__dirname, {
  setHeaders(res, filePath) {
    const fileName = path.basename(filePath);
    if (fileName === 'app-shell.html' || fileName === 'manifest.webmanifest' || fileName === 'service-worker.js') {
      res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Session
app.use(session({
  name: 'uft.sid',
  secret: process.env.SESSION_SECRET || 'uft-local-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const googleClientIdRaw = pickEnv('GOOGLE_CLIENT_ID', 'NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'GOOGLE_WEB_CLIENT_ID');
const googleClientId = isValidGoogleClientId(googleClientIdRaw) ? googleClientIdRaw : '';
const googleClientSecret = pickEnv('GOOGLE_CLIENT_SECRET');
const hasGoogleClientId = Boolean(googleClientId);
const hasGoogleOAuth = Boolean(hasGoogleClientId && googleClientSecret);
const googleCallbackUrl = (process.env.GOOGLE_CALLBACK_URL || `${baseUrl}/auth/google/callback`).replace(/\/$/, '');

if (hasGoogleOAuth) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl,
    proxy: true
  }, (accessToken, refreshToken, profile, done) => {
    done(null, profile);
  }));
} else {
  if (!hasGoogleClientId) {
    console.warn('Google login is disabled. Set a valid GOOGLE_CLIENT_ID (web client id) to enable Google sign-in.');
  } else {
    console.warn('Google OAuth redirect flow is disabled until GOOGLE_CLIENT_SECRET is set. Direct GIS sign-in can still work.');
  }
}

app.get('/auth/google', (req, res, next) => {
  if (!hasGoogleOAuth) {
    if (hasGoogleClientId) {
      return res.redirect('/login');
    }
    return res.status(503).send('Google login is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/', (req, res, next) => {
  if (!hasGoogleOAuth) {
    if (hasGoogleClientId) {
      return res.redirect('/login');
    }
    return res.status(503).send('Google login is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', (req, res, next) => {
  if (!hasGoogleOAuth) {
    if (hasGoogleClientId) {
      return res.redirect('/login');
    }
    return res.status(503).send('Google login is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
  }
  next();
}, passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  clearAuthCookie(res);
  req.logout(() => {
    res.redirect('/');
  });
});

function loadUsers() {
  let users = [];
  try {
    if (fs.existsSync(usersFile)) {
      users = JSON.parse(fs.readFileSync(usersFile, 'utf8') || '[]');
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }
  return users;
}

function saveUsers(users) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

function normalizeEmail(email) {
  const value = cleanText(email, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : '';
}

function isAdminUser(user) {
  return normalizeEmail(user?.email || user?.emails?.[0]?.value || '') === adminEmail;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(String(password), salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === candidate.length && crypto.timingSafeEqual(expected, candidate);
}

function publicUser(user) {
  return {
    id: user.id,
    displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Learner',
    email: user.email || user.emails?.[0]?.value || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatar: user.avatar || user.photos?.[0]?.value || '',
    provider: user.provider || 'local',
    isAdmin: isAdminUser(user)
  };
}

app.get('/api/user', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (user) {
    res.json(publicUser(user));
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    razorpayKeyId: razorpayKeyId || '',
    paymentEnabled: Boolean(razorpay && razorpayKeyId),
    razorpayKeyPresent: Boolean(razorpayKeyId),
    razorpaySecretPresent: Boolean(razorpayKeySecret),
    paymentStatus: Boolean(razorpay && razorpayKeyId)
      ? 'Razorpay checkout is active.'
      : 'Online checkout is temporarily unavailable.',
    upiId,
    googleEnabled: Boolean(hasGoogleOAuth),
    googleDirectEnabled: Boolean(hasGoogleClientId),
    googleRedirectEnabled: Boolean(hasGoogleOAuth),
    googleClientId: hasGoogleClientId ? googleClientId : '',
    googleCallbackUrl,
    googleStatus: hasGoogleClientId
      ? (hasGoogleOAuth
          ? 'Google sign-in is ready.'
          : 'Google client ID is present. Add GOOGLE_CLIENT_SECRET only if you want redirect OAuth; the direct Google button can still work.')
      : (googleClientIdRaw
          ? 'Google client ID is present but invalid. Use a Web OAuth client ID ending in .apps.googleusercontent.com.'
          : 'Google login is not configured on this deployment. Add a valid GOOGLE_CLIENT_ID to enable it.'),
    aiEnabled: Boolean(aiKey || anthropicKey),
    aiProvider: aiKey || anthropicKey ? aiProvider : 'local'
  });
});

app.get(['/healthz', '/api/health'], (req, res) => {
  res.json({
    ok: true,
    service: 'humaix-realm',
    shell: fs.existsSync(appShellFile),
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    time: new Date().toISOString()
  });
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    'User-agent: *\n' +
    'Allow: /\n' +
    `Sitemap: ${baseUrl}/sitemap.xml\n`
  );
});

app.get('/sitemap.xml', (req, res) => {
  const routes = [
    '/',
    '/workspace',
    '/memory',
    '/security-lab',
    '/academy',
    '/courses',
    '/@Deep',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/refund-policy'
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    routes.map((route) => `<url><loc>${baseUrl}${route}</loc></url>`).join('') +
    `</urlset>`;
  res.type('application/xml').send(body);
});

app.get(['/studio', '/community', '/growth', '/blog'], (req, res) => {
  res.redirect(301, '/academy');
});

app.get('/dashboard', (req, res) => {
  if (!getAuthenticatedUser(req)) {
    return res.redirect('/#login');
  }
  return res.sendFile(appShellFile);
});

app.get('/admin', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.redirect('/#login');
  }
  if (!isAdminUser(user)) {
    return res.status(403).send('Admin access restricted.');
  }
  return res.sendFile(appShellFile);
});

app.post('/api/signup', rateLimiters.auth, (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const users = loadUsers();
  if (users.find(u => normalizeEmail(u.email) === normalizedEmail)) {
    return res.status(400).json({ error: 'Email is already registered.' });
  }

  const user = {
    id: Date.now(),
    email: normalizedEmail,
    password: '',
    passwordHash: hashPassword(password),
    firstName: firstName || '',
    lastName: lastName || '',
    displayName: `${firstName || ''} ${lastName || ''}`.trim() || normalizedEmail,
    provider: 'local',
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);

  loginSession(req, user, res, (err) => {
    if (err) {
      console.error('Signup login error:', err);
      return res.status(500).json({ error: 'Signup failed.' });
    }
    res.json({ user: publicUser(user), accountToken: createAccountToken(user) });
  });
});

app.post('/api/login', rateLimiters.auth, (req, res) => {
  const { email, password, accountToken } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = loadUsers();
  let user = users.find(u => normalizeEmail(u.email) === normalizedEmail);
  if (!user && accountToken) {
    user = userFromAccountToken(accountToken, normalizedEmail, password);
  }
  const passwordMatches =
    user &&
    (verifyPassword(password, user.passwordHash) ||
      (user.password && user.password === password));
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  if (!user.passwordHash && user.password) {
    user.passwordHash = hashPassword(password);
    user.password = '';
    saveUsers(users);
  }

  loginSession(req, user, res, (err) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Login failed.' });
    }
    res.json({ user: publicUser(user), accountToken: createAccountToken(user) });
  });
});

app.post('/api/auth/google-token', rateLimiters.auth, async (req, res) => {
  const { credential } = req.body;
  if (!hasGoogleClientId) {
    return res.status(503).json({ error: 'Google client ID is not configured.' });
  }
  if (!credential) {
    return res.status(400).json({ error: 'Google credential is required.' });
  }

  try {
    const tokenResp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    const tokenInfo = await tokenResp.json();
    if (!tokenResp.ok) {
      console.error('Google token verification failed:', tokenInfo);
      return res.status(401).json({ error: 'Google sign-in verification failed.' });
    }
    if (tokenInfo.aud !== googleClientId) {
      return res.status(401).json({ error: 'Google client mismatch.' });
    }
    if (tokenInfo.email_verified !== 'true' && tokenInfo.email_verified !== true) {
      return res.status(401).json({ error: 'Google email is not verified.' });
    }

    const email = String(tokenInfo.email || '').toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Google account email is missing.' });
    }

    const users = loadUsers();
    let user = users.find((item) => String(item.email || '').toLowerCase() === email);
    if (user) {
      user.googleId = tokenInfo.sub;
      user.provider = user.provider || 'google';
      user.displayName = user.displayName || tokenInfo.name || email;
      user.firstName = user.firstName || tokenInfo.given_name || '';
      user.lastName = user.lastName || tokenInfo.family_name || '';
      user.avatar = tokenInfo.picture || user.avatar || '';
    } else {
      user = {
        id: `google_${tokenInfo.sub}`,
        googleId: tokenInfo.sub,
        provider: 'google',
        email,
        password: '',
        firstName: tokenInfo.given_name || '',
        lastName: tokenInfo.family_name || '',
        displayName: tokenInfo.name || email,
        avatar: tokenInfo.picture || '',
        createdAt: new Date().toISOString()
      };
      users.push(user);
    }
    saveUsers(users);

    loginSession(req, user, res, (err) => {
      if (err) {
        console.error('Google token login error:', err);
        return res.status(500).json({ error: 'Google login failed.' });
      }
      res.json({ user: publicUser(user), accountToken: createAccountToken(user) });
    });
  } catch (err) {
    console.error('Google token auth error:', err);
    res.status(500).json({ error: 'Google sign-in is temporarily unavailable.' });
  }
});

app.post('/api/logout', (req, res) => {
  clearAuthCookie(res);
  req.logout(() => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });
});

app.post('/api/ai', rateLimiters.ai, async (req, res) => {
  const { system, messages } = req.body;
  const lastUserMessage = [...(messages || [])].reverse().find((message) => message.role !== 'assistant')?.content || '';
  const fallbackAiReply = buildLocalAiReply(lastUserMessage);
  const safetySystem = [
    'Cyber safety rule: help only with owned systems, private labs, CTFs, toy examples, defensive checklists, secure coding, log review, responsible disclosure, and vulnerability report writing.',
    'Refuse requests to hack real targets, public websites, accounts, Wi-Fi, phones, payment systems, credentials, malware, phishing, bypassing security, exfiltration, persistence, evasion, or unauthorized exploitation.',
    'For lost or stolen devices, provide only official recovery steps such as Google Find My Device, Apple Find My, SIM blocking, account security, IMEI/serial documentation, and police report guidance. Do not provide secret tracking, phone-number tracing, SIM tracking, doxxing, stalking, account hacking, or surveillance.',
    'When refusing, redirect to a legal sandbox, CTF, defensive checklist, or responsible report template.'
  ].join(' ');
  const effectiveSystem = `${safetySystem}\n\n${cleanText(system || 'You are a helpful assistant.', 6000)}`;
  if (!aiKey && !anthropicKey) {
    return res.json({
      reply: fallbackAiReply,
      modelUsed: 'local-uft-assistant',
      fallback: true
    });
  }

  const normalizedMessages = (messages || []).map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: cleanText(message.content, 4000)
  }));

  if (anthropicKey && aiProvider === 'anthropic') {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: anthropicModel,
          system: effectiveSystem,
          messages: normalizedMessages,
          max_tokens: 900
        })
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (_) {
        data = { error: raw };
      }

      if (!response.ok) {
        return res.json({
          reply: fallbackAiReply,
          modelUsed: 'local-uft-assistant',
          fallback: true,
          provider: 'anthropic',
          providerError: data?.error?.message || data?.message || 'Claude request failed.',
          modelTried: anthropicModel
        });
      }

      const reply = (data.content || []).map((part) => part.text || '').join('').trim();
      return res.json({ reply: reply || 'Sorry, I could not get a response.', modelUsed: anthropicModel, raw: data });
    } catch (err) {
      console.error('Claude API error:', err);
      return res.json({
        reply: fallbackAiReply,
        modelUsed: 'local-uft-assistant',
        fallback: true,
        provider: 'anthropic',
        providerError: err.message || String(err),
        modelTried: anthropicModel
      });
    }
  }

  if (!aiKey) {
    return res.json({
      reply: fallbackAiReply,
      modelUsed: 'local-uft-assistant',
      fallback: true
    });
  }

  const modelsToTry = [aiModel, 'gpt-4o-mini', 'gpt-4.1-mini'].filter(Boolean).filter((m, i, arr) => arr.indexOf(m) === i);

  try {
    let lastFailure = null;

    for (const model of modelsToTry) {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiKey}`
        },
        body: JSON.stringify({
          model,
          instructions: effectiveSystem,
          input: normalizedMessages,
          max_output_tokens: 800,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply =
          data.output_text ||
          data.output?.flatMap(item => item.content || []).map(part => part.text || '').join('').trim() ||
          'Sorry, I could not get a response.';
        return res.json({ reply, modelUsed: model, raw: data });
      }

      const bodyText = await response.text();
      let reason = bodyText;
      try {
        const parsed = JSON.parse(bodyText);
        reason =
          parsed?.error?.message ||
          parsed?.message ||
          bodyText;
      } catch (_) {
        // keep original text as reason
      }

      lastFailure = { model, status: response.status, reason };
      const isRetryable = response.status === 400 || response.status === 404 || response.status === 429;
      if (!isRetryable) break;
    }

    const safeReason = lastFailure?.reason || 'Unknown AI provider error.';
    console.error('OpenAI API error:', lastFailure);
    return res.json({
      reply: fallbackAiReply,
      modelUsed: 'local-uft-assistant',
      fallback: true,
      provider: 'openai',
      providerError: safeReason,
      modelTried: lastFailure?.model || aiModel
    });
  } catch (err) {
    console.error('AI proxy error:', err);
    res.json({
      reply: fallbackAiReply,
      modelUsed: 'local-uft-assistant',
      fallback: true,
      provider: 'openai',
      providerError: err.message || String(err),
      modelTried: aiModel
    });
  }
});

const courseCatalog = [
  { title: 'Basic to Advanced English', price: 299, original: 1499, hours: '8', category: 'English Communication', status: 'Coming Soon', bestFor: 'grammar, vocabulary, speaking confidence, communication' },
  { title: 'Python for Beginner', price: 399, original: 1999, hours: '7', category: 'Python Programming', status: 'Coming Soon', bestFor: 'coding basics, logic, loops, functions, beginner projects' },
  { title: 'Data Science', price: 499, original: 2499, hours: '9', category: 'Data Science', status: 'Live Now', bestFor: 'Python data analysis, charts, datasets, portfolio project' },
  { title: 'Video Editing for Beginner', price: 349, original: 1799, hours: '6', category: 'Video Editing', status: 'Coming Soon', bestFor: 'clean cuts, captions, reels, audio, creator workflow' },
  { title: 'Vibe Coding & Web Development', price: 599, original: 2999, hours: '10', category: 'Web Development', status: 'Coming Soon', bestFor: 'websites, frontend layout, creative coding, landing pages' },
  { title: 'Life Circle & Life Journey', price: 249, original: 1299, hours: '5', category: 'Life Skills', status: 'Coming Soon', bestFor: 'habits, mindset, discipline, direction, personal growth' }
];

function buildCourseList() {
  return courseCatalog
    .map((course) => `${course.title} - ${course.status}, ${course.status === 'Live Now' ? `INR ${course.price}, ` : ''}${course.hours} hrs, ${course.category}, beginner-friendly English`)
    .join('\n');
}

function loadEnrollments() {
  try {
    if (!fs.existsSync(enrollmentsFile)) return {};
    const parsed = JSON.parse(fs.readFileSync(enrollmentsFile, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.error('Error reading enrollments file:', err);
    return {};
  }
}

function saveEnrollments(enrollments) {
  try {
    fs.writeFileSync(enrollmentsFile, JSON.stringify(enrollments || {}, null, 2));
  } catch (err) {
    console.error('Error writing enrollments file:', err);
  }
}

function getUserEnrollmentKey(user) {
  return String(user?.id || normalizeEmail(user?.email || '') || '');
}

function buildSiteSummary() {
  return [
    'HUMAIXO is a premium AI + tech learning website.',
    'Founder/instructor shown on the site: Harish Singh.',
    'Primary contact: Hzzzx06@gmail.com.',
    'Main pages: Home, Academy, Security Lab, Courses, Notes, About, Contact, Login, Sign Up, and Dashboard.',
    'Key features: premium hero design, beginner-friendly courses, ethical security practice lab, course thumbnails, AI assistant, Razorpay checkout, contact form, feedback form, paid notes, and a learner dashboard.',
    'Course benefits: account-based course access, mobile/tablet access, learning resources, email support for payment/access issues, and certificates after eligible course completion.'
  ].join('\n');
}

function isCyberSecurityTopic(text) {
  return /(hack|hacking|ethical hacking|security|cyber|ctf|vulnerability|owasp|pentest|penetration|xss|sql injection|csrf|authentication|authorization|malware|phishing|exploit|bypass|password|credential|wifi|server|website|phone|account)/i.test(text || '');
}

function isLostDeviceTopic(text) {
  return /(lost|stolen|chori|chor|theft|track|trace|location|find my phone|find my device|imei|sim|number|mobile|phone)/i.test(text || '');
}

function buildLostDeviceReply() {
  return 'I cannot secretly track a person, phone number, live location, SIM, WhatsApp, account, or device. That can violate privacy and law.\n\nLegal recovery steps:\n1. Android: use Google Find My Device from google.com/android/find.\n2. iPhone: use Apple Find My from icloud.com/find.\n3. Mark the device lost, ring/secure/erase only through the official account.\n4. Change your Google/Apple/email passwords and revoke unknown sessions.\n5. Block the SIM through your mobile operator.\n6. Keep IMEI/serial number, invoice, last known place/time, and file a police report.\n7. If a location appears in an official app, share it with police; do not confront anyone yourself.\n\nUse the Lost Device Recovery section on the Security Lab page to create a report draft and checklist.';
}

function isUnsafeCyberRequest(text) {
  return /(hack|attack|exploit|bypass|crack|steal|phish|malware|ransomware|keylogger|credential|password|otp|session|cookie|token|wifi|instagram|facebook|gmail|whatsapp|bank|payment|server|website|phone|device|ddos|botnet)/i.test(text || '') &&
    !/(own|owned|my app|my website|my server|lab|sandbox|ctf|toy|demo|authorized|permission|defensive|checklist|report|learn|practice|secure coding|owasp)/i.test(text || '');
}

function buildSafeCyberReply(question) {
  if (isUnsafeCyberRequest(question)) {
    return 'I cannot help hack real targets, accounts, public websites, Wi-Fi, phones, payment systems, credentials, malware, phishing, bypassing security, or anything without clear permission.\n\nSafe alternative: use the Ethical Security Lab for owned systems, CTFs, toy examples, defensive checklists, secure coding review, log review, and responsible vulnerability reports.\n\nTry this prompt: "I own a demo login page. Give me a beginner-safe authentication security checklist and a responsible report template."';
  }
  return 'Ethical Security Lab safe plan:\n\n1. Scope: confirm the system is yours, a private lab, or a CTF challenge.\n2. Rules: do not test public targets or real users without written permission.\n3. Checklist: review authentication, authorization, input validation, secure headers, error messages, dependency updates, logging, and backup readiness.\n4. Practice safely: use dummy accounts, toy examples, and non-sensitive data.\n5. Report: write title, scope, impact, safe reproduction notes, evidence, severity, recommended fix, and retest status.\n\nIf you want, ask for a CTF-style lesson, secure-code checklist, or vulnerability report template.';
}

function findCourseByText(text) {
  return courseCatalog.find((course) => {
    const haystack = `${course.title} ${course.category} ${course.bestFor}`.toLowerCase();
    return haystack.split(/[\s,]+/).some((word) => word.length > 3 && text.includes(word));
  });
}

function buildLocalAiReply(question) {
  const raw = String(question || '').trim();
  const text = raw.toLowerCase();
  const course = findCourseByText(text);
  const prefix = '';

  if (!raw) {
    return 'Ask me about any HUMAIXO course, fees, payment, roadmap, language, certificate, or support.';
  }

  if (isLostDeviceTopic(text)) {
    return buildLostDeviceReply();
  }

  if (isCyberSecurityTopic(text)) {
    return buildSafeCyberReply(raw);
  }

  if (/(site|website|about|home|home page|features|pages|founder|harish|who made|what is this|full details|details)/.test(text)) {
    return prefix + buildSiteSummary() + "\n\nCourse catalog:\n" + buildCourseList();
  }

  if (/(all|list|courses|course|fees|price|pricing)/.test(text) && !course) {
    return prefix + "Current launch status: Data Science is launched. Other courses are visible as Coming Soon roadmap items.\n\n" + buildCourseList();
  }

  if (course) {
    if (course.status !== 'Live Now') {
      return prefix + course.title + " is marked Coming Soon. It is a planned " + course.hours + "-hour " + course.category + " course in beginner-friendly English, best for " + course.bestFor + ". For now, only Data Science is open for enrollment.";
    }
    return prefix + course.title + " is live now. It is a " + course.hours + "-hour " + course.category + " course in beginner-friendly English. Fee: INR " + course.price + " (original INR " + course.original + "). It is best for " + course.bestFor + ". Open the course card, then tap Pay Securely for Razorpay checkout.";
  }

  if (/(payment|pay|upi|razorpay|checkout)/.test(text)) {
    return 'Payment is prepared through Razorpay Secure Checkout for the launched Data Science course. Other courses are Coming Soon until launch content is ready.';
  }

  if (/(certificate|certificat)/.test(text)) {
    return 'Certificates are designed to unlock after eligible course completion. The site avoids public certificate claims until course work is actually completed.';
  }

  if (/(language|english|medium)/.test(text)) {
    return 'Courses are written in clear, beginner-friendly English with simple technical explanations.';
  }

  if (/(contact|support|help|email|whatsapp)/.test(text)) {
    return 'For support, use the Contact page or email Hzzzx06@gmail.com. Payment and access issues should include the order ID if available.';
  }

  if (/(career|job|earn|earning|income)/.test(text)) {
    return 'For the current launch, start with Data Science because it is the launched course. English, Python for Beginner, Video Editing, Web Development, and Life Skills are Coming Soon.';
  }

  return prefix + "Here is the practical HUMAIXO answer: Data Science is launched right now. Other tracks are visible as Coming Soon roadmap items and will open later.";
}
app.post('/api/contact', rateLimiters.contact, (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required.' });
  }

  const entry = {
    id: Date.now(),
    firstName: cleanText(firstName, 80),
    lastName: cleanText(lastName, 80),
    email: cleanText(email, 160),
    subject: cleanText(subject, 120) || 'General',
    message: cleanText(message, 4000),
    receivedAt: new Date().toISOString()
  };

  let contacts = [];
  try {
    if (fs.existsSync(dataFile)) {
      contacts = JSON.parse(fs.readFileSync(dataFile, 'utf8') || '[]');
    }
  } catch (err) {
    console.error('Error reading contacts file:', err);
  }

  contacts.push(entry);

  try {
    fs.writeFileSync(dataFile, JSON.stringify(contacts, null, 2));
  } catch (err) {
    console.error('Error writing contacts file:', err);
    return res.status(500).json({ error: 'Unable to save contact message.' });
  }

  console.log('New contact request received:', entry);
  res.status(201).json({ status: 'ok', message: 'Contact request received.' });
});

app.get('/api/contacts', (req, res) => {
  try {
    if (!fs.existsSync(dataFile)) {
      return res.json([]);
    }
    const contacts = JSON.parse(fs.readFileSync(dataFile, 'utf8') || '[]');
    res.json(contacts);
  } catch (err) {
    console.error('Error reading contacts file:', err);
    res.status(500).json({ error: 'Unable to load contacts.' });
  }
});

app.post('/api/feedback', rateLimiters.contact, (req, res) => {
  const { course, review } = req.body;
  if (!course || !review) {
    return res.status(400).json({ error: 'Course and review are required.' });
  }

  const feedbackFile = path.join(__dirname, 'feedback.json');
  let feedbacks = [];
  try {
    if (fs.existsSync(feedbackFile)) {
      feedbacks = JSON.parse(fs.readFileSync(feedbackFile, 'utf8') || '[]');
    }
  } catch (err) {
    console.error('Error reading feedback file:', err);
  }

  feedbacks.push({
    id: Date.now(),
    course: cleanText(course, 160),
    review: cleanText(review, 4000),
    submittedAt: new Date().toISOString()
  });

  try {
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));
  } catch (err) {
    console.error('Error writing feedback file:', err);
    return res.status(500).json({ error: 'Unable to save feedback.' });
  }

  console.log('New course question received:', { course, review });
  res.status(201).json({ status: 'ok', message: 'Feedback received.' });
});

app.post('/api/create-order', rateLimiters.payment, async (req, res) => {
  if (!razorpay) {
    return res.status(500).json({ error: 'Payment gateway is not configured on the server.' });
  }

  const product = resolvePaymentProduct(req.body || {});
  if (!product) {
    return res.status(400).json({ error: 'This item is not available for checkout yet.' });
  }
  if (product.productType === 'course' && !getAuthenticatedUser(req)) {
    return res.status(401).json({ error: 'Login required before course checkout.' });
  }

  try {
    const options = {
      amount: Math.round(product.amount * 100),
      currency: product.currency || 'INR',
      receipt: `hr_${product.productType}_${Date.now()}`,
      notes: paymentProductSnapshot(product)
    };
    const order = await razorpay.orders.create(options);
    const txData = loadTransactions();
    txData.orders[order.id] = transactionFromProduct(order.id, product);
    saveTransactions(txData);
    res.json(order);
  } catch (error) {
    const reason =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      'Unknown Razorpay error';
    console.error('Razorpay order creation error:', {
      reason,
      code: error?.error?.code || error?.code || '',
      statusCode: error?.statusCode || ''
    });
    res.status(500).json({ error: 'Unable to create order', reason });
  }
});

app.get('/api/notes/promo-token', rateLimiters.payment, (req, res) => {
  const productId = cleanText(req.query.productId || 'notes-3', 80).toLowerCase();
  const product = NOTES_PRODUCTS[productId];
  if (!product || product.status !== 'available') {
    return res.status(404).json({ error: 'Promo is not available for this notes pack.' });
  }
  const token = createNotesPromoToken(productId);
  const data = verifyNotesPromoToken(token, productId);
  res.json({
    productId,
    promoToken: token,
    promoPrice: NOTES_PROMO_AMOUNT,
    offerPrice: product.amount,
    actualPrice: product.originalAmount,
    expiresAt: data.exp
  });
});

app.get('/api/notes/products', (_req, res) => {
  const products = Object.values(NOTES_PRODUCTS)
    .filter((product) => product.status === 'available')
    .map((product) => ({
      productId: product.productId,
      courseId: product.courseId || '',
      title: product.title,
      amount: product.amount,
      originalAmount: product.originalAmount || product.amount,
      currency: product.currency || 'INR',
      assetUrl: product.assetUrl,
      category: product.category || 'Course Notes',
      subtitle: product.subtitle || 'Paid handbook with practical revision support.',
      status: product.status
    }));
  res.json({ products });
});

app.post('/api/verify-payment', rateLimiters.payment, async (req, res) => {
  if (!razorpayKeySecret) {
    return res.status(500).json({ error: 'Payment verification is not configured on the server.' });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature
  } = req.body || {};

  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'Payment verification details are missing.' });
  }

  const expected = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(String(signature), 'hex');
  const verified =
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!verified) {
    return res.status(400).json({ error: 'Payment signature verification failed.' });
  }

  const txData = loadTransactions();
  let tx = txData.orders[orderId];
  if (!tx) {
    tx = await recoverTransactionFromRazorpayOrder(orderId);
  }
  if (!tx) {
    return res.status(400).json({ error: 'Payment verified, but product metadata was not found. Please contact support with your payment ID.' });
  }
  tx.status = 'paid';
  tx.paymentId = paymentId;
  tx.verifiedAt = new Date().toISOString();
  tx.updatedAt = new Date().toISOString();
  txData.orders[orderId] = tx;
  saveTransactions(txData);

  const downloadToken = tx.productType === 'notes' ? createNotesDownloadToken(tx) : '';
  const downloadUrl = downloadToken ? `/api/notes/download/${encodeURIComponent(tx.productId)}?token=${encodeURIComponent(downloadToken)}` : '';
  res.json({ ok: true, paymentId, orderId, product: { ...tx, downloadUrl }, downloadUrl });
});

app.get('/api/notes/download/:productId', (req, res) => {
  const productId = cleanText(req.params.productId || '', 80).toLowerCase();
  const product = NOTES_PRODUCTS[productId];
  const tokenData = verifyNotesDownloadToken(req.query.token || '', productId);
  if (!product || !tokenData) {
    return res.status(403).type('text/plain').send('Payment verification is required before downloading these notes.');
  }
  if (!fs.existsSync(product.filePath)) {
    return res.status(404).type('text/plain').send('Notes file is temporarily unavailable.');
  }
  res.setHeader('Cache-Control', 'private, no-store');
  res.download(product.filePath, product.downloadName || 'humaix-handbook.pdf');
});

app.get('/api/enrollments', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Login required.' });
  }
  const key = getUserEnrollmentKey(user);
  const all = loadEnrollments();
  res.json(all[key] || {});
});

app.post('/api/enrollments/grant', rateLimiters.payment, async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Login required.' });
  }
  const courseId = Number(req.body?.courseId);
  const title = cleanText(req.body?.title || '', 160);
  const paymentId = cleanText(req.body?.paymentId || '', 160);
  const orderId = cleanText(req.body?.orderId || '', 160);
  if (!courseId || !paymentId || !orderId) {
    return res.status(400).json({ error: 'Verified payment details are required before course access is granted.' });
  }
  const key = getUserEnrollmentKey(user);
  const txData = loadTransactions();
  let tx = txData.orders[orderId];
  if (!tx) {
    tx = await recoverTransactionFromRazorpayOrder(orderId);
    if (tx && tx.paymentId !== paymentId) {
      tx.status = 'paid';
      tx.paymentId = paymentId;
      tx.verifiedAt = tx.verifiedAt || new Date().toISOString();
      tx.updatedAt = new Date().toISOString();
      txData.orders[orderId] = tx;
    }
  }
  if (!tx || tx.status !== 'paid' || tx.paymentId !== paymentId || tx.productType !== 'course' || Number(tx.courseId) !== courseId) {
    return res.status(403).json({ error: 'Course access can be granted only after a verified matching payment.' });
  }
  if (tx.claimedBy && tx.claimedBy !== key) {
    return res.status(403).json({ error: 'This payment has already been linked to another account.' });
  }
  tx.claimedBy = key;
  tx.grantedAt = tx.grantedAt || new Date().toISOString();
  tx.updatedAt = new Date().toISOString();
  saveTransactions(txData);

  const all = loadEnrollments();
  const userEnrollments = all[key] || {};
  const now = new Date().toISOString();
  userEnrollments[String(courseId)] = {
    id: courseId,
    courseId,
    title: title || `Course ${courseId}`,
    progress: Math.max(0, Math.min(100, Number(req.body?.progress) || 0)),
    paid: true,
    status: 'active',
    paymentId,
    orderId,
    enrolledAt: userEnrollments[String(courseId)]?.enrolledAt || now,
    updatedAt: now
  };
  all[key] = userEnrollments;
  saveEnrollments(all);
  res.json({ ok: true, enrollments: userEnrollments });
});

app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: 'Temporary platform error. Please try again shortly.' });
  }
  return sendMaintenancePage(res, 503);
});

app.get('*', (req, res) => {
  sendAppShell(req, res);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
  });
} else {
  module.exports = app;
}


