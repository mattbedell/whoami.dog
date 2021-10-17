const session = (req, res, next) => {
  if (req.session.username) {
    return next();
  }
  return res.redirect(403, "/login");
};

const userWritable = (req, res, next, username) => {
  if (req.session.username === username) {
    return next();
  }
  return res.redirect(403, "/login");
};

module.exports = {
  session,
  userWritable,
};
