const path = require('path');

const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 3001;

const authenticateJwt = (authHeader) =>
  new Promise((resolve, reject) => {
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      reject(new Error('no token'));
    } else {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          reject(err);
        }

        resolve(user);
      });
    }
  });

const jwtAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  return authenticateJwt(authHeader)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(() => {
      res.status(403).send();
    });
};

const app = express();

const dbClient = new MongoClient(process.env.MONGO_URL);

dbClient.connect();
const db = dbClient.db(process.env.MONGO_DB);

app.use(express.json());

app.get('/', (_, res) => {
  res.send(path.join(__dirname, 'dist', 'index.html'));
});

app.post('/login', async (req, res) => {
  const user = await db.collection('users').findOne({
    $or: [{ username: req.body.username }, { email: req.body.username }],
  });

  if (user) {
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password,
    );

    if (passwordMatch) {
      const newJwt = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
      );
      return res.status(200).json(newJwt);
    }
  }

  return res.status(404).send('Incorrect username or password');
});

app.put('/guess', jwtAuthMiddleware, (req, res) => {
  const { guess } = req.body;

  const total = guess.reduce((all, { percentage }) => all + percentage, 0);

  if (total > 100) {
    res.status(400).send('only one whole dog allowed');
  }

  db.collection('users').updateOne({ username: req.user.username }, { $set: { guess } }).then(({ guess: updatedGuess }) => {
    res.status(200).json(updatedGuess);
  });
});

app.listen(PORT, () => console.log(`Listening on: localhost:${PORT}`));

process.on('SIGINT', () => {
  console.log('closing DB connection...');
  dbClient.close().then(() => process.exit(0));
});
