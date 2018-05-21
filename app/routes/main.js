'use strict';

exports.getHome = function(req, res) {

  res.render('home', {
    title: 'Vault Automated Testing Suite',
    currentUrl: req.url,
    user: req.user
  });
};
