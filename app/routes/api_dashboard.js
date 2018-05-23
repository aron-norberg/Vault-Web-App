// Invoke 'strict' JavaScript mode
'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');
const dateFormat = require('dateformat');


// Create a new 'render' controller method
// this runs when the user comes to the page, or selects from the dropdown menu of test date options
exports.getOverview = function(req, res) {
  
  let feature = "ALL";
  let language = "ALL";
  let lang = [];
  let testPassData = null;
  let testPassId = null;
  let testPassIds = null;
  let testPassInfo = null;
  let template = null;
  let testCases = null;
  let runDate = null;
  let reliability = null;
  let note = null;
  let description = null;
  let queryString = "";
  let idArray =[];

  let overall = {
    pass: 0,
    fail: 0,
    skip: 0
  }


  // 1st Get latest test Pass id
  // If test Pass Id not passed as query string, get latest default
  //  testpassid = query string
  //  testPassId = results from database
  //  TestPassId = table column

  if (!req.query.testpassid) { // happens when the user first opens the page

    db.sequelize.query(`select TestPassId from Status where EndTime > '1971' order by RunDate DESC;`).then(testPassId => { 

      testPassIds = testPassId[0];
      testPassId = testPassId[0][0].TestPassId;

      GetResultOverview(testPassId, testPassIds);
      // console.log("first query "+ testPassId);
    });

  } else {
    db.sequelize.query(`select TestPassId from Status where EndTime > '1971' order by RunDate DESC;`).then(testPassId => { 

      testPassIds = testPassId[0];
      testPassId = parseInt(req.query.testpassid); // happens when a user selects from the dropdown
      
      GetResultOverview(testPassId, testPassIds);
      // console.log("second thing "+ testPassId);
    });
  }


  function GetResultOverview(testPassId, testPassIds) {

    db.sequelize.query(`select distinct Language from Result where TestPassID = ${testPassId};`).then(results => {

      results = results[0];                     // happens when page is opened or a user selects from the dropdown
      // console.log("third thing");
      //console.log(results[0].Language);

      lang = results;
      //console.log('The value is - ' + lang[0].Language);

      if (testPassIds){
        for (var x =0; x<testPassIds.length; x++){
          idArray.push(testPassIds[x].TestPassId);
          // console.log(idArray);
        }
        let string = idArray.join("' OR TestPassId = '");
        queryString = "select TestPassId, Template, Language, TestCases, RunDate, Description, Reliable, Note from TestPass where TestPassId = '"+ string +"' order by RunDate DESC;";
        // console.log ("queryString is "+queryString);
      }
      else {
        queryString = 'select TestPassId, Template, Language, TestCases, RunDate, Description, Reliable, Note from TestPass order by RunDate DESC;';
      }
      db.sequelize.query(queryString).then(results => {

        results = results[0];

        testPassData = results;

        for (let i = testPassData.length - 1; i >= 0; i--) {
          testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM TT"); // + " PST";
          
          if (testPassData[i].TestPassId === testPassId) {
            testPassInfo = testPassData[i];
            template = testPassData[i].Template;
            testCases = testPassData[i].TestCases;
            reliability = testPassData[i].Reliable;
            note = testPassData[i].Note;
            description = testPassData[i].Description;
          }
        
        }

        // select count(*) from results where result = 'PASS';
        db.sequelize.query(`select count(*) from Result where Result = 'PASS' and TestPassID = ${testPassId};`).then(results => {

          results = results[0];              //these are what populate the google chart on the Dashboard (overall...)

          overall.pass = JSON.stringify(results[0]);
          overall.pass = overall.pass.replace("{\"count(*)\":", "");
          overall.pass = overall.pass.replace("}", "");
          overall.pass = parseInt(overall.pass);

          // Call next query:

          // select count(*) from results where result = 'FAIL';
          db.sequelize.query(`select count(*) from Result where Result = 'FAIL' and TestPassID = ${testPassId};`).then(results => {

            results = results[0];

            overall.fail = JSON.stringify(results[0]);
            overall.fail = overall.fail.replace("{\"count(*)\":", "");
            overall.fail = overall.fail.replace("}", "");
            overall.fail = parseInt(overall.fail);

            // select count(*) from results where result = 'SKIP';
            db.sequelize.query(`select count(*) from Result where Result = 'SKIP' and TestPassID = ${testPassId};`).then(results => {

              results = results[0];

              overall.skip = JSON.stringify(results[0]);
              overall.skip = overall.skip.replace("{\"count(*)\":", "");
              overall.skip = overall.skip.replace("}", "");
              overall.skip = parseInt(overall.skip);

              res.render('dashboard', {
                title: 'Dashboard',
                feature: feature,
                language: language,
                overall: overall,
                resultsTotal: null,
                languagesArray: lang,
                currentUrl: req.url,
                user: req.user,
                testPassData: testPassData,
                testPassId: testPassId,
                testPassInfo: testPassInfo,
                reliability: reliability,
                note: note
              });

              return null;

            }).catch(function(err) {
              console.log('error: ' + err);
              return err;

            })

            return null;

          }).catch(function(err) {
            console.log('error: ' + err);
            return err;

          })

          return null;

        }).catch(function(err) {
          console.log('error: ' + err);
          return err;

        })

        return null;
      }).catch(function(err) {
        console.log('error: ' + err);
        return err;

      })

      return null;
    }).catch(function(err) {
      console.log('error: ' + err);
      return err;

    })

  }

}; // end exports.getOverview = function(req, res)



//app.get('/dashboard/custom/:custom', api_dashbboard.getResultMetaByCustom)

exports.getResultMetaByCustom = function(req, res) {

  let custom = req.params.custom;
  let reliability = null;

  // Modify search query on ec2 to obtain correct result.
  custom = custom.replace(/ /g, "%");


  let language = "all";
  let features = ['F1', 'F2', 'F3', 'F4', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F15', 'F16', 'F17', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24', 'F25'];
  let pass = null;
  let fail = null;
  let skip = null;
  let testPassData = null;
  let testPassId = null;
  let testPassInfo = null;
  let note = null;

  let resultsTotal = [];



  let overall = {
    pass: 0,
    skip: 0,
    fail: 0
  };

  // 1st Get latest test Pass id
  // If test Pass Id not passed as query string, get latest default

  if (!req.query.testpassid) {

    db.sequelize.query(`select TestPassId from Status where EndTime is not NUll order by RunDate DESC limit 1;`).then(testPassId => {

      testPassId = testPassId[0][0].TestPassId;

      getResultsTotal(0, testPassId);

    });

  } else {

    testPassId = parseInt(req.query.testpassid);
    getResultsTotal(0, testPassId);



  }

  //function GetResultOverview(testPassId) {

  function getResultsTotal(i, testPassId) {

    // select count(*) from results where result = 'PASS';
    db.sequelize.query(`SELECT count(*) FROM Result WHERE Template = '${features[i]}' AND Result = 'PASS' AND Output LIKE '%${custom}%' AND TestPassID = ${testPassId};`).then(results => {

      results = results[0];

      pass = JSON.stringify(results[0]);
      pass = pass.replace("{\"count(*)\":", "");
      pass = pass.replace("}", "");
      pass = parseInt(pass);

      overall.pass += pass;

      db.sequelize.query('select TestPassId, RunDate, Description, Reliable, Note from TestPass order by RunDate DESC').then(results => {

        results = results[0];

        testPassData = results;

        for (let i = testPassData.length - 1; i >= 0; i--) {

          testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "dddd, mmmm dS, yyyy, h:MM:ss TT"); // + " PST";
        }

        if (testPassData[i].TestPassId === testPassId) {
          testPassInfo = testPassData[i];
          reliability = testPassData[i].Reliable;
          note = testPassData[i].Note;
        }

        // New value = pass

        // select count(*) from results where result = 'FAIL';
        db.sequelize.query(`SELECT count(*) FROM Result WHERE Template = '${features[i]}' AND Result = 'FAIL' AND Output LIKE '%${custom}%' AND TestPassID = ${testPassId};`).then(results => {

          results = results[0];

          fail = JSON.stringify(results[0]);
          fail = fail.replace("{\"count(*)\":", "");
          fail = fail.replace("}", "");
          fail = parseInt(fail);

          overall.fail += fail;

          // New value = fail

          // select count(*) from results where result = 'SKIP';
          db.sequelize.query(`SELECT count(*) FROM Result WHERE Template = '${features[i]}' AND Result = 'SKIP' AND Output LIKE '%${custom}%' AND TestPassID = ${testPassId};`).then(results => {

            results = results[0];

            skip = JSON.stringify(results[0]);
            skip = skip.replace("{\"count(*)\":", "");
            skip = skip.replace("}", "");
            skip = parseInt(skip);

            overall.skip += skip;

            // New value = skip

            // Now push to the array

            resultsTotal.push({
              language: language,
              feature: features[i],
              pass: pass,
              fail: fail,
              skip: skip
            })

            if (i === features.length - 1) {

              //console.log(resultsTotal);
              //res.send(resultsTotal);
              //res.send(overall);

              // Remove % marks for output to page
              custom = custom.replace(/%/g, " ");

              res.render('dashboard', {
                language: language,
                feature: "all",
                title: 'Results with query: ' + custom,
                resultsTotal: resultsTotal,
                overall: overall,
                currentUrl: req.url,
                user: req.user,
                testPassData: testPassData,
                testPassId: testPassId,
                testPassInfo: testPassInfo,
                reliability: reliability,
                note: note
              });

            } else {

              setTimeout(() => { getResultsTotal(i + 1, testPassId); });
            }
            return null;

          }).catch(function(err) {
            console.log('error: ' + err);
            return err;

          })
          return null;

        }).catch(function(err) {
          console.log('error: ' + err);
          return err;

        })
        return null;

      }).catch(function(err) {
        console.log('error: ' + err);
        return err;

      })

      return null;

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;

    })
  }
};

exports.getResultMetaByLocale = function(req, res) {

  let locale = req.params.locale;
  let language = locale;
  let features = ['F1', 'F2', 'F3', 'F4', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F19', 'F20', 'F21', 'F22', 'F23', 'F24', 'F25'];
  let pass = null;
  let fail = null;
  let skip = null;
  let testPassData = null;
  let testPassId = null;
  let testPassInfo = null;
  let reliability = null;
  let note = null;

  let resultsTotal = [];

  let overall = {
    pass: 0,
    skip: 0,
    fail: 0
  };



  // 1st Get latest test Pass id
  // If test Pass Id not passed as query string, get latest default

  if (!req.query.testpassid) {

    db.sequelize.query(`select TestPassId from Status where EndTime is not NUll order by RunDate DESC limit 1;`).then(testPassId => {

      testPassId = testPassId[0][0].TestPassId;

      getResultsTotal(0, testPassId);

    });

  } else {

    testPassId = parseInt(req.query.testpassid);
    getResultsTotal(0, testPassId);

  }


  function getResultsTotal(i, testPassId) {



    // select count(*) from results where result = 'PASS';
    db.sequelize.query(`SELECT count(*) FROM Result WHERE Template = '${features[i]}' AND Result = 'PASS' and Language = '${locale}' AND TestPassID = ${testPassId};`).then(results => {

      results = results[0];

      pass = JSON.stringify(results[0]);
      pass = pass.replace("{\"count(*)\":", "");
      pass = pass.replace("}", "");
      pass = parseInt(pass);

      overall.pass += pass;


      db.sequelize.query('select TestPassId, RunDate, Description, Reliable, Note from TestPass order by RunDate DESC').then(results => {

        results = results[0];

        testPassData = results;

        for (let i = testPassData.length - 1; i >= 0; i--) {

          testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "dddd, mmmm dS, yyyy, h:MM:ss TT"); // + " PST";

          if (testPassData[i].TestPassId === testPassId) {
            testPassInfo = testPassData[i];
            reliability = testPassData[i].Reliable;
            note = testPassData[i].Note;
          }
        }

        // select count(*) from results where result = 'FAIL';
        db.sequelize.query(`SELECT count(*) FROM Result WHERE Template = '${features[i]}' AND Result = 'FAIL' and Language = '${locale}' AND TestPassID = ${testPassId};`).then(results => {

          results = results[0];

          fail = JSON.stringify(results[0]);
          fail = fail.replace("{\"count(*)\":", "");
          fail = fail.replace("}", "");
          fail = parseInt(fail);

          overall.fail += fail;

          // New value = fail

          // select count(*) from results where result = 'SKIP';
          db.sequelize.query(`SELECT count(*) FROM Result WHERE Template = '${features[i]}' AND Result = 'SKIP' and Language = '${locale}' AND TestPassID = ${testPassId};`).then(results => {

            results = results[0];

            skip = JSON.stringify(results[0]);
            skip = skip.replace("{\"count(*)\":", "");
            skip = skip.replace("}", "");
            skip = parseInt(skip);

            overall.skip += skip;

            // New value = skip

            // Now push to the array

            resultsTotal.push({
              language: language,
              feature: features[i],
              pass: pass,
              fail: fail,
              skip: skip
            })

            if (i === features.length - 1) {

              //console.log(resultsTotal);
              //res.send(resultsTotal);
              //res.send(overall);

              res.render('dashboard', {
                language: language,
                feature: "all",
                title: 'Results by Language',
                resultsTotal: resultsTotal,
                overall: overall,
                currentUrl: req.url,
                user: req.user,
                testPassData: testPassData,
                testPassId: testPassId,
                testPassInfo: testPassInfo,
                reliability: reliability,
                note: note
              });

            } else {

              setTimeout(() => { getResultsTotal(i + 1, testPassId); });
            }

            return null;

          }).catch(function(err) {
            console.log('error: ' + err);
            return err;

          })

          return null;

        }).catch(function(err) {
          console.log('error: ' + err);
          return err;

        });

        return null;


      }).catch(function(err) {
        console.log('error: ' + err);
        return err;

      })

      return null;

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;

    })
  }
};


// Delete Test results by TestPassId from TestPass, Status, and Result tables.
exports.deleteTestResults = function(req, res) {
  // console.log('Hey everyone I found Waldo!');
  let Id = req.query.Id; //GET method

  // TestPass table
  db.TestPass.destroy({
    where: {
      TestPassId: req.query.Id
    }

  }).then(function (TestPass) {

    if (TestPass >= 1) {
      console.log('PASS:  Test result - ' + Id + ' has been deleted from TestPass table.');
    }
    else {
      console.log('FAIL: Test result - ' + Id + ' was not found in TestPass table.');
    }

  });

  // Status table
  db.Status.destroy({
    where: {
      TestPassId: req.query.Id
    }

  }).then(function (Status) {

    if (Status >= 1) {
      console.log('PASS: Test result - ' + Id + ' has been deleted from Status table.');
    }
    else {
      console.log('FAIL: Test result - ' + Id + ' was not found in Status table.');
    }

  });

  // Result table
  db.Result.destroy({
    where: {
      TestPassId: req.query.Id
    }

  }).then(function (Result) {

    if (Result >= 1) {
      console.log('PASS: Test result - ' + Id + ' has been deleted from Result table.');
    }
    else {
      console.log('FAIL: Test result - ' + Id + ' was not found in Result table.');
    }

  });

  res.redirect('/dashboard');

}; // end exports.deleteTestResults = function(req, res)
