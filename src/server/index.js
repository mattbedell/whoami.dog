const path = require("path");

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");

require("dotenv").config();
const cookieSession = require("cookie-session");

const { expires } = require("./utils/session.js");
const apiRouter = require("./routers/api.js");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(morgan("dev"));
app.use(helmet());

app.use(
  cookieSession({
    name: "session",
    secret: process.env.SESSION_SECRET,
    httpOnly: true,
    sameSite: "lax",
    expires,
  })
);

app.use(express.json());

app.get("/", (_, res) => {
  res.send(path.join(__dirname, "dist", "index.html"));
});

app.use("/public", express.static(path.join(__dirname, "..", "..", "public")));

app.use("/api", apiRouter);

app.listen(PORT, () => console.log(`Listening on: localhost:${PORT}`));
