const express = require('express');
const winston = require('winston');

// logging
require('./startup/logging')();

// registering models
require('./models/Events');
require('./models/Actor');
require('./models/Repo');

// connecting db
require('./startup/db')();

// view engine, routes related logic and error handling
const app = express();
require('./startup/routes')(app);

const port = process.env.PORT || 5000;

module.exports = app;
