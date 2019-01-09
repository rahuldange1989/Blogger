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

  isEqual: function(value1, value2, options) {
    if (value1 == value2) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },

  paginate: function(options) {
    let output = "";

    // -- For first page
    if (options.hash.current === 1) {
      output += `<ul class="pagination"><li class="page-item" disabled><a class="page-link" ><<</a></li>`;
    } else {
      output += `<ul class="pagination"><li class="page-item"><a href="?page=1" class="page-link" ><<</a></li>`;
    }

    // -- For previous page
    if (options.hash.current - 1 > 0) {
      output += `<li class="page-item"><a href="?page=${options.hash.current -
        1}" class="page-link" ><</a></li></ul>`;
    } else {
      output += `<li class="page-item" disabled><a class="page-link" ><</a></li></ul>`;
    }

    // -- Textbox for editing current page number
    output += `<input type="text" id="editPageBox" style="margin-top: 20px;height: 33px;width: 50px;margin-left: 2px;margin-right: 2px;text-align:center;" value="${
      options.hash.current
    }">`;

    // -- For next page
    if (options.hash.current + 1 > options.hash.pages) {
      output += `<ul class="pagination"><li class="page-item" disabled><a class="page-link" >></a></li>`;
    } else {
      output += `<ul class="pagination"><li class="page-item"><a href="?page=${options
        .hash.current + 1}" class="page-link" >></a></li>`;
    }

    // -- For Last page
    if (options.hash.current == options.hash.pages) {
      output += `<li class="page-item" disabled><a class="page-link" >>></a></li></ul>`;
    } else {
      output += `<li class="page-item"><a href="?page=${
        options.hash.pages
      }" class="page-link" >>></a></li></ul>`;
    }

    return output;
  }
};
