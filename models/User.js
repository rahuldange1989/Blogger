const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = Schema({
  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  }
});

UserSchema.methods.verifyPassword = function(pass, hashPass, callbackFunc) {
  bcrypt.compare(pass, hashPass, (err, res) => {
    callbackFunc(res);
  });
};

module.exports = mongoose.model("users", UserSchema);
