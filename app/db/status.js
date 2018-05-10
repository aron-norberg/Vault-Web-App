// Result Queries

const db = require('../../config/sequelize');

exports.latestFeatures = function() {

  db.status.findAndCountAll().then(results => {

  
  }).catch(function(err) {
    console.log('error: ' + err);
    return err;
  });
}


