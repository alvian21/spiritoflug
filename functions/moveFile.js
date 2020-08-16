const path = require("path");
const fs = require("fs");
module.exports = (files, filename, callback) => {
  files.mv(path.resolve(filename), function(err, res) {
    if (err) {
      return callback(err);
    } else {
      return callback(res);
    }
  });
};
