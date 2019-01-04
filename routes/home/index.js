const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const faker = require("faker");
const Categories = require("../../models/Category");
const Users = require("../../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

var errorMessages = [];
var successMessages = [];

// -- Change the default layout to home before going to Home route
router.all("/*", (req, res, next) => {
  req.app.locals.layout = "home";

  if (req.originalUrl != "/login") {
    req.session.redirectTo = req.originalUrl;
  }

  next();
});

// -- Route for root '/'
router.get("/", (req, res) => {
  Post.find()
    .populate("user")
    .then(posts => {
      Categories.find()
        .then(categories => {
          res.render("home/index", { posts: posts, categories: categories });
        })
        .catch(err => {
          res.send(err);
        });
    })
    .catch(err => {
      res.send(err);
    });
});

// -- Route for login '/login'
router.get("/login", (req, res) => {
  if (errorMessages.length > 0) {
    res.render("home/login", { errors: errorMessages });
    errorMessages = [];
  } else if (successMessages.length > 0) {
    res.render("home/login", { success: successMessages });
    successMessages = [];
  } else {
    res.render("home/login");
  }
});

// -- Route for login post '/login'
passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    (email, password, done) => {
      Users.findOne({ email: email }).then(user => {
        if (!user) {
          errorMessages.push({ message: "User is not registered..." });
          return done(null, false, {});
          errorMessages = [];
        }

        user.verifyPassword(password, user.password, res => {
          if (res) {
            global.user = user;
            return done(null, user, {});
          } else {
            errorMessages.push({ message: "Incorrect password..." });
            return done(null, false, {});
            errorMessages = [];
          }
        });
      });
    }
  )
);

router.post("/login", (req, res, next) => {
  var redirectUrl = req.session.redirectTo;
  if (!redirectUrl || redirectUrl == "/register") {
    redirectUrl = "/admin";
  }

  passport.authenticate("local", {
    successRedirect: redirectUrl,
    failureRedirect: "/login",
    failureFlash: true
  })(req, res, next);
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Users.findById(id, (err, user) => {
    done(err, user);
  });
});

// -- Route for register '/register'
router.get("/register", (req, res) => {
  if (errorMessages.length > 0) {
    res.render("home/register", { errors: errorMessages });
    errorMessages = [];
  } else if (successMessages.length > 0) {
    res.render("home/register", { success: successMessages });
    successMessages = [];
  } else {
    res.render("home/register");
  }
});

// -- Route for Post register '/register'
router.post("/register", (req, res) => {
  if (req.body.password != req.body.confirmPassword) {
    errorMessages.push({ message: "Password don't match." });
    res.redirect("/register");
    return;
  }

  const newUser = Users({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  });

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      errorMessages.push({ messages: err.errmsg });
      res.redirect("/login");
    }

    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        errorMessages.push({ messages: err.errmsg });
        res.redirect("/login");
      }

      newUser.password = hash;
      newUser
        .save()
        .then(newUser => {
          successMessages.push({ message: "User created successfully..." });
          res.redirect("/login");
        })
        .catch(validators => {
          errorMessages.push({ message: validators.errmsg });
          res.redirect("/login");
        });
    });
  });
});

// -- Route for showing single post '/post/:id  '
router.get("/post/:id", (req, res) => {
  Post.findById({ _id: req.params.id })
    .populate("user")
    .then(post => {
      Categories.find()
        .then(categories => {
          res.render("home/post", {
            post: post,
            categories: categories,
            globalUser: global.user
          });
        })
        .catch(err => {
          res.send(err);
        });
    })
    .catch(err => {
      res.send(err);
    });
});

// -- Route for log out '/logout'
router.get("/logout", (req, res) => {
  req.logOut();
  global.user = null;
  res.redirect("/login");
});

module.exports = router;
