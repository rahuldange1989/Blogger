const express = require("express");
const bodyPasrser = require("body-parser");
const router = express.Router();
const Posts = require("../../models/Post");
const { isEmpty, uploadsDirectory } = require("../../helpers/uploadHelper");
const fs = require("fs");
const Categories = require("../../models/Category");
const { userAuthenticated } = require("../../helpers/authenticate");

// -- variable to hold error/success messages
var successMessages = [];
var errorMessages = [];

// -- Change the default layout to admin before going to Admin route
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

// -- Route for root '/admin/posts'
router.get("/", (req, res) => {
  Posts.find()
    .populate("category")
    .then(posts => {
      if (successMessages.length > 0) {
        res.render("admin/posts", { posts: posts, success: successMessages });
        successMessages = {};
      } else if (errorMessages.length > 0) {
        res.render("admin/posts", { posts: posts, errors: errorMessages });
        errorMessages = {};
      } else {
        res.render("admin/posts", { posts: posts });
      }
    })
    .catch(err => {
      res.send(err);
    });
});

// -- Route for rendering '/admin/posts/create'
router.get("/create", (req, res) => {
  Categories.find()
    .then(categories => {
      res.render("admin/posts/create", {
        categories: categories
      });
    })
    .catch(err => {
      res.send(err);
    });
});

// -- Route for Create Post '/admin/posts/create'
router.post("/create", (req, res) => {
  let fileName = "default.jpeg";

  if (!isEmpty(req.files)) {
    let file = req.files.postPic;
    fileName = Date.now() + "-" + file.name;

    file.mv(uploadsDirectory + fileName, err => {
      if (err) {
        res.render("admin/posts/create", { errors: err.errors });
        return;
      }
    });
  } else {
    res.render("admin/posts/create", {
      errors: [{ message: "File not attached..." }]
    });
    return;
  }

  var allowComments = false;

  if (req.body.allowComments) {
    allowComments = true;
  }

  const newPost = Posts({
    title: req.body.title,
    status: req.body.status,
    allowComments: allowComments,
    body: req.body.body,
    file: fileName,
    category: req.body.category
  });

  newPost
    .save()
    .then(savedPost => {
      successMessages = [{ message: "Post created successfully!!!" }];
      res.redirect("/admin/posts");
    })
    .catch(error => {
      res.render("admin/posts/create", {
        errors: error.errors
      });
    });
});

// -- Route for Edit post '/admin/posts/edit'
router.post("/edit/:id", (req, res) => {
  var allowComments = false;

  if (req.body.allowComments) {
    allowComments = true;
  }

  Posts.findOne({ _id: req.params.id })
    .then(postToUpdate => {
      if (!isEmpty(req.files)) {
        let file = req.files.postPic;
        let fileName = Date.now() + "-" + file.name;

        file.mv(uploadsDirectory + fileName, err => {
          if (err) {
            res.render("admin/posts/create", { errors: err.errors });
            return;
          }
        });

        // -- delete old post pic
        try {
          fs.unlinkSync(dirUploads + postToUpdate.file);
        } catch (error) {
          console.log(`>>>> ${error}`);
        }

        // -- add new file to db records
        postToUpdate.file = fileName;
      }

      // -- Update other parameters
      postToUpdate.title = req.body.title;
      postToUpdate.status = req.body.status;
      postToUpdate.allowComments = allowComments;
      postToUpdate.body = req.body.body;
      postToUpdate.category = req.body.category;

      postToUpdate.save().then(savedPost => {
        successMessages = [{ message: "Post updated succefully !!!" }];
        res.redirect("/admin/posts");
      });
    })
    .catch(validator => {
      errorMessages = validator.errors;
      res.redirect("/admin/posts");
    });
});

// -- Route for get Edit post '/admin/posts/edit'
router.get("/edit/:id", (req, res) => {
  Posts.findOne({ _id: req.params.id })
    .then(post => {
      Categories.find()
        .then(categories => {
          res.render("admin/posts/edit", {
            post: post,
            categories: categories
          });
        })
        .catch(err => {
          res.send(err);
        });
    })
    .catch(error => {
      res.send(error);
    });
});

// -- Route for Delete  post '/admin/posts/delete'
router.get("/delete/:id", (req, res) => {
  Posts.findOneAndDelete({ _id: req.params.id })
    .populate("comments")
    .catch(validator => {
      errorMessages = validator.errors;
      res.redirect("/admin/posts");
    })
    .then(result => {
      // -- delete old post pic
      if (
        !result.file.toString().startsWith("http") &&
        !result.file.toString().startsWith("https")
      ) {
        try {
          fs.unlinkSync(uploadsDirectory + result.file);
        } catch (error) {
          console.log(`>>>> ${error}`);
        }
      }

      if (result.comments.length > 0) {
        result.comments.forEach(comment => {
          comment.remove();
        });
      }

      successMessages = [{ message: "Post deleted successfully!!!" }];
      res.redirect("/admin/posts");
    });
});

module.exports = router;
