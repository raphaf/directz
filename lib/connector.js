const { resourcesFromDir } = require('./resources');
const _ = require('lodash');

function handleRequest(target) {
  return function (req, res, next) {
    const data = _.assignIn({}, req.params, req.query, req.body);
    const result = target(data);
    handleResponse(req, res, next, result);
  };
}

function handleResponse(req, res, next, result) {
  if (result && result.then) {
    result
      .then(result => res.json(result))
      .catch(error => res.json(error));
  } else {
    res.json(result);
  }
}

const handlers = {
  find(router, target) {
    router.get('/', handleRequest(target));
  },
  findOne(router, target) {
    router.get("/:id", handleRequest(target));
  },
  insert(router, target) {
    router.post('/', handleRequest(target));
  },
  update(router, target) {
    router.put("/:id", handleRequest(target));
    router.patch("/:id", handleRequest(target));
  },
  save(router, target) {
    router.post('/', handleRequest(target));
    router.put("/:id", handleRequest(target));
    router.patch("/:id", handleRequest(target));
  },
  remove(router, target) {
    router.delete("/:id", handleRequest(target));
  }
};


function mapHandlers({ router, instance, url }) {
  _.functions(instance).forEach(functionName => {
    let handler = handlers[functionName];
    if (handler) {
      handler(router, instance[functionName]);
    }
  });
}

exports.connect = function ({ dir, app, createRouter }) {

  function connectResource(resource) {
    const { urls } = resource;
    const instance = require(resource.file);
    urls.forEach((url) => {
      const router = createRouter({ mergeParams: true });
      mapHandlers({ router, instance });
      app.use(url, router)
    });
  }

  const handleResources = (resources) => resources.forEach(connectResource);

  return resourcesFromDir(dir).then(handleResources);
}