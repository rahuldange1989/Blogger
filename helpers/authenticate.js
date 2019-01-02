module.exports = {
  userAuthenticated: function(req, res, next) {
    if (global.user) {
      next();
    } else {
      res.redirect("/login");
    }
  }
};
