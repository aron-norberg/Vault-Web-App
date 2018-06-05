'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');


exports.signup = function(req, res) {

  db.sequelize.query(`SELECT * FROM User;`).then(function(id) {

    let users = id[0];
    console.log(users);

    res.render('signup', {
      title: 'sign up',
      users: users,
      id: req.user.id,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      role: req.user.role,
      activeUser: req.user.firstname
    });

}); // end db.sequelize.query("SELECT * FROM user;")

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
