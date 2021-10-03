const path = require("path");

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");

require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

const { promiseClient: redisClient } = require("./util/redisClient.js");

const PORT = process.env.PORT || 3001;

const app = express();
const api = express.Router();

const dbClient = new MongoClient(process.env.MONGO_URL);

dbClient.connect();
const db = dbClient.db(process.env.MONGO_DB);

app.use(morgan("dev"));
app.use(helmet());

// expire the session cookie in a year, this would typically be much shorter but this an app about a dog so convenience is appropriate
const sessionExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
app.use(
  cookieSession({
    name: "session",
    secret: process.env.SESSION_SECRET,
    httpOnly: true,
    sameSite: "lax",
    expires: sessionExpiryDate,
  })
);

const authSessionMiddleware = (req, res, next) => {
  if (req.session.username) {
    return next();
  }

  return res.status(403).send();
};

const validateGuessMiddleware = (req, res, next) => {
  const { guess } = req.body;

  if (guess.reduce((all, { percentage }) => all + percentage, 0) <= 100) {
    next();
  } else {
    res.status(400).send("only one whole dog allowed per guess");
  }
};

const hydrateGuesses = async (username, guessIds) => {
  // there's a better way to do this but mongodb is confusing with embedded data so do it the dumb way
  // TODO: use a more elegant native mongodb query to reduce hits to the database, this is quick and dirty for now

  const guessMap = guessIds.reduce((map, guessId, i) => {
    if (!map.has(guessId)) {
      map.set(guessId, i);
    }
    return map;
  }, new Map());

  const { guesses } = await db.collection("users").findOne({ username });

  const all = [];

  // return them in the right order probably
  await Promise.all(
    guesses.map(async (guess) => {
      const guessId = guess._id.toString();
      if (guessMap.has(guessId)) {
        const entries = await Promise.all(
          guess.entries.map(async ({ breedId, percentage }) => {
            const breedCacheKey = `breed:${breedId}`;
            const keyExists = await redisClient.exists(breedCacheKey);
            if (keyExists) {
              const breedStr = await redisClient.get(breedCacheKey);
              const breed = JSON.parse(breedStr);
              return { ...breed, percentage };
            }

            const breed = await db
              .collection("breeds")
              .findOne({ _id: breedId });

            await redisClient.set(breedCacheKey, JSON.stringify(breed));
            return { ...breed, percentage };
          })
        );
        // eslint-disable-next-line
        all[guessMap.get(guessId)] = { ...guess, entries };
      }
    })
  );

  return all.filter(Boolean);
};

app.use(express.json());

app.get("/", (_, res) => {
  res.send(path.join(__dirname, "dist", "index.html"));
});

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(
  "/data",
  authSessionMiddleware,
  express.static(path.join(__dirname, "..", "data"))
);

// TODO: do some CSRF protection on these routes
api.post("/auth", async (req, res) => {
  const user = await db.collection("users").findOne({
    $or: [{ username: req.body.username }, { email: req.body.username }],
  });

  if (user) {
    const creds = await db
      .collection("user_creds")
      .findOne({ userId: user._id });
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      creds.password
    );

    if (passwordMatch) {
      req.session.username = user.username;
      return res.status(200).send({ username: user.username });
    }
  }

  return res.status(404).json({ error: "Incorrect username or password" });
});

// TODO: do some CSRF protection on these routes
api.post(
  "/guess",
  authSessionMiddleware,
  validateGuessMiddleware,
  (req, res) => {
    const { guess } = req.body;

    const guessId = ObjectId();
    // TODO: validate breedIds sent from the client
    db.collection("users")
      .updateOne(
        {
          username: req.session.username,
        },
        {
          $push: {
            guesses: {
              entries: guess.map(({ breedId, percentage }) => ({
                breedId,
                percentage,
              })),
              _id: guessId,
            },
          },
        }
      )
      .then(async () => {
        const [newguess] = await hydrateGuesses(req.session.username, [
          guessId.toString(),
        ]);
        res.json(newguess);
      });
  }
);

// TODO: do some CSRF protection on these routes
api.put(
  "/guess/:id",
  authSessionMiddleware,
  validateGuessMiddleware,
  async (req, res) => {
    const { guess } = req.body;
    try {
      await db.collection("users").updateOne(
        {
          username: req.session.username,
          "guesses._id": ObjectId(req.params.id),
        },
        {
          $set: { "guesses.$.entries": guess },
        }
      );
      const [updatedGuess] = await hydrateGuesses(req.session.username, [
        req.params.id,
      ]);
      res.json(updatedGuess);
    } catch {
      res.sendStatus(400);
    }
  }
);

// TODO: do some CSRF protection on these routes
api.delete("/guess/:id", authSessionMiddleware, async (req, res) => {
  try {
    const { modifiedCount } = await db.collection("users").updateOne(
      {
        username: req.session.username,
      },
      {
        $pull: {
          guesses: {
            _id: ObjectId(req.params.id),
          },
        },
      }
    );

    if (modifiedCount === 1) {
      res.status(200);
    } else {
      res.status(400);
    }
  } catch {
    res.status(400);
  } finally {
    res.send();
  }
});

api.get("/u/:username", async (req, res) => {
  // this is probably unsafe in the real world
  const user = await db
    .collection("users")
    .findOne({ username: req.params.username });
  if (user) {
    const { username, guesses } = user;
    const hydratedGuesses = await hydrateGuesses(
      username,
      guesses.map(({ _id }) => _id.toString())
    );
    return res.status(200).json({ username, guesses: hydratedGuesses });
  }
  return res.status(404).send();
});

// TODO: do some CSRF protection on these routes
app.use("/api", api);

app.listen(PORT, () => console.log(`Listening on: localhost:${PORT}`));

process.on("SIGINT", () => {
  console.log("closing DB connection...");
  dbClient.close().then(() => process.exit(0));
});
