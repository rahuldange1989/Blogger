module.exports = {
  uploadsDirectory: "./public/uploads/",

  isEmpty: function(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
};
