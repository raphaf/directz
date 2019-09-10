const express = require('express');
const cookieParser = require('cookie-parser');
const { connect } = require('../../lib/connector');

const app = express();
const port = 3000;
const dir = `${process.env.PWD}/test/app6/services`;
const createRouter = express.Router;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// create REST routes from your directory and files
connect({ app, dir, createRouter });

const server = app.listen(port);

module.exports.app = app;
module.exports.server = server;