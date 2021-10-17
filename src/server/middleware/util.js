const validateGuessPercentage = (req, res, next) => {
  const { guess } = req.body;

  if (
    guess.entries.reduce((all, { percentage }) => all + percentage, 0) <= 100
  ) {
    next();
  } else {
    res.status(400).send("only one whole dog allowed per guess");
  }
};

module.exports = { validateGuessPercentage };
