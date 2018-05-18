// To set the Node Env 
// Use $ export NODE_ENV=development
//

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const configureSequelize = require('./config/sequelize');
const configureExpress = require('./config/express');
//const configurePassport = require('./config/passport');

//const db = configureMongoose();
const app = configureExpress();
//const passport = configurePassport();

console.log('Express Server Running.');

module.exports = app;
