const path = require("path");

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");

require("dotenv").config();
const cookieSession = require("cookie-session");

const apiRouter = require("./routers/api.js");

const PORT = process.env.PORT || 3001;

const app = express();

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

app.use(express.json());

app.get("/", (_, res) => {
  res.send(path.join(__dirname, "dist", "index.html"));
});

app.use("/public", express.static(path.join(__dirname, "..", "..", "public")));

app.use("/api", apiRouter);

app.listen(PORT, () => console.log(`Listening on: localhost:${PORT}`));
