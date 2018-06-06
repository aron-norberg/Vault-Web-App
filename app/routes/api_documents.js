'use strict';

exports.showDocs = function(req, res) {

  res.render('documents', {
    title: 'Vault Documentation',
    currentUrl: req.url,
    user: req.user
  });
};
