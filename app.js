const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { dbPath } = require('./config/keys');

require('./models/Events');
require('./models/Actor');
require('./models/Repo');

const index = require('./routes/index');
const eraseEvents = require('./routes/eraseEvents');
const events = require('./routes/events');
const actor = require('./routes/actor');

const app = express();

mongoose.connect(dbPath, {useNewUrlParser: true})
  .catch(err => {
      throw err;
  });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
app.use('/erase', eraseEvents);
app.use('/events', events);
app.use('/actors', actor);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
