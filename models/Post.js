const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },

  title: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: "Public"
  },

  allowComments: {
    type: Boolean,
    required: true
  },

  body: {
    type: String,
    required: true
  },

  file: {
    type: String,
    default: "default.jpeg"
  },

  date: {
    type: Date,
    default: Date.now()
  },

  category: {
    type: Schema.Types.ObjectId,
    ref: "categories"
  },

  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "comments"
    }
  ]
});

module.exports = mongoose.model("posts", PostSchema);
