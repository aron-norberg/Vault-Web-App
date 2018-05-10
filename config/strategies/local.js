// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  db = require('../sequelize'),
  bcrpyt = require('bcrypt-nodejs');

// Create the Local strategy configuration method
module.exports = function() {

  // Use the Passport's Local strategy 
  passport.use('local', new LocalStrategy(function(username, password, done) {

    // Use the 'User' model 'findOne' method to find a user with the current username
    db.user.findOne({ where: { username: username } }).then(function(user) {

      // If a user was not found, continue to the next middleware with an error message
      if (!user) {
      	console.log('Unkown User');
        return done(null, false, {

          message: 'Unknown user'
        });
      }

      let hashedPassword = bcrypt.hashSync(password, user.salt)

      // If the password is incorrect, continue to the next middleware with an error message
      if (user.password === hashedPassword) {
        return done(null, user)
      }

      console.log('Incorrect Credentials');
      return done(null, false, { message: 'Incorrect credentials.' });

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })
  }))
};
