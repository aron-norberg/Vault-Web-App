'use strict';

const async = require('async');
const db = require('../../config/sequelize');

exports.getTestCases = function(req, res) {

  // let jsonObject = JSON.stringify(req.body);
  let template = (req.body[0].theTemplate);
  // console.log("hello i have a template " + template);  // f8

  db.sequelize.query("select * from Template where Id = '" + template + "';").then(templates => {
    let list = templates[0];
    // console.log(list);
    list = list[0].TestCaseId;
    let templatesList = list.split(",");
    let queryString = templatesList.join("' OR TestCaseId = '");

    db.sequelize.query("select * from TestCase where TestCaseId = '" + queryString + "';").then(cases => {
      let caseList = cases[0];
      for (let i = caseList.length - 1; i >= 0; i--) {
        caseList[i].TestCaseDescription = String(caseList[i].TestCaseDescription);
      }

      // caseList = JSON.stringify(object);
      res.send(caseList);
    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })
  }).catch(function(err) {
    console.log('error: ' + err);
    return err;
  })
};

function getTestCasesAndUrlsFromDB() { //this is not in use currently with URLs no longer being populated. Test case selections use the above function

  return new Promise(function(resolve, reject) {

    async.parallel({

      testCases: function(cb) {
        db.sequelize.query(`select * from TestCase limit 5;`).then(allTCs => {
          allTCs = allTCs[0];
          cb(null, allTCs);
        });
      },

      allTheUrls: function(cb) {
        db.sequelize.query(`select * from Urls limit 1;`).then(allUrls => {
          let Urls = allUrls[0];
          cb(null, Urls);
        });
      }
    }, (err, results) => {
      if (results) {
        resolve(results);
        //  console.log(results);
      } else {
        reject(err);
      }
    });
  });
};


exports.modal = function(req, res) {

  getTestCasesAndUrlsFromDB().then(results => {

    let theTCs = results.testCases;
    let theURLs = results.allTheUrls;

    for (var i = 1; i < theTCs.length; i++) {
      theTCs[i].HashValue = JSON.stringify(theTCs[i].HashValue);

    }
    // console.log(theTCs[1].HashValue + " is the hash");
    // Need to figure out how to decipher what this string is.

    res.render('runTestsModal', {
      title: 'Run Tests',
      currentUrl: req.url,
      tcs: theTCs,
      urls: theURLs
    });
  });
};
