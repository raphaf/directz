const { resourcesFromDir } = require('./resources');
const _ = require('lodash');

function parseQuery(query) {
  return _.mapValues(query || {}, value => {
    let parsed = value;
    if (value === 'null') parsed = null
    return parsed
  })
}

function handleRequest(target) {
  return async function (req, res, next) {
    try {
      const data = _.assignIn({}, res.locals, req.params, parseQuery(req.query), req.body)
      const result = await target(data);
      await handleResponse(req, res, next, result);
    } catch (error) {
      await handleError(error, res);
      throw error
    }
  };
}

function handleResponse(req, res, next, result) {
  if (result && result.then) {
    return result
      .then(result => res.json(result))
      .catch(error => handleError(error, res));
  } else {
    return res.json(result);
  }
}

function handleError(error, res) {
  if (error && error.code) {
    return res.status(400).json({message: error.message, code: error.code});
  } else if (error) {
    return res.status(500).json({ message: error.message, stack: error.stack });
  } else {
    return res.status(500).json({ message: "INTERNAL ERROR"});
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

function mapCustomHandlers({ instance, url, app }) {
  app.use(url, function (req, res, next) {
    const data = _.assignIn({}, res.locals, req.params, req.query, req.body)
    const handlerName = data.handler;
    if (handlerName && instance[handlerName] && _.isFunction(instance[handlerName])) {
      try {
        const target = instance[handlerName];
        const result = target(data);
        handleResponse(req, res, next, result);
      } catch (error) {
        handleError(error, res);
      }
    } else {
      next();
    }
  });
}


function mapHandlers({ router, instance }) {
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
      mapCustomHandlers({ instance, url, app });
      mapHandlers({ router, instance });
      app.use(url, router)
    });
  }

  const handleResources = (resources) => resources.forEach(connectResource);

  return resourcesFromDir(dir).then(handleResources);
}