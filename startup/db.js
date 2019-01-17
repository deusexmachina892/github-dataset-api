const mongoose = require('mongoose');
const winston = require('winston');
const { dbPath } = require('../config/keys');

module.exports = () => {
    mongoose.connect(dbPath, {useNewUrlParser: true})
    .then(() => winston.info('Connected to db'));
};