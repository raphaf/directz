module.exports.find = function () {
  return [];
}

module.exports.customFind = function (data) {
  return [];
}

module.exports.insert = function () {
  a.b = c;
}

module.exports.update = function () {
  const error = new Error('Invalid time for update');
  error.code = "INVALID_TIME_FOR_UPDATE";
  throw error;
}