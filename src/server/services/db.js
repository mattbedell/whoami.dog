require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const mongoClient = new MongoClient(process.env.MONGO_URL);

mongoClient.connect();
const mongoDb = mongoClient.db(process.env.MONGO_DB);

process.on("SIGINT", () => {
  console.log("closing DB connection...");
  mongoClient.close().then(() => process.exit(0));
});

module.exports = { mongoDb }
