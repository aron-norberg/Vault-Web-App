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
