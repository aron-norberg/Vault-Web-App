'use strict';

exports.getLogin = function(req, res) {

  res.render('login', {
    title: 'Log-in',
    currentUrl: req.url,
    user: req.user
  });

};