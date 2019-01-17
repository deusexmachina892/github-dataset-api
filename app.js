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
require('./startup/middlewares')(app);

<<<<<<< HEAD
const port = process.env.PORT || 5000;
app.listen(port, () => {
  winston.log(`Server bound to PORT: ${port}`);
})

=======
>>>>>>> 01986f64eb21607045428b2eb0f9adb91bdb3cf7
module.exports = app;
