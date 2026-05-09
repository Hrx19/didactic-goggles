const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const Razorpay = require('razorpay');

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'contacts.json');
const aiKey = process.env.ANTHROPIC_API_KEY || 'your-anthropic-api-key';

const razorpay = new Razorpay({
  key_id: 'rzp_test_your_test_key_id', // Replace with your test key_id
  key_secret: 'your_test_key_secret' // Replace with your test key_secret
});

app.use(express.json());
app.use(express.static(__dirname));

// Session
app.use(session({
  secret: 'uft-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Here, check if user exists, else create
  // For simplicity, just return profile
  done(null, profile);
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
  clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name']
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/api/ai', async (req, res) => {
  const { system, messages } = req.body;
  if (!aiKey || aiKey === 'your-anthropic-api-key') {
    return res.status(500).json({ error: 'AI API key is not configured on the server.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': aiKey
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages
      })
    });
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('AI proxy error:', err);
    res.status(500).json({ error: 'AI service unavailable.' });
  }
});

app.post('/api/contact', (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required.' });
  }

  const entry = {
    id: Date.now(),
    firstName: firstName || '',
    lastName: lastName || '',
    email,
    subject: subject || 'General',
    message,
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

app.post('/api/feedback', (req, res) => {
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
    course,
    rating: rating || 5,
    review,
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

app.post('/api/create-order', async (req, res) => {
  const { amount, currency = 'INR' } = req.body;
  console.log('Creating order for amount:', amount, 'currency:', currency);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const options = {
      amount: amount * 100, // amount in paisa
      currency,
      receipt: `receipt_${Date.now()}`
    };
    console.log('Razorpay options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Order created:', order);
    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: 'Unable to create order' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'uttarakhand-future-technology (2).html'));
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
