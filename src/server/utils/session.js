module.exports = {
  // expire the session cookie in a year, this would typically be much shorter but this an app about a dog so convenience is appropriate
  expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
};
