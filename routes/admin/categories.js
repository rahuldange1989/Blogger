const express = require("express");
const router = express.Router();
const Categories = require("../../models/Category");
const { userAuthenticated } = require("../../helpers/authenticate");

var successMessages = [];
var errorMessages = [];
var editCategory = null;

// -- Change the default layout to admin before going to Admin route
router.all("/*", userAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

// -- Route for root '/admin/categories'
router.get("/", (req, res) => {
  Categories.find()
    .then(categories => {
      if (successMessages.length > 0) {
        res.render("admin/categories/", {
          categories: categories,
          success: successMessages,
          globalUser: global.user
        });
        successMessages = [];
      } else if (errorMessages.length > 0) {
        res.render("admin/categories/", {
          categories: categories,
          errors: errorMessages,
          globalUser: global.user
        });
        errorMessages = [];
      } else if (editCategory != null) {
        res.render("admin/categories/", {
          categories: categories,
          category: editCategory,
          globalUser: global.user
        });
        editCategory = null;
      } else {
        res.render("admin/categories/", {
          categories: categories,
          globalUser: global.user
        });
      }
    })
    .catch(validator => {
      errorMessages.push({ message: validator.errors });
      res.redirect("/admin/categories");
    });
});

// -- Route for create '/admin/categories/create'
router.post("/create", (req, res) => {
  const newCategory = Categories({
    name: req.body.name
  });

  newCategory
    .save()
    .then(savedCategory => {
      successMessages.push({ message: "Category created successfully !!!" });
      res.redirect("/admin/categories");
    })
    .catch(validator => {
      errorMessages.push({ message: validator.errors });
      res.redirect("/admin/categories");
    });
});

// -- Route for get Edit '/admin/categories/edit/:id'
router.get("/edit/:id", (req, res) => {
  Categories.findById({ _id: req.params.id })
    .then(category => {
      editCategory = category;
      res.redirect("/admin/categories");
    })
    .catch(validator => {
      errorMessages.push({ message: validator.errors });
      res.redirect("/admin/categories");
    });
});

// -- Route for update Edit '/admin/categories/update/:id'
router.post("/update/:id", (req, res) => {
  Categories.findById({ _id: req.params.id })
    .then(category => {
      category.name = req.body.name;

      category
        .save()
        .then(saved => {
          successMessages.push({ message: "Post updated successfully." });
          res.redirect("/admin/categories");
        })
        .catch(validator => {
          errorMessages.push({ message: validator.errors });
          res.redirect("/admin/categories");
        });
    })
    .catch(validator => {
      errorMessages.push({ message: validator.errors });
      res.redirect("/admin/categories");
    });
});

// -- Route for delete '/admin/categories/delete/:id'
router.get("/delete/:id", (req, res) => {
  Categories.findOneAndDelete({ _id: req.params.id })
    .then(result => {
      successMessages.push({ message: "Category deleted successfully!!!" });
      res.redirect("/admin/categories");
    })
    .catch(validator => {
      errorMessages.push({ message: validator.errors });
      res.redirect("/admin/categories");
    });
});

module.exports = router;
