const winston = require('winston');
require('express-async-errors');

module.exports = () => {
process.env.NODE_ENV !== 'production'?
  winston.handleExceptions( 
      new winston.transports.Console({ colorize: true, prettyPrint: true }),
      new winston.transports.File({ filename: 'uncaughtExceptionsDev.log'})
      )
   :winston.handleExceptions( 
      new winston.transports.File({ filename: 'uncaughtExceptionsProd.log'})
    );
  process.on('unhandledRejection', (ex) => {
    throw ex;
  });
  winston.add(winston.transports.File, { filename: 'logfile.log' })
}