const { singular } = require('pluralize');

exports.includeParams = includeParams = function (url) {
  const reducer = (accumulator, urlPart) => {
    const param = singular(urlPart);
    return `${accumulator}/${urlPart}/:${param}Id`;
  }
  return url && url.split("/").reduce(reducer);
}

exports.parentUrls = parentUrls = function (url, parentUrl) {
  parentUrl = parentUrl || '';
  let accumulator = [];
  const parts = url.split("/").filter((value) => value);
  const currentValue = parts.shift();
  const urlWithoutParam = parentUrl + "/" + currentValue;
  const urlWithParam = parentUrl + includeParams("/" + currentValue);
  [urlWithoutParam, urlWithParam].forEach((currentUrl) => {
    if (parts.length) {
      const childUrl = "/" + parts.join("/")
      accumulator = accumulator.concat(parentUrls(childUrl, currentUrl))
    } else {
      accumulator.push(currentUrl);
    }
  });
  return accumulator;
}