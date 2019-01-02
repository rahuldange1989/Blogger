const moment = require("moment");
const Categories = require("../models/Category");

module.exports = {
  select: function(selected, options) {
    return options
      .fn(this)
      .replace(
        new RegExp(' value="' + selected + '"'),
        '$&selected="selected"'
      );
  },

  startsWith: function(mainString, startString, options) {
    if (mainString.startsWith(startString)) {
      return options.fn(this);
    }
    return options.inverse(this);
  },

  getDateInFormat: function(date, format) {
    return moment(date).format(format);
  },

  isEqual: function(value1, value2) {
    console.log(`>>> ${value1} <<< ${value2}`);
    if (value1 == value2) {
      return "selected";
    } else {
      return "";
    }
  }
};
