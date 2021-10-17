const express = require("express");

const users = require("./users.js");
const breeds = require("./breeds.js");

const router = express.Router();

router.use("/users", users);
router.use("/breeds", breeds);

module.exports = router;
