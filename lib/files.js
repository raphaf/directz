const { walk } = require('walk');

exports.files = function (dir) {
  return new Promise(function (resolve, reject) {
    const files = [];
    var walker = walk(dir, { followLinks: false });
    walker.on("file", function (root, stat, next) {
      const file = root + "/" + stat.name;
      files.push(file);
      next();
    });
    walker.on("errors", function (root, nodeStatsArray, next) {
      reject(nodeStatsArray);
    });
    walker.on("end", function () {
      resolve(files);
    });
  });
}