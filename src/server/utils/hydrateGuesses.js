const { promiseClient: redisClient } = require("../services/redis.js");
const { mongoDb: db } = require('../services/db.js');

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
              return { ...breed, percentage, breedId };
            }

            const breed = await db
              .collection("breeds")
              .findOne({ _id: breedId });

            await redisClient.set(breedCacheKey, JSON.stringify(breed));
            return { ...breed, percentage, breedId };
          })
        );
        // eslint-disable-next-line
        all[guessMap.get(guessId)] = { ...guess, entries };
      }
    })
  );

  return all.filter(Boolean);
};

module.exports = hydrateGuesses;
