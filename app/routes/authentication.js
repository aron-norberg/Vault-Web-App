'use strict';

exports.signup = function(req, res) {
  res.render('signup', {
    title: 'sign up'
  });
}

exports.login = function(req, res) {
  res.render('login', {
    title: 'login'
  });
}

exports.logout = function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/');
  });

}

exports.emailer = function(req, res) {
  res.render('emailer', {
    title: 'Send email'
  });

} // end exports.emailer = function(req, res)

exports.reset_password = function(req, res) {
  res.render('reset_password', {
    title: 'reset password'
  });

} // end exports.reset_password = function(req, res)
