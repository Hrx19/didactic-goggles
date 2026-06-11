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
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
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
      "form-action 'self'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://accounts.google.com https://cdn.jsdelivr.net",
      "connect-src 'self' https://checkout.razorpay.com https://accounts.google.com https://fonts.googleapis.com https://fonts.gstatic.com",
      "frame-src https://checkout.razorpay.com https://accounts.google.com https://www.youtube.com https://youtube.com"
    ].join('; ')
  );
  next();
});

const baseUrl = (process.env.BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${port}`)).replace(/\/$/, '');
const dataFile = path.join(__dirname, 'contacts.json');
const usersFile = path.join(__dirname, 'users.json');
const appShellFile = path.join(__dirname, 'app-shell.html');
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
    req.login(user, callback);
  });
}

function sendMaintenancePage(res, statusCode = 503) {
  res.status(statusCode).type('html').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>HUMAIX ECHO REALM | Temporarily Unavailable</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#030014;color:#e2e8f0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif}
main{width:min(560px,92vw);padding:32px;border:1px solid rgba(148,163,184,.22);border-radius:22px;background:rgba(15,23,42,.72);box-shadow:0 24px 90px rgba(0,0,0,.4)}
h1{margin:0 0 10px;font-size:clamp(28px,5vw,44px);line-height:1;background:linear-gradient(90deg,#38bdf8,#a78bfa,#ff7ab8);-webkit-background-clip:text;background-clip:text;color:transparent}
p{color:#cbd5e1;line-height:1.7}
a{display:inline-flex;margin-top:14px;color:#38bdf8;font-weight:800;text-decoration:none}
</style>
</head>
<body><main><h1>HUMAIX ECHO REALM</h1><p>The platform shell is temporarily unavailable. Please refresh in a moment. The health endpoint is active, so the service can recover cleanly after deployment updates.</p><a href="/">Try again</a></main></body>
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
  console.warn('Razorpay keys are not configured or invalid. Payment endpoints will be disabled.');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
    displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Student',
    email: user.email || user.emails?.[0]?.value || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    avatar: user.avatar || user.photos?.[0]?.value || '',
    provider: user.provider || 'local',
    isAdmin: isAdminUser(user)
  };
}

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(publicUser(req.user));
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    razorpayKeyId: razorpayKeyId || '',
    paymentEnabled: Boolean(razorpay && razorpayKeyId),
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
    '/academy',
    '/courses',
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
  if (!req.isAuthenticated()) {
    return res.redirect('/#login');
  }
  return res.redirect('/workspace');
});

app.get('/admin', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/#login');
  }
  if (!isAdminUser(req.user)) {
    return res.status(403).send('Admin access restricted.');
  }
  return res.redirect('/#admin');
});

app.post('/api/signup', rateLimiters.auth, (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
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
    res.json({ user: publicUser(user) });
  });
});

app.post('/api/login', rateLimiters.auth, (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const users = loadUsers();
  const user = users.find(u => normalizeEmail(u.email) === normalizedEmail);
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
    res.json({ user: publicUser(user) });
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
      res.json({ user: publicUser(user) });
    });
  } catch (err) {
    console.error('Google token auth error:', err);
    res.status(500).json({ error: 'Google sign-in is temporarily unavailable.' });
  }
});

app.post('/api/logout', (req, res) => {
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
          system: system || 'You are a helpful assistant.',
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
          instructions: system || 'You are a helpful assistant.',
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
  { title: 'AI Productivity Sprint', price: 299, original: 1499, hours: '3.5', category: 'Technology', bestFor: 'focus, workflow, prompt routines, student productivity' },
  { title: 'Data Science with AI', price: 399, original: 1999, hours: '5', category: 'Data Science', bestFor: 'analytics, charts, portfolio project, AI-assisted insights' },
  { title: 'Cyber Security Foundations', price: 499, original: 2499, hours: '6', category: 'Cyber Security', bestFor: 'online safety, secure habits, beginner security awareness' },
  { title: 'Creator Growth System', price: 249, original: 1299, hours: '4', category: 'Digital Marketing', bestFor: 'content planning, audience growth, creator income systems' },
  { title: 'Python Foundations', price: 249, original: 999, hours: '5.5', category: 'Programming', bestFor: 'coding basics, logic, first scripts, automation' },
  { title: 'English for Builders', price: 129, original: 699, hours: '4.5', category: 'Languages', bestFor: 'speaking confidence, interviews, clients, community' },
  { title: 'Generative AI Builder Track', price: 799, original: 3499, hours: '8', category: 'Generative AI', bestFor: 'prompt systems, AI workflows, mini-products, automation' },
  { title: 'Full-Stack Web Development', price: 999, original: 4499, hours: '10', category: 'Full-Stack', bestFor: 'frontend, backend, databases, auth, deployment' },
  { title: 'Blockchain and Web3 Foundations', price: 699, original: 2999, hours: '7', category: 'Web3', bestFor: 'wallet safety, tokens, smart contracts, web3 basics' },
  { title: 'Ethical Hacking Practice Lab', price: 899, original: 3999, hours: '9', category: 'Cyber Security', bestFor: 'defensive labs, responsible disclosure, audit notes' },
  { title: 'Product Management for Builders', price: 599, original: 2499, hours: '6', category: 'Product', bestFor: 'MVP planning, product specs, validation, launch feedback' },
  { title: 'Entrepreneurship Launch Lab', price: 799, original: 3499, hours: '8', category: 'Entrepreneurship', bestFor: 'offer design, funnels, lead capture, first revenue roadmap' }
];

function buildCourseList() {
  return courseCatalog
    .map((course) => `${course.title} - INR ${course.price}, ${course.hours} hrs, ${course.category}, Hindi + English`)
    .join('\n');
}

function buildSiteSummary() {
  return [
    'HUMAIX ECHO REALM is a premium AI + tech learning website.',
    'Founder/instructor shown on the site: Harish Singh.',
    'Primary contact: Hzzzx06@gmail.com.',
    'Main pages: Home, Courses, About, Blog, Contact, Login, Sign Up, Dashboard, Admin.',
    'Key features: premium hero design, Hindi + English courses, course thumbnails, AI assistant, Razorpay checkout, contact form, feedback form, and downloadable-style learning experience.',
    'Course benefits: lifetime access, certificate of completion, mobile/tablet access, downloadable resources, WhatsApp support group, and 30-day money-back guarantee.'
  ].join('\n');
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
  const wantsHindi = /hindi|hinglish/.test(text);
  const course = findCourseByText(text);
  const prefix = wantsHindi ? 'Bilkul. ' : '';

  if (!raw) {
    return 'Ask me about any HUMAIX ECHO REALM course, fees, payment, roadmap, language, certificate, or support.';
  }

  if (/(site|website|about|home|home page|features|pages|founder|harish|who made|what is this|full details|details)/.test(text)) {
    return prefix + buildSiteSummary() + "\n\nCourse catalog:\n" + buildCourseList();
  }

  if (/(all|list|courses|course|fees|price|pricing)/.test(text) && !course) {
    return prefix + "HUMAIX ECHO REALM courses are available in Hindi + English:\n" + buildCourseList() + "\n\nBest beginner path: AI Productivity Sprint -> Python Foundations -> Data Science with AI. For security, choose Cyber Security Foundations first.";
  }

  if (course) {
    return prefix + course.title + " is a " + course.hours + "-hour " + course.category + " course in Hindi + English. Fee: INR " + course.price + " (original INR " + course.original + "). It is best for " + course.bestFor + ". Open the course card, preview the Studio, then tap Pay Securely for Razorpay checkout.";
  }

  if (/(payment|pay|upi|razorpay|checkout)/.test(text)) {
    return 'Payment is handled through Razorpay Secure Checkout. Open any course, tap Pay Securely, complete checkout using UPI, card, net banking, or wallet, and keep the payment ID for confirmation.';
  }

  if (/(certificate|certificat)/.test(text)) {
    return 'Every listed course includes lifetime access and a certificate of completion after finishing the lessons and exercises.';
  }

  if (/(language|english|hindi|medium)/.test(text)) {
    return 'Courses are planned in Hindi + English, so beginners can understand concepts in Hindi/Hinglish while learning English technical terms.';
  }

  if (/(contact|support|help|email|whatsapp)/.test(text)) {
    return 'For support, use the Contact page or email Hzzzx06@gmail.com. You can also follow the WhatsApp channel linked on the site.';
  }

  if (/(career|job|earn|earning|income)/.test(text)) {
    return 'For earning-focused learning, start with AI Productivity Sprint, then choose Data Science with AI, Full-Stack Web Development, Creator Growth System, or Entrepreneurship Launch Lab depending on your goal.';
  }

  return prefix + "Here is the practical HUMAIX ECHO REALM answer: tell me your current level and goal. For a fast first result, start with AI Productivity Sprint. For coding, choose Python Foundations or Full-Stack Web Development. For analytics, choose Data Science with AI. For security, choose Cyber Security Foundations. All courses are Hindi + English and include certificate access.";
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
  const { course, rating, review } = req.body;
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
    rating: rating || 5,
    review: cleanText(review, 4000),
    submittedAt: new Date().toISOString()
  });

  try {
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));
  } catch (err) {
    console.error('Error writing feedback file:', err);
    return res.status(500).json({ error: 'Unable to save feedback.' });
  }

  console.log('New feedback received:', { course, rating, review });
  res.status(201).json({ status: 'ok', message: 'Feedback received.' });
});

app.post('/api/create-order', rateLimiters.payment, async (req, res) => {
  if (!razorpay) {
    return res.status(500).json({ error: 'Payment gateway is not configured on the server.' });
  }

  const amount = Number(req.body.amount);
  const currency = req.body.currency || 'INR';
  console.log('Creating order for amount:', amount, 'currency:', currency);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`
    };
    console.log('Razorpay options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Order created:', order);
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

app.post('/api/verify-payment', rateLimiters.payment, (req, res) => {
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

  res.json({ ok: true, paymentId, orderId });
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
