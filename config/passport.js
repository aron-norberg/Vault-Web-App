// Invoke 'strict' JavaScript mode

//load bcrypt
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport, user) {

  var User = user;
  var LocalStrategy = require('passport-local').Strategy;


  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id).then(function(user) {
      if (user) {
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });

  });


  //LOCAL SIGNUP
  passport.use('local-signup', new LocalStrategy(

    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {

      var generateHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
      };

      User.findOne({ where: { email: email } }).then(function(user) {

        if (user) {
          return done(null, false, { message: 'That email is already taken' });
        } else {
          let userPassword = generateHash(password);

          let data = {
          	username: email,
            email: email,
            password: userPassword,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            role: req.body.role
          };

          User.create(data).then(function(newUser, created) {
            if (!newUser) {
              return done(null, false);
            }

            if (newUser) {
              return done(null, newUser);

            }
          });
        }
      });
    }
  ));


  //LOCAL SIGNIN
  passport.use('local-signin', new LocalStrategy(

    {
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {

      var User = user;

      var isValidPassword = function(userpass, password) {
        return bCrypt.compareSync(password, userpass);
      }

      User.findOne({ where: { email: email } }).then(function(user) {

        if (!user) {
          console.log('Email does not exist');
          return done(null, false, { message: 'Email does not exist' });
        }

        if (!isValidPassword(user.password, password)) {

       	  console.log('Bad Password');
          return done(null, false, { message: 'Incorrect password.' });

        }

        console.log("great success.");

        var userinfo = user.get();

        return done(null, userinfo);

      }).catch(function(err) {

        console.log("Error:", err);

        return done(null, false, { message: 'Something went wrong with your Signin' });

      });
    }
  ));


  //RESET PASSWORD
  passport.use('local-reset-password', new LocalStrategy(

    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {
      // console.log('\n' + email + ' - ' + password + '\n');

      var generateHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
      };

      User.findOne({ where: { email: email } }).then(function(user) {

        if (!user) {
          console.log('Email does not exist');
          return done(null, false, { message: 'Email does not exist' });

        }
        else {
          let userPassword = generateHash(password);
          // console.log('\n' + email + ' - ' + userPassword + '\n');

          User.update({ password: userPassword }, { where: { email: email }}).then(function(User) {

            if (user) {
              console.log('\n' + "Password successfully updated" + '\n');
              done(null, user.get());

            }
            else {
              console.log('\n' + "Something went wrong, please try again" + '\n');
              done(user.errors, null);

            } // end if/else

          }); // end User.update({ password: userPassword }, { where: { email: email }}).then(function(User)


        } // end if/else

      }); // END User.findOne({ where: { email: email } }).then(function(user)

    } // END function(req, email, password, done)

  )); // END passport.use('local-reset-password', new LocalStrategy()

} // END module.exports = function(passport, user)
