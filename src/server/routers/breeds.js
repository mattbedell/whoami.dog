const { pipeline } = require("stream/promises");

const express = require("express");

const { mongoDb: db } = require("../services/db.js");
const authMiddleware = require("../middleware/auth.js");

const router = express.Router();

router.get("/", authMiddleware.session, async (req, res) => {
  await pipeline(
    db.collection("breeds").find().project({ title: 1 }).stream(),
    async function* transform(read) {
      let first = true;
      yield "[";
      // eslint-disable-next-line no-restricted-syntax
      for await (const doc of read) {
        if (first) {
          first = false;
        } else {
          yield ",";
        }
        yield JSON.stringify(doc);
      }

      yield "]";
    },
    res.type("json")
  );
});

router.get("/:breedId", authMiddleware.session, async (req, res) => {
  const breed = await db.collection("breeds").findOne({ _id: parseInt(req.params.breedId, 10) });
  if (breed) {
    return res.json(breed);
  }
  return res.sendStatus(404);
});

module.exports = router;
