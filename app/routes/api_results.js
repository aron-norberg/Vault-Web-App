'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');
const async = require('async');
const util = require('util');
const dateFormat = require('dateformat');

// Read Excel File Data
var fs = require('fs');
var path = require('path');

//### NEED to find out correct path
var rootPath = path.normalize(__dirname + '../../../');
var rootPath = rootPath + 'temp_directory';

// Pagination Logic
const rowsToReturn = 25;

// Excel functionality:
// https://github.com/guyonroche/exceljs#create-a-workbook
const Excel = require('exceljs');

// Pagination part 1 of 2:
function paginationProcess1of2(page, rowsToReturn) {
  if (!page) {
    page = 1;
  }
  // else page = page
  if (page === '1') {
    page = 0;
  } else {
    page = page - 1;
  }

  let start = page * rowsToReturn;

  return {
    start: start,
    page: page
  }
}

// Pagination part 1 of 2:
function paginationProcess2of2(page, total, start, rowsToReturn, length) {

  // Get total number of pages
  let pages = Math.ceil(total / rowsToReturn);
  let end = start + length;

  if (page === 0) {
    page = 1;
  } else {
    ++page;
  }

  return {
    pages: pages,
    end: end,
    page: page
  }
}

// Process Local Urls to return correct url to ejs view template:

function processLocalPageUrls(reqUrl) {

  let urlString = null;
  let regexNum = /^[0-9]*$/;

  // Remove Query String from Path
  reqUrl = reqUrl.replace(/\?.*/, "");

  let urlArray = reqUrl.split("/");
  let basePath = urlArray.slice(0);

  if (urlArray[urlArray.length - 1].match(regexNum)) {

    urlArray.pop();
    basePath.pop();

    urlString = urlArray.toString();

    reqUrl = urlString.replace(/,/g, "/");

  } else {

    urlString = urlArray.toString();
    reqUrl = urlString.replace(/,/g, "/");

  }

  basePath = basePath.toString();
  basePath = basePath.replace(/,/g, "/");
  basePath = basePath + "/";

  reqUrl = reqUrl + "/";

  let localUrlData = {

    basePath: basePath,
    reqUrl: reqUrl,

  }

  return localUrlData;
}

// Get testpass Id
function EvaluateTestPassIdAndGetResults(testPassId) {

  if (!testPassId) {
    return new Promise((resolve, reject) => {
      db.sequelize.query(`select TestPassId from Status where EndTime is not NUll order by RunDate limit 1;`).then(testPassId => {
        testPassId = testPassId[0][0].TestPassId;

        if (!testPassId) {
          reject("Test Pass id Is not defined");

        } else {
          resolve(testPassId);

        }
      });
    })

  } else {
    return new Promise((resolve, reject) => {
      if (!testPassId) {

        reject("Test Pass id Is not defined");
      } else {
        resolve(testPassId);
      }
    });
  }
}


// Render the page 
function renderPage(renderPageData, req, res) {

  let users = renderPageData.results.users;
  let testPassData = renderPageData.results.testPassData;
  let length = renderPageData.results.length;
  let language = renderPageData.language;
  let page = renderPageData.page;
  let start = renderPageData.start;
  let rowsToReturn = renderPageData.rowsToReturn;
  let template = renderPageData.template;
  let reqUrl = renderPageData.reqUrl;
  let basePath = renderPageData.basePath;
  let pfsUrl = renderPageData.pfsUrl;
  let testresult = renderPageData.testresult;
  let custom = renderPageData.custom;
  let reqUserfirstname = renderPageData.reqUserfirstname;
  let testPassId = renderPageData.testPassId;
  let total = renderPageData.results.count;


  let results = renderPageData.results.results;
  // RETURN THE LANGUAGE VARIABLE TO HUMAN READABLE
  if (language === "%") {
    language = "All";
  }

  let paginationData = paginationProcess2of2(page, total, start, rowsToReturn, length);

  let pages = paginationData.pages;
  let end = paginationData.end;
  page = paginationData.page;

  // Pagination Logic Part II Ends Here

  res.render('results', {
    title: 'Test Results:',
    start: start,
    end: end,
    page: page,
    pages: pages,
    results: results,
    template: template,
    language: language,
    total: total,
    currentUrl: reqUrl,
    basePath: basePath,
    pfsUrl: pfsUrl,
    testresult: testresult,
    custom: custom,
    user: reqUserfirstname,
    users: users,
    testPassData: testPassData,
    testPassId: testPassId

  });
}

// result
exports.postResults = function(req, res, next) {

  console.log(req.body.features);

  var features = req.body.features;
  // Features is an array of objects
  var resultCompilation = [];

  if (features[0].name === "all" && features[0].locale !== "all") {

    getResultsTotalLanguages(features);

    function getResultsTotalLanguages(features) {
      var j = 0;
      var promises = features.map((item) => { // return array of promises
        return db.sequelize.query(`SELECT * FROM Result WHERE Language = '${features[j++].locale}';`)
          .then(data => {

            resultCompilation = resultCompilation.concat(data[0]);

          }, function(err) {
            console.error('error: ' + err);
            return err;
          });
      });

      Promise.all(promises).then(() => {

        resultCompilation[0].Template = "all";
        // Process Output strings to return correct values
        for (var i = 0; i < resultCompilation.length; i++) {
          resultCompilation[i].Output = String(resultCompilation[i].Output);

        }
        //res.redirect('/result');
        //res.send("test");
        req.results = resultCompilation;
        next();
      })
    }
  } else if (features[0].name === "all" && features[0].locale === "all") {

    getResultsTotal(features);

    function getResultsTotal(features) {
      var j = 0;
      var promises = features.map(function(item) { // return array of promises
        return db.sequelize.query(`SELECT * FROM Result;`)
          .then(data => {

            resultCompilation = resultCompilation.concat(data[0]);

          }, function(err) {
            console.error('error: ' + err);
            return err;
          });
      });

      Promise.all(promises).then(function() {

        resultCompilation[0].Template = "all";
        resultCompilation[0].locale = "all";
        // Process Output strings to return correct values
        for (var i = 0; i < resultCompilation.length; i++) {
          resultCompilation[i].Output = String(resultCompilation[i].Output);

        }
        //res.redirect('/result');
        //res.send("test");
        req.results = resultCompilation;
        next();
      })
    }
  } else {

    getResultsTotal(features);

    function getResultsTotal(features) {
      var j = 0;
      var promises = features.map((item) => { // return array of promises
        //console.log("the value of name is " + features[j].name);
        //console.log("the value of locale is " + features[j].locale);
        return db.sequelize.query(`SELECT * FROM Result WHERE Template = '${features[j].name}' AND Language LIKE '${features[j++].locale}';`)
          .then(data => {

            resultCompilation = resultCompilation.concat(data[0]);

          }, function(err) {
            console.error('error: ' + err);
            return err;
          });
      });

      Promise.all(promises).then(() => {
        // Process Output strings to return correct values
        for (var i = 0; i < resultCompilation.length; i++) {
          resultCompilation[i].Output = String(resultCompilation[i].Output);
          results[i].RunDate = dateFormat(results[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          //results[i].RunDate = dateFormat(results[i].RunDate, "dddd, mmmm dS, yyyy, h:MM:ss TT"); // + " PST";

        }
        //res.redirect('/result');
        //res.send("test");
        req.results = resultCompilation;
        next();
      })
    }
  }
};


// Inititally Supportes only a feature 
// and a language Combination.
exports.export_to_excel = function(req, res, next) {

  let results = req.results;
  const filepath = rootPath + '/' + `Report-${results[0].Template}-${results[0].Language}.xlsx`;

  let workbook = new Excel.Workbook();

  workbook.created = new Date();
  workbook.properties.date1904 = true;

  let status = "fail";

  var worksheet = workbook.addWorksheet('Test report');

  worksheet.columns = [
    { header: 'Test Case Id:', key: 'TestCaseId', width: 20 },
    { header: 'Test Pass Id:', key: 'TestPassId', width: 32 },
    { header: 'Run Date/Time:', key: 'RunDate', width: 10 },
    { header: 'Template:', key: 'Template', width: 10 },
    { header: 'Language:', key: 'Language', width: 10 },
    { header: 'Result:', key: 'Result', width: 10 },
    { header: 'URL:', key: 'URLs', width: 50 },
    { header: 'Output:', key: 'Output', width: 100 }
  ];

  console.log("the size of results is " + results.length);
  processItems(0);

  function processItems(j) {

    if (j < results.length) {

      worksheet.addRow({
        id: results[j].TestCaseId,
        TestRunId: results[j].TestPassId,
        RunDate: results[j].RunDate,
        Template: results[j].Template,
        Language: results[j].Language,
        Result: results[j].Result,
        URLs: results[j].URLs,
        Output: results[j].Output,
      });
      setTimeout(() => { processItems(j + 1); });

    } else {
      workbook.xlsx.writeFile(filepath).then(() => {
        console.log("The Export File has been written.");
      });
    }
  };
};


///results/feature/:template/locale/:locale/query/:custom
exports.getResultByIdLanguageCustom = function(req, res) {

  let template = req.params.template;
  let language = req.params.locale;
  let custom = req.params.custom;
  let testresult = req.params.testresult;
  let testPassId = req.query.testpassid;
  let page = req.query.page;
  let reqUrl = req.url;

  let localUrlData = processLocalPageUrls(reqUrl);
  let paginationData = paginationProcess1of2(page, rowsToReturn);

  EvaluateTestPassIdAndGetResults(testPassId).then(testPassId => {

    getResults(testPassId);

  });

  let pfsUrl = `/results/feature/${template}/locale/${language}/query/${custom}/testresult/`;
  pfsUrl = pfsUrl.replace(/%/g, " ");
  custom = custom.replace(/ /g, "%");
  // Pagination Logic Part I of II Ends Here
  function getResults(testPassId) {

    if (language === "all") {
      language = "%";
    }

    async.parallel({

      results: function(cb) {

        db.sequelize.query(`SELECT * FROM Result WHERE Template = '${template}' AND Language = '${language}' AND Output like '%${custom}%' AND TestPassId = '${testPassId}' ORDER BY TestCaseId, URLs limit ${paginationData.start}, ${rowsToReturn};`).then(results => {

          results = results[0];

          // Convert Result back to string
          for (let i = results.length - 1; i >= 0; i--) {
            results[i].Output = String(results[i].Output);
            results[i].RunDate = dateFormat(results[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
            //results[i].RunDate = dateFormat(results[i].RunDate, "dddd, mmmm dS, yyyy, h:MM:ss TT"); // + " PST";
          }

          cb(null, results);
        });
      },
      testPassData: function(cb) {
        db.sequelize.query('select TestPassId, RunDate, Description from TestPass').then(testPassData => {

          testPassData = testPassData[0];

          for (let i = testPassData.length - 1; i >= 0; i--) {

            testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
            //testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "dddd, mmmm dS, yyyy, h:MM:ss TT"); // + " PST";
          }


          cb(null, testPassData);
        });
      },
      count: function(cb) {
        db.sequelize.query(`select count(*) from Result WHERE Template = '${template}' AND Language = '${language}' AND Output like '%${custom}%' AND TestPassId = '${testPassId}'`).then(count => {

          count = count[0][0]['count(*)'];

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

      let renderPageData = {

        results: results,
        start: paginationData.start,
        rowsToReturn: rowsToReturn,
        template: template,
        language: language,
        reqUrl: localUrlData.reqUrl,
        basePath: localUrlData.basePath,
        pfsUrl: pfsUrl,
        testresult: testresult,
        custom: custom,
        reqUserfirstname: req.user.firstname,
        testPassData: results.testPassData,
        testPassId: testPassId,
        page: paginationData.page

      }

      renderPage(renderPageData, req, res);

    });
  }
};


// getResultByLanguage

exports.getResultByLanguage = function(req, res) {

  let template = "All";
  let custom = req.params.custom;
  let testresult = req.params.testresult;
  let language = req.params.locale;
  let testPassId = req.query.testpassid;
  let page = req.query.page;

  let reqUrl = req.url;

  let localUrlData = processLocalPageUrls(reqUrl);
  let paginationData = paginationProcess1of2(page, rowsToReturn);


  EvaluateTestPassIdAndGetResults(testPassId).then(testPassId => {

    getResults(testPassId);

  });

  let pfsUrl = `/results/locale/${language}/testresult/`;

  // Pagination Logic Part I of II Ends Here
  function getResults(testPassId) {

    if (language === "all") {
      language = "%";
    }


    async.parallel({

      results: function(cb) {

        db.sequelize.query(`SELECT * FROM Result WHERE Language = '${language}' AND TestPassId = '${testPassId}' ORDER BY TestCaseId, URLs limit ${paginationData.start}, ${rowsToReturn};`).then(results => {

          results = results[0];

          // Convert Result back to string
          for (let i = results.length - 1; i >= 0; i--) {
            results[i].Output = String(results[i].Output);
            results[i].RunDate = dateFormat(results[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, results);
        });
      },
      testPassData: function(cb) {
        db.sequelize.query('select TestPassId, RunDate, Description from TestPass').then(testPassData => {

          testPassData = testPassData[0];

          for (let i = testPassData.length - 1; i >= 0; i--) {

            testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, testPassData);
        });
      },
      count: function(cb) {
        db.sequelize.query(`select count(*) from Result WHERE Language = '${language}' AND TestPassId = '${testPassId}';`).then(count => {

          count = count[0][0]['count(*)'];

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

      let renderPageData = {

        results: results,
        start: paginationData.start,
        rowsToReturn: rowsToReturn,
        template: template,
        language: language,
        reqUrl: localUrlData.reqUrl,
        basePath: localUrlData.basePath,
        pfsUrl: pfsUrl,
        testresult: testresult,
        custom: custom,
        reqUserfirstname: req.user.firstname,
        testPassData: results.testPassData,
        testPassId: testPassId,
        page: paginationData.page

      }

      renderPage(renderPageData, req, res);

    });
  }
};























// results/feature/:template/locale/:language
exports.getResultByIdAndLanguage = function(req, res) {


  let template = req.params.template;
  let language = req.params.locale;
  let testPassId = req.query.testpassid;
  let page = req.query.page;
  let custom = req.params.custom;
  let testresult = req.params.testresult;
  let pfsUrl = `/results/feature/${template}/locale/${language}/testresult/`;
  let reqUrl = req.url;

  let localUrlData = processLocalPageUrls(reqUrl);
  let paginationData = paginationProcess1of2(page, rowsToReturn);

  EvaluateTestPassIdAndGetResults(testPassId).then(testPassId => {

    getResults(testPassId);

  });

  // Pagination Logic Part I of II Ends Here
  function getResults(testPassId) {

    if (language === "all") {
      language = "%";
    }

    async.parallel({

      results: function(cb) {
        db.sequelize.query(`SELECT * FROM Result WHERE Template = '${template}' AND Language LIKE '${language}' AND TestPassId = '${testPassId}' ORDER BY TestCaseId, URLs limit ${paginationData.start}, ${rowsToReturn};`).then(results => {

          results = results[0];

          // Convert Result back to string
          for (let i = results.length - 1; i >= 0; i--) {
            results[i].Output = String(results[i].Output);
            results[i].RunDate = dateFormat(results[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, results);
        });
      },
      testPassData: function(cb) {
        db.sequelize.query('select TestPassId, RunDate, Description from TestPass').then(testPassData => {

          testPassData = testPassData[0];

          for (let i = testPassData.length - 1; i >= 0; i--) {

            testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, testPassData);
        });
      },
      count: function(cb) {
        db.sequelize.query(`select count(*) from Result WHERE Template = '${template}' AND Language LIKE '${language}' AND TestPassId = '${testPassId}';`).then(count => {

          count = count[0][0]['count(*)'];

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

      let renderPageData = {

        results: results,
        start: paginationData.start,
        rowsToReturn: rowsToReturn,
        template: template,
        language: language,
        reqUrl: localUrlData.reqUrl,
        basePath: localUrlData.basePath,
        pfsUrl: pfsUrl,
        testresult: testresult,
        custom: custom,
        reqUserfirstname: req.user.firstname,
        testPassData: results.testPassData,
        testPassId: testPassId,
        page: paginationData.page

      }



      renderPage(renderPageData, req, res);

    });
  }
};


//From express.js:
// /results/feature/:template/locale/:locale/testresult/:testresult/

exports.getResultByLangFeatureAndTestResult = function(req, res) {


  let template = req.params.template;
  let language = req.params.locale;
  let testPassId = req.query.testpassid;
  let page = req.query.page;
  let custom = req.params.custom;
  let testresult = req.params.testresult;
  let pfsUrl = `/results/feature/${template}/locale/${language}/testresult/`;
  let reqUrl = req.url;

  let localUrlData = processLocalPageUrls(reqUrl);
  let paginationData = paginationProcess1of2(page, rowsToReturn);

  EvaluateTestPassIdAndGetResults(testPassId).then(testPassId => {

    getResults(testPassId);

  });

  // Pagination Logic Part I of II Ends Here
  function getResults(testPassId) {

    if (language === "all") {
      language = "%";
    }

    async.parallel({

      results: function(cb) {
        db.sequelize.query(`SELECT * FROM Result WHERE Template = '${template}' AND Language LIKE '${language}' AND Result = '${testresult}' AND TestPassId = '${testPassId}' ORDER BY TestCaseId, URLs limit ${paginationData.start}, ${rowsToReturn};`).then(results => {

          results = results[0];

          // Convert Result back to string
          for (let i = results.length - 1; i >= 0; i--) {
            results[i].Output = String(results[i].Output);
            results[i].RunDate = dateFormat(results[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";

          }

          cb(null, results);
        });
      },
      testPassData: function(cb) {
        db.sequelize.query('select TestPassId, RunDate, Description from TestPass').then(testPassData => {

          testPassData = testPassData[0];

          for (let i = testPassData.length - 1; i >= 0; i--) {

            testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, testPassData);
        });
      },
      count: function(cb) {
        db.sequelize.query(`select count(*) from Result WHERE Template = '${template}' AND Language LIKE '${language}' AND Result = '${testresult}' AND TestPassId = '${testPassId}';`).then(count => {

          count = count[0][0]['count(*)'];

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

      let renderPageData = {

        results: results,
        start: paginationData.start,
        rowsToReturn: rowsToReturn,
        template: template,
        language: language,
        reqUrl: localUrlData.reqUrl,
        basePath: localUrlData.basePath,
        pfsUrl: pfsUrl,
        testresult: testresult,
        custom: custom,
        reqUserfirstname: req.user.firstname,
        testPassData: results.testPassData,
        testPassId: testPassId,
        page: paginationData.page

      }

      renderPage(renderPageData, req, res);

    });
  }
};



//app.get('/results/feature/:template/query/:custom', api_results.getResultByTemplateCustom);

exports.getResultByTemplateCustom = function(req, res) {


  let template = req.params.template;
  let language = "All";
  let testPassId = req.query.testpassid;
  let page = req.query.page;
  let custom = req.params.custom;
  let testresult = req.params.testresult;
  let pfsUrl = `/results/feature/${template}/query/${custom}/testresult/`;
  let reqUrl = req.url;

  let localUrlData = processLocalPageUrls(reqUrl);
  let paginationData = paginationProcess1of2(page, rowsToReturn);

  EvaluateTestPassIdAndGetResults(testPassId).then(testPassId => {

    getResults(testPassId);

  });

  // Pagination Logic Part I of II Ends Here
  function getResults(testPassId) {

    if (language === "all") {
      language = "%";
    }

    async.parallel({

      results: function(cb) {
        db.sequelize.query(`SELECT * FROM Result WHERE Template = '${template}' AND Output like '%${custom}%' AND TestPassId = '${testPassId}' ORDER BY TestCaseId, URLs limit ${paginationData.start}, ${rowsToReturn};`).then(results => {

          results = results[0];

          // Convert Result back to string
          for (let i = results.length - 1; i >= 0; i--) {
            results[i].Output = String(results[i].Output);
            results[i].RunDate = dateFormat(results[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, results);
        });
      },
      testPassData: function(cb) {
        db.sequelize.query('select TestPassId, RunDate, Description from TestPass').then(testPassData => {

          testPassData = testPassData[0];

          for (let i = testPassData.length - 1; i >= 0; i--) {

            testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, testPassData);
        });
      },
      count: function(cb) {
        db.sequelize.query(`select count(*) from Result WHERE Template = '${template}' AND TestPassId = '${testPassId}' AND Output like '%${custom}%'`).then(count => {

          count = count[0][0]['count(*)'];

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

      let renderPageData = {

        results: results,
        start: paginationData.start,
        rowsToReturn: rowsToReturn,
        template: template,
        language: language,
        reqUrl: localUrlData.reqUrl,
        basePath: localUrlData.basePath,
        pfsUrl: pfsUrl,
        testresult: testresult,
        custom: custom,
        reqUserfirstname: req.user.firstname,
        testPassData: results.testPassData,
        testPassId: testPassId,
        page: paginationData.page

      }

      renderPage(renderPageData, req, res);

    });
  }
};


//app.get('/results/feature/:template/query/:custom/testresult/:testresult', api_results.getResultByTemplateCustomAndTestResult);

exports.getResultByTemplateCustomAndTestResult = function(req, res) {



  let template = req.params.template;
  let language = "All";
  let testPassId = req.query.testpassid;
  let page = req.query.page;
  let custom = req.params.custom;
  let testresult = req.params.testresult;
  let pfsUrl = `/results/feature/${template}/query/${custom}/testresult/`;
  let reqUrl = req.url;

  let localUrlData = processLocalPageUrls(reqUrl);
  let paginationData = paginationProcess1of2(page, rowsToReturn);

  EvaluateTestPassIdAndGetResults(testPassId).then(testPassId => {

    getResults(testPassId);

  });

  function getResults(testPassId) {

    if (language === "all") {
      language = "%";
    }

    async.parallel({

      results: function(cb) {
        db.sequelize.query(`SELECT * FROM Result WHERE Template = '${template}' AND Result = '${testresult}' AND TestPassId = '${testPassId}' AND Output like '%${custom}%' ORDER BY TestCaseId, URLs limit ${paginationData.start}, ${rowsToReturn};`).then(results => {

          results = results[0];

          // Convert Result back to string
          for (let i = results.length - 1; i >= 0; i--) {
            results[i].Output = String(results[i].Output);
            results[i].RunDate = dateFormat(results[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, results);
        });
      },
      testPassData: function(cb) {
        db.sequelize.query('select TestPassId, RunDate, Description from TestPass').then(testPassData => {

          testPassData = testPassData[0];

          for (let i = testPassData.length - 1; i >= 0; i--) {

            testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, testPassData);
        });
      },
      count: function(cb) {
        db.sequelize.query(`select count(*) from Result WHERE Template = '${template}' AND Result = '${testresult}' AND Output like '%${custom}%' AND TestPassId = '${testPassId}'`).then(count => {

          count = count[0][0]['count(*)'];

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

      let renderPageData = {

        results: results,
        start: paginationData.start,
        rowsToReturn: rowsToReturn,
        template: template,
        language: language,
        reqUrl: localUrlData.reqUrl,
        basePath: localUrlData.basePath,
        pfsUrl: pfsUrl,
        testresult: testresult,
        custom: custom,
        reqUserfirstname: req.user.firstname,
        testPassData: results.testPassData,
        testPassId: testPassId,
        page: paginationData.page

      }

      renderPage(renderPageData, req, res);

    });
  }
};


// from express.js:
// app.get('/results/:locale/testresult/:testResult', api_results.getResultByLangAndTestResult);
exports.getResultByLangAndTestResult = function(req, res) {


  let template = "All";
  let language = req.params.locale;
  let testPassId = req.query.testpassid;
  let page = req.query.page;
  let custom = req.params.custom;
  let testresult = req.params.testresult;
  let pfsUrl = `/results/locale/${language}/testresult/`;
  let reqUrl = req.url;

  let localUrlData = processLocalPageUrls(reqUrl);
  let paginationData = paginationProcess1of2(page, rowsToReturn);

  EvaluateTestPassIdAndGetResults(testPassId).then(testPassId => {

    getResults(testPassId);

  });

  function getResults(testPassId) {

    if (language === "all") {
      language = "%";
    }

    async.parallel({

      results: function(cb) {
        db.sequelize.query(`SELECT * FROM Result WHERE Language = '${language}' AND Result = '${testresult}' AND TestPassId = '${testPassId}' ORDER BY TestCaseId, URLs limit ${paginationData.start}, ${rowsToReturn};`).then(results => {

          results = results[0];

          // Convert Result back to string
          for (let i = results.length - 1; i >= 0; i--) {
            results[i].Output = String(results[i].Output);
            results[i].RunDate = dateFormat(results[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, results);
        });
      },
      testPassData: function(cb) {
        db.sequelize.query('select TestPassId, RunDate, Description from TestPass').then(testPassData => {

          testPassData = testPassData[0];

          for (let i = testPassData.length - 1; i >= 0; i--) {

            testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, testPassData);
        });
      },
      count: function(cb) {
        db.sequelize.query(`select count(*) from Result WHERE Language = '${language}' AND Result = '${testresult}' AND TestPassId = '${testPassId}';`).then(count => {

          count = count[0][0]['count(*)'];

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

      let renderPageData = {

        results: results,
        start: paginationData.start,
        rowsToReturn: rowsToReturn,
        template: template,
        language: language,
        reqUrl: localUrlData.reqUrl,
        basePath: localUrlData.basePath,
        pfsUrl: pfsUrl,
        testresult: testresult,
        custom: custom,
        reqUserfirstname: req.user.firstname,
        testPassData: results.testPassData,
        testPassId: testPassId,
        page: paginationData.page

      }

      renderPage(renderPageData, req, res);

    });
  }
};

//app.get('/results/feature/:template/locale/:locale/query/:custom/testresult/:testresult/', api_results.getResultByIdLanguageCustomTestResult)

exports.getResultByIdLanguageCustomTestResult = function(req, res) {


  let template = req.params.template;
  let language = req.params.locale;
  let testPassId = req.query.testpassid;
  let page = req.query.page;
  let custom = req.params.custom;
  let testresult = req.params.testresult;
  let pfsUrl = `/results/feature/${template}/locale/${language}/query/${custom}/testresult/`;
  let reqUrl = req.url;

  let localUrlData = processLocalPageUrls(reqUrl);
  let paginationData = paginationProcess1of2(page, rowsToReturn);

  EvaluateTestPassIdAndGetResults(testPassId).then(testPassId => {

    getResults(testPassId);

  });

  function getResults(testPassId) {

    if (language === "all") {
      language = "%";
    }

    async.parallel({

      results: function(cb) {
        db.sequelize.query(`SELECT * FROM Result WHERE Language = '${language}' AND Template = '${template}' AND Output like '%${custom}%' AND Result = '${testresult}' AND TestPassId = '${testPassId}' ORDER BY TestCaseId, URLs limit ${paginationData.start}, ${rowsToReturn};`).then(results => {

          results = results[0];

          // Convert Result back to string
          for (let i = results.length - 1; i >= 0; i--) {
            results[i].Output = String(results[i].Output);
            results[i].RunDate = dateFormat(results[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, results);
        });
      },
      testPassData: function(cb) {
        db.sequelize.query('select TestPassId, RunDate, Description from TestPass').then(testPassData => {

          testPassData = testPassData[0];

          for (let i = testPassData.length - 1; i >= 0; i--) {

            testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, testPassData);
        });
      },
      count: function(cb) {
        db.sequelize.query(`select count(*) from Result WHERE Language = '${language}' AND Template = '${template}' AND Output like '%${custom}%' AND Result = '${testresult}' AND TestPassId = '${testPassId}';`).then(count => {

          count = count[0][0]['count(*)'];

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

      let renderPageData = {

        results: results,
        start: paginationData.start,
        rowsToReturn: rowsToReturn,
        template: template,
        language: language,
        reqUrl: localUrlData.reqUrl,
        basePath: localUrlData.basePath,
        pfsUrl: pfsUrl,
        testresult: testresult,
        custom: custom,
        reqUserfirstname: req.user.firstname,
        testPassData: results.testPassData,
        testPassId: testPassId,
        page: paginationData.page

      }

      renderPage(renderPageData, req, res);

    });
  }
};
