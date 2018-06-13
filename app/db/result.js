// Example of database query - not currently in use
// Result Queries

const db = require('../../config/sequelize');
const async = require('async');

exports.getResultsByLanguageAndTemplate = function(template, language, testPassId, start, rowsToReturn) {

  async.parallel({

    results: function(cb) {
      db.sequelize.query(`SELECT * FROM Result WHERE Template = '${template}' AND Language LIKE '${language}' AND TestPassId = '${testPassId}' ORDER BY TestCaseId, URLs limit ${start}, ${rowsToReturn};`).then(results => {

        results = results[0];

        cb(null, results);
      });
    },
    testPassData: function(cb) {
      db.sequelize.query('select TestPassId, RunDate, Description from TestPass').then(testData => {

        testPassData = testData[0];

        cb(null, testPassData);
      });
    },
    count: function(cb) {
      db.sequelize.query(`select count(*) from Result WHERE Template = '${template}' AND Language LIKE '${language}' AND TestPassId = '${testPassId}';`).then(count => {

        count = count[0];

        cb(null, count);
      });
    },
    users: function(cb) {
      db.sequelize.query(`select distinct firstname from User`).then(users => {

        users = users[0];

        cb(null, users);
      });
    }
  }, (err, results) => {

    //console.log(results.testPassData);
    //console.log(results.testPass);
    //console.log(results.count);
    //console.log(results.users);

  });

}

/*

async.parallel({
  card_count: function(cb) {
    db
      .Card
      .findAll({
        where: { course_id: 'some id' }
      })
      .then(function(results) {
        var t = [];
        results.forEach(function(result) {
          var e = {};
          e['name'] = result.name;
          e['order_code'] = result.order_code;
          t.push(e);
        })
        cb(null, t);
      });
  },
  pack_count: function(cb) {
    db
      .Pack
      .findAll({
        where: { course_id: 'some other id' }
      })
      .then(function(results) {
        var s = [];
        results.forEach(function(result) {
          var e = {};
          e['name'] = result.name;
          e['order_code'] = result.order_code;
          s.push(e);
        })
        cb(null, s);
      });
  }
}, function(err, results) {
  var card_count = results.card_count;
  var pack_count = results.pack_count;
  // results is now { "card_count": t, "pack_count": s }
});

*/
