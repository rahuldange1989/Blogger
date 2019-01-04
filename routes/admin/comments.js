const express = require("express");
const router = express.Router();
const Comments = require("../../models/Comment");
const Posts = require("../../models/Post");

var successMessages = [];
var errorMessages = [];

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

// -- For listing comments
router.get("/", (req, res) => {
  Comments.find({ user: global.user.id })
    .populate("user")
    .then(comments => {
      if (successMessages.length > 0) {
        res.render("admin/comments", {
          comments: comments,
          success: successMessages,
          globalUser: global.user
        });
        successMessages = [];
      } else if (errorMessages.length > 0) {
        res.render("admin/comments", {
          comments: comments,
          errors: errorMessages,
          globalUser: global.user
        });
        errorMessages = [];
      } else {
        res.render("admin/comments", {
          comments: comments,
          globalUser: global.user
        });
      }
    });
});

// -- For posting new comment
router.post("/", (req, res) => {
  Posts.findById({ _id: req.body.postId })
    .then(post => {
      const newComment = new Comments({
        user: global.user._id,
        body: req.body.body
      });

      post.comments.push(newComment);
      post
        .save()
        .then(savedPost => {
          newComment
            .save()
            .then(savedComment => {
              res.redirect(`/post/${post._id}`);
            })
            .catch(error => {
              res.send(error);
            });
        })
        .catch(error => {
          res.send(error);
        });
    })
    .catch(error => {
      res.send(error);
    });
});

// -- for deleting comment
router.get("/delete/:id", (req, res) => {
  Comments.findOneAndDelete({ _id: req.params.id })
    .then(deletedItem => {
      Posts.findOneAndUpdate(
        { comments: req.params.id },
        { $pull: { comments: req.params.id } },
        (err, result) => {
          if (err) {
            errorMessages.push({ message: err });
            res.redirect("/admin/comments");
            return;
          }

          successMessages.push({ message: "Comment deleted successfully !!!" });
          res.redirect("/admin/comments");
        }
      );
    })
    .catch(err => {
      errorMessages.push({ message: err });
      res.redirect("/admin/comments");
    });
});

module.exports = router;
