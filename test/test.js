const chai = require('chai'),
  chaiHttp = require('chai-http'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();

chai.use(chaiHttp);

const sinon = require('sinon');

sinon.config = {
  useFakeTimers: false
};

const { files } = require('../lib/files');
const { parentUrls, includeParams } = require('../lib/urls');
const { resourcesFromDir } = require('../lib/resources');
const { connect } = require('../lib/connector');

describe('files', function () {
  describe('files()', function () {
    it('should return a list with two files in it', function (done) {
      files(process.env.PWD + '/test/app1')
        .then(function (resources) {
          assert.equal(resources.length, 2);
          done();
        })
        .catch(function (e) {
          done(new Error(JSON.stringify(e)));
        });
    });
  });
});

describe('urls', function () {
  describe('includeParams(url)', function () {
    it('should include params', function () {
      includeParams("/orders").should.equal("/orders/:orderId");
      includeParams("/orders/items").should.equal("/orders/:orderId/items/:itemId");
    });
  });
});

describe('urls', function () {
  describe('parentUrls(url)', function () {
    it('should return all urls', function () {
      const urls = parentUrls("/orders/items");
      urls.should.include("/orders/items")
      urls.should.include("/orders/items/:itemId")
      urls.should.include("/orders/:orderId/items")
      urls.should.include("/orders/:orderId/items/:itemId")
      urls.should.to.have.lengthOf(4);
    });
  });
});

describe('urls', function () {
  describe('parentUrls(url)', function () {
    it('should return all urls', function () {
      const urls = parentUrls("/orders/items/options");
      urls.should.include("/orders/items/options");
      urls.should.include("/orders/items/options/:optionId");
      urls.should.include("/orders/:orderId/items/options");
      urls.should.include("/orders/:orderId/items/options/:optionId");
      urls.should.include("/orders/items/:itemId/options");
      urls.should.include("/orders/:orderId/items/:itemId/options");
      urls.should.include("/orders/:orderId/items/:itemId/options/:optionId");
      urls.should.to.have.lengthOf(8);
    });
  });
});

describe('resources', function () {
  describe('resouces()', function () {
    it('should return valid URLs', function (done) {
      resourcesFromDir(process.env.PWD + '/test/app1')
        .then(function (resources) {
          const urls = resources.map((resource) => resource.urls).reduce((a, b) => a.concat(b));
          urls.should.include("/products");
          urls.should.include("/categories");
          assert.equal(urls.length, 2);
          done();
        })
        .catch(function (e) {
          done(new Error(JSON.stringify(e)));
        });
    });
  });
});

describe('resources', function () {
  describe('resouces()', function () {
    it('should return valid URLs with subdirs', function (done) {
      resourcesFromDir(process.env.PWD + '/test/app2')
        .then(function (resources) {
          const urls = resources.map((resource) => resource.urls).reduce((a, b) => a.concat(b));
          urls.should.include("/orders");
          urls.should.include("/orders/items");
          urls.should.include("/orders/:orderId/items");
          assert.equal(urls.length, 3);
          done();
        })
        .catch(function (e) {
          done(new Error(JSON.stringify(e)));
        });
    });
  });
});

describe('resources', function () {
  describe('resouces()', function () {
    it('should return valid URLs with subdirs', function (done) {
      resourcesFromDir(process.env.PWD + '/test/app3')
        .then(function (resources) {
          const urls = resources.map((resource) => resource.urls).reduce((a, b) => a.concat(b));
          urls.should.include("/orders");
          urls.should.include("/orders/items");
          urls.should.include("/orders/:orderId/items");
          urls.should.include("/orders/items/options");
          urls.should.include("/orders/items/:itemId/options");
          urls.should.include("/orders/:orderId/items/options");
          urls.should.include("/orders/:orderId/items/:itemId/options");
          assert.equal(urls.length, 7);
          done();
        })
        .catch(function (e) {
          done(new Error(JSON.stringify(e)));
        });
    });
  });
});

describe('connector', function () {

  const dir = process.env.PWD + '/test/app4';
  const dir1 = process.env.PWD + '/test/app5';

  let app;
  let get;
  let post;
  let put;
  let patch;
  let del;
  let router;
  let createRouter;

  beforeEach(function () {
    app = { use: sinon.fake() };
    get = sinon.fake();
    post = sinon.fake();
    put = sinon.fake();
    patch = sinon.fake();
    del = sinon.fake();
    router = { get, post, put, patch, delete: del };
    createRouter = sinon.fake.returns(router);
  });

  it('should connect resource to app', function (done) {
    connect({ app, createRouter, dir })
      .then(() => {
        sinon.assert.calledOnce(createRouter);
        sinon.assert.calledOnce(app.use);
        sinon.assert.calledWith(app.use, '/products', router);
        done();
      })
      .catch(done);
  });


  it('should register GET request handler for "find" method', function (done) {
    connect({ app, createRouter, dir })
      .then(() => {
        sinon.assert.calledWith(router.get, '/', sinon.match.func);
        done();
      })
      .catch(done);
  });

  it('should register GET request handler for "findOne" method', function (done) {
    connect({ app, createRouter, dir })
      .then(() => {
        sinon.assert.calledWith(router.get, '/:id', sinon.match.func);
        done();
      })
      .catch(done);
  });

  it('should register POST request handler for "insert" method', function (done) {
    connect({ app, createRouter, dir })
      .then(() => {
        sinon.assert.calledWith(router.post, '/', sinon.match.func);
        done();
      })
      .catch(done);
  });

  it('should register PUT and PATCH request handler for "update" method', function (done) {
    connect({ app, createRouter, dir })
      .then(() => {
        sinon.assert.calledWith(router.put, '/:id', sinon.match.func);
        sinon.assert.calledWith(router.patch, '/:id', sinon.match.func);
        done();
      })
      .catch(done);
  });

  it('should register POST, PUT and PATCH  request handler for "save" method', function (done) {
    connect({ app, createRouter, dir: dir1 })
      .then(() => {
        sinon.assert.calledWith(router.post, '/', sinon.match.func);
        sinon.assert.calledWith(router.put, '/:id', sinon.match.func);
        sinon.assert.calledWith(router.patch, '/:id', sinon.match.func);
        done();
      })
      .catch(done);
  });

  it('should register DELETE request handler for "remove" method', function (done) {
    connect({ app, createRouter, dir })
      .then(() => {
        sinon.assert.calledWith(router.delete, '/:id', sinon.match.func);
        done();
      })
      .catch(done);
  });

});

describe('connector', function () {

  const { app, server } = require('./app6/server');

  after(function (done) {
    server.close(() => done());
  });

  it('should return response with code 200', function (done) {
    chai.request(app)
      .get('/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  });

  it('should return response with code 400', function (done) {
    chai.request(app)
      .put('/products/1')
      .send({ name: 'iPhone XS' })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a('object');
        expect(res.body).to.have.property('code', 'INVALID_TIME_FOR_UPDATE');
        done();
      });
  });

  it('should return response with code 500', function (done) {
    chai.request(app)
      .post('/products')
      .send({ name: 'iPhone XS' })
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.be.a('object');
        done();
      });
  });

});



