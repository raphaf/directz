const { files } = require('./files');
const { parentUrls } = require('./urls');
const { singular } = require('pluralize');

function buildUrls({ parentPath, path }) {
  if (parentPath) {
    const mapper = (parent) => parent + path;
    return parentUrls(parentPath).map(mapper);
  }
  return [path];
}

exports.resourceFromFile = resourceFromFile = function (dir, file) {
  const fileName = file.replace(/^.*[\\\/]/, '');
  const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const dirName = file.substring(0, file.lastIndexOf("/"));
  const parentPath = dirName.replace(dir, "");
  const path = "/" + fileNameWithoutExtension;
  const name = fileNameWithoutExtension;
  const param = singular(fileNameWithoutExtension) + "Id";
  const resource = { name, parentPath, path, file };
  resource.urls = buildUrls(resource);
  return resource;
}

exports.resourcesFromDir = function (dir) {
  const mapper = (file) => resourceFromFile(dir, file);
  return files(dir).then((files) => files.map(mapper));
}