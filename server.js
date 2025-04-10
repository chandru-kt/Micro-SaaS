const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const useragent = require('express-useragent');
const cors = require('cors');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'micro-saas-secret';
const MONGO_URI = 'mongodb+srv://ktchandru1234:k.t.chandru1234@cluster0.afircsf.mongodb.net/sde';

app.use(bodyParser.json());
app.use(useragent.express());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
  
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error(err));

// ---------------- SCHEMAS ----------------
const LinkSchema = new mongoose.Schema({
  userId: String,
  originalUrl: String,
  shortCode: String,
  customAlias: String,
  createdAt: { type: Date, default: Date.now },
  expirationDate: Date,
  clicks: { type: Number, default: 0 }
});

const ClickSchema = new mongoose.Schema({
  linkId: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  ip: String,
  device: String,
  browser: String
});

const Link = mongoose.model('Link', LinkSchema);
const Click = mongoose.model('Click', ClickSchema);

// ---------------- MIDDLEWARE ----------------
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  jwt.verify(token.split(' ')[1], JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ---------------- AUTH ----------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'intern@dacoid.com' && password === 'Test123') {
    const token = jwt.sign({ email, userId: 'intern123' }, JWT_SECRET);
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// ---------------- SHORTEN URL ----------------
app.post('/api/links/create', authenticateToken, async (req, res) => {
  const { originalUrl, customAlias, expirationDate } = req.body;
  const shortCode = customAlias || shortid.generate();
  const shortLink = new Link({
    userId: req.user.userId,
    originalUrl,
    shortCode,
    customAlias,
    expirationDate
  });
  await shortLink.save();
  res.json({
    message: 'Short URL created',
    shortUrl: `http://localhost:${PORT}/${shortCode}`
  });
});

// ---------------- REDIRECT ----------------
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  const link = await Link.findOne({ shortCode });
  if (!link) return res.status(404).send('Link not found');

  if (link.expirationDate && new Date() > link.expirationDate) {
    return res.status(410).send('Link has expired');
  }

  link.clicks += 1;
  await link.save();

  // Async logging
  const click = new Click({
    linkId: link._id,
    timestamp: new Date(),
    ip: req.ip,
    device: req.useragent.platform,
    browser: req.useragent.browser
  });
  click.save(); // No await for async

  res.redirect(link.originalUrl);
});

// ---------------- DASHBOARD ----------------
app.get('/api/links/dashboard', authenticateToken, async (req, res) => {
  const links = await Link.find({ userId: req.user.userId });

  const response = await Promise.all(links.map(async (link) => {
    const clicks = await Click.find({ linkId: link._id });
    const deviceCount = {};
    const dateCount = {};

    clicks.forEach(c => {
      deviceCount[c.device] = (deviceCount[c.device] || 0) + 1;
      const date = moment(c.timestamp).format('YYYY-MM-DD');
      dateCount[date] = (dateCount[date] || 0) + 1;
    });

    return {
      originalUrl: link.originalUrl,
      shortUrl: `http://localhost:${PORT}/${link.shortCode}`,
      createdAt: link.createdAt,
      expirationDate: link.expirationDate,
      clicks: link.clicks,
      expired: link.expirationDate ? new Date() > link.expirationDate : false,
      clicksOverTime: dateCount,
      deviceBreakdown: deviceCount
    };
  }));

  res.json(response);
});

// ---------------- START ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
