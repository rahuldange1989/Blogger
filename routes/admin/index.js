const express = require("express");
const router = express.Router();
const Posts = require("../../models/Post");
const faker = require("faker");
const Categories = require("../../models/Category");
const { userAuthenticated } = require("../../helpers/authenticate");

// -- Change the default layout to admin before going to Admin route
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

// -- Route for root '/'
router.get("/", (req, res) => {
  res.render("admin/index", { user: global.user });
});

// -- Route for root '/dashboard'
router.get("/dashboard", (req, res) => {
  res.render("admin/index");
});

// -- Route to create Fake data
router.post("/dashboard", (req, res) => {
  const statusArray = ["Public", "Private", "Draft"];

  Categories.find()
    .then(categories => {
      for (var i = 0; i < req.body.number; i++) {
        let index = Math.floor(Math.random() * 3);
        let categpryIndex = Math.floor(Math.random() * categories.length);

        const newPost = Posts({
          title: faker.name.title(),
          status: statusArray[index],
          body: faker.lorem.paragraphs(),
          allowComments: faker.random.boolean(),
          file: faker.image.image(),
          date: faker.date.past(),
          category: categories[categpryIndex].id
        });

        newPost.save().catch(error => {
          console.log(error);
        });
      }

      res.redirect("/admin/posts");
    })
    .catch(error => {
      console.log(error);
    });
});

module.exports = router;
