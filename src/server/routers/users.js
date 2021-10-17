const express = require("express");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const { mongoDb: db } = require("../services/db.js");
const authMiddleware = require("../middleware/auth.js");
const { validateGuessPercentage } = require("../middleware/util.js");
const hydrateGuesses = require("../utils/hydrateGuesses.js");

const router = express.Router();

router.get("/:username", async (req, res) => {
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

router.post("/auth", async (req, res) => {
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

router.use(authMiddleware.session);

// username param isn't necessary in these routes, but it looks nicer. The username is obtained from the signed session cookie. This auth function is also not really necessary either
router.param("username", authMiddleware.userWritable);

// TODO: routes need CSRF protection

router.post("/:username/guesses", validateGuessPercentage, async (req, res) => {
  const { guess } = req.body;

  const guessId = ObjectId();
  // TODO: validate breedIds sent from the client
  await db.collection("users").updateOne(
    {
      username: req.session.username,
    },
    {
      $push: {
        guesses: {
          entries: guess.entries.map(({ breedId, percentage }) => ({
            breedId,
            percentage,
          })),
          _id: guessId,
        },
      },
    }
  );

  res.json(guessId.toString());
});

router.put(
  "/:username/guesses/:guessId",
  validateGuessPercentage,
  async (req, res) => {
    const { guess } = req.body;
    try {
      await db.collection("users").updateOne(
        {
          username: req.session.username,
          "guesses._id": ObjectId(req.params.guessId),
        },
        {
          $set: {
            "guesses.$.entries": guess.entries.map(
              ({ breedId, percentage }) => ({ breedId, percentage })
            ),
          },
        }
      );
      const [updatedGuess] = await hydrateGuesses(req.session.username, [
        req.params.guessId,
      ]);
      res.json(updatedGuess);
    } catch (e) {
      console.log(e);
      res.sendStatus(400);
    }
  }
);

router.delete("/:username/guesses/:guessId", async (req, res) => {
  try {
    const { modifiedCount } = await db.collection("users").updateOne(
      {
        username: req.session.username,
      },
      {
        $pull: {
          guesses: {
            _id: ObjectId(req.params.guessId),
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

module.exports = router;
