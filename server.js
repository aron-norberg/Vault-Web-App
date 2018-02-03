
// To set the Node Env 
// Use $ export NODE_ENV=development
//

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const mysqlDb = require('./config/sequelize.js');

mysqlDb
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
 });


const configureMongoose = require('./config/mongoose');
const configureExpress = require('./config/express');
const configurePassport = require('./config/passport');

const db = configureMongoose();
const app = configureExpress();
const passport = configurePassport();

app.listen(3000);
module.exports = app;
console.log('Server running at http://localhost:3000/');