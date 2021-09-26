const path = require('path');

const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 3001;

const app = express();

const dbClient = new MongoClient(process.env.MONGO_URL);

dbClient.connect();
const db = dbClient.db(process.env.MONGO_DB);

const sessionExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET,
  httpOnly: true,
  sameSite: 'lax',
  expires: sessionExpiryDate,
}));

const authSessionMiddleware = (req, res, next) => {
  if (req.session.username) {
    return next();
  }

  return res.status(403).send();
};

app.use(express.json());

app.get('/', (_, res) => {
  res.send(path.join(__dirname, 'dist', 'index.html'));
});

app.post('/auth', async (req, res) => {
  const user = await db.collection('users').findOne({
    $or: [{ username: req.body.username }, { email: req.body.username }],
  });

  if (user) {
    // dangerous to store the password on the 'user' entity but the stakes are low for this app
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password,
    );

    if (passwordMatch) {
      req.session.username = user.username;
      return res.status(200).send();
    }
  }

  return res.status(404).send('Incorrect username or password');
});

app.put('/guess', authSessionMiddleware, (req, res) => {
  const { guess } = req.body;

  const total = guess.reduce((all, { percentage }) => all + percentage, 0);

  if (total <= 100) {
    db.collection('users').updateOne({ username: req.session.username }, { $set: { guess } }).then(({ guess: updatedGuess }) => {
      res.status(200).json(updatedGuess);
    });
  } else {
    res.status(400).send('only one whole dog allowed');
  }
});

app.listen(PORT, () => console.log(`Listening on: localhost:${PORT}`));

process.on('SIGINT', () => {
  console.log('closing DB connection...');
  dbClient.close().then(() => process.exit(0));
});
