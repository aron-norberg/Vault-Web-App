'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Excel = require('exceljs');
const os = require('os');
const dateFormat = require('dateformat');
const async = require('async');

// Read Excel File Data
const fs = require('fs');
const path = require('path');

//### NEED to find out correct path
let rootPath = path.normalize(__dirname + '../../../');
rootPath = rootPath + 'temp_directory';

// Excel functionality:
// https://github.com/guyonroche/exceljs#create-a-workbook



/************************
 * Function: getExport()
 * Purpose: This function provides the Test Date options for the export.ejs page (used for export link on Test Results page and on the Export Results page )
 * Parameters:
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.getExport = function(req, res) {

  db.TestPass.findAll({
    where: {
      Note: {
        [Op.ne]: null
      }
    }
  }).then(dateTimes => {

    db.Status.findAll({
      where: {
        EndTime: {
          [Op.gt]: "1972"
        }
      }
    }).then(statuses => {

      var dates = [];
      var datesIds = [];
      var statusId = [];
      var statusEndTime = [];
      var testDescription = [];

      // getting each date from TestPass table
      for (var i = 0; i < dateTimes.length; i++) {
        dateTimes[i].Output = String(dateTimes[i].Output);
        dates.push(dateTimes[i].RunDate = dateFormat(dateTimes[i].RunDate, "mm-dd-yy h:MM:ss TT")); // + " PST";
        datesIds.push(dateTimes[i].TestPassId);
        testDescription.push(dateTimes[i].Description);
        //console.log(testDescription[i] + "----------------------------description");
      }

      // getting EndTimes from Status table
      for (var x = 0; x < statuses.length; x++) {
        statuses[x].Output = String(statuses[x].Output);
        statusId.push(statuses[x].TestPassId);
        statusEndTime.push(statuses[x].EndTime);
        //console.log(statuses[x].EndTime + "----------------------------------------");
      }

      res.render('export', {
        title: 'Export Results',
        user: req.user,
        dates: dates,
        dateIds: datesIds,
        statusId: statusId,
        statusEndTime: statusEndTime,
        dateTimes: dateTimes,
        testDescription: testDescription
      });

      return null;

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    });

    return null;

  }).catch(function(err) {
    console.log('error: ' + err);
    return err;
  });

  return null;

  // }).catch(function(err) {
  //   console.log('error: ' + err);
  //   return err;
  // });
};


// This funciton is called when the EXPORT DATA button is selected, the html points to 'exportSelections()" (found on the runTest.js page)
// which takes us through the express.js page with  app.get('/export', isLoggedIn, api_export.getExportFromResults, api_export.export_to_excel);
// which takes us here...  the "return next();" lines take us to the export_to_excel function


/************************
 * Function: getExportFromResults()
 * Purpose: get the test results from the Results table that meet the specific user requests from the Export Results page (export.ejs)
 * Parameters: language, feature, testresult, testpassid, query = specify the results being requested
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.getExportFromResults = function(req, res, next) {
  let language = req.query.language;
  let feature = req.query.feature;
  if (feature =="All"){feature = "all";}
  if (language =="LAll"){language = "all";}
  let testresult = req.query.testresult;
  let query = req.query.query;
  let langArray = [];
  let fArray = [];
  let testPass = req.query.testpassid;

  // if(testPass != "All"){
  let loopedQuery = 'SELECT * FROM Result WHERE TestPassId = ' + testPass + " AND ";
  // } else {
  //   let loopedQuery='SELECT * from Result;';
  // }

  let results = null;

  console.log("language = " + language); // en-us
  console.log("feature = " + feature); // F2
  console.log("testresult= " + testresult); // 
  console.log("query = " + query); // 
  console.log("testPass = " + testPass); // 1

  //---------------------------------------------------------start of multiple choice query builder ------------------>
  //below we are looking to see if multiple choices were selected for either template or language and build a query that works for the selections
  if (language.includes(",") && feature.includes(",")) { //if multiple selections were made for both template and language...

    langArray = language.split(",");
    fArray = feature.split(",");

    loopedQuery += '(Language = ' + "'" + langArray[0] + "'";
    for (var x = 1; x < langArray.length; x++) {
      loopedQuery += " OR Language = " + "'" + langArray[x] + "'";
    }
    loopedQuery += ") AND (";
    loopedQuery += 'Template = ' + "'" + fArray[0] + "'";
    for (var x = 1; x < fArray.length; x++) {
      loopedQuery += " OR Template = " + "'" + fArray[x] + "'";
    }
    loopedQuery += ");";

  } else if (language.includes(",") && !feature.includes(",")) { //if multiple selections were made for language only

    langArray = language.split(",");
    loopedQuery += '(Language = ' + "'" + langArray[0] + "'";
    for (var x = 1; x < langArray.length; x++) {
      loopedQuery += " OR Language = " + "'" + langArray[x] + "'";
    }
    loopedQuery += ") AND Template = " + "'" + feature + "'";

  } else if (feature.includes(",") && !language.includes(",")) { // if multiple selections were made for features only

    fArray = feature.split(",");
    loopedQuery += '(Template = ' + "'" + fArray[0] + "'";
    for (var x = 1; x < fArray.length; x++) {
      loopedQuery += " OR Template = " + "'" + fArray[x] + "'";
    }
    loopedQuery += ") AND Language = " + "'" + language + "'";
  }
  //---------------------------------------------------------end of multiple choice query builder ------------------>
  // if multiple selections were made for either language or template, the first 'if' statement below will run

  console.log("the query starts as :"+query);
  query = query.replace(/ /g, "%");
  console.log("then query :"+query);
  query = query.split(" ").join("%");
  console.log("then query :"+query);

  ///results/locale/:locale'
  if (langArray.length > 0 || fArray.length > 0) {
    db.sequelize.query(loopedQuery).then(results => {
      results = results[0];
      // Needed To convert the blob object into a string Otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);
      }
      req.results = results;
      req.language = language;
      req.testresult = testresult;
      return next();
    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })
  } else if (feature === "all" && language === "all") {
    db.sequelize.query(`SELECT * FROM Result WHERE TestPassId = '${testPass}';`).then(results => {
      results = results[0];
      // Needed To convert the blob object into a string otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);
      }

      req.results = results;
      req.language = language;
      req.testresult = testresult;
      return next();
    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })


  } else if (feature === "all" && testresult === "") {
    db.sequelize.query(`SELECT * FROM Result WHERE TestPassId = '${testPass}' AND Language = '${language}';`).then(results => {
      results = results[0];
      // Needed To convert the blob object into a string 
      // Otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);
      }

      req.results = results;
      req.language = language;
      req.testresult = testresult;

      return next();

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })

    ///results/locale/:locale/testresult/:testresult'
  } else if (feature === "all" && testresult !== "") {

    db.sequelize.query(`SELECT * FROM Result WHERE TestPassId = '${testPass}' AND Language = '${language}' AND Result = '${testresult}';`).then(results => {

      results = results[0];

      // Needed To convert the blob object into a string 
      // Otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);
      }

      req.results = results;
      req.language = language;
      req.testresult = testresult;
      return next();

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })

    //results/feature/:template/query/:custom
  } else if (feature !== "all" && language === "all" && testresult === "" && query !== "") {

    db.sequelize.query(`SELECT * FROM Result WHERE TestPassId = '${testPass}' AND Template = '${feature}' AND Output LIKE '%${query}%';`).then(results => {
      results = results[0];

      // Needed To convert the blob object into a string 
      // Otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);

      }

      req.results = results;
      req.language = language;
      req.testresult = testresult;
      return next();

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })

    //results/feature/:template/query/:custom/testresult/:testresult
  } else if (feature !== "all" && language === "all" && testresult !== "" && query !== "") {
    db.sequelize.query(`SELECT * FROM Result WHERE TestPassId = '${testPass}' AND Template = '${feature}' AND Result = '${testresult}'AND Output LIKE '%${query}%';`).then(results => {
      results = results[0];

      // Needed To convert the blob object into a string 
      // Otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);

      }

      req.results = results;
      req.language = language;
      req.testresult = testresult;
      return next();

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })

  } else if (feature !== "all" && language !== "all" && testresult === "" && query === "") { // if only one selection was made for language and one for feature

    db.sequelize.query(`SELECT * FROM Result WHERE TestPassId = '${testPass}' AND Template = '${feature}' AND Language = '${language}';`).then(results => {
      results = results[0];

      // Needed To convert the blob object into a string 
      // Otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);
      }

      req.results = results;
      req.language = language;
      req.testresult = testresult;
      return next();

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })

  } else if (feature !== "all" && language !== "all" && testresult !== "" && query === "") {

    db.sequelize.query(`SELECT * FROM Result WHERE TestPassId = '${testPass}' AND Template = '${feature}' AND Result = '${testresult}' AND Language = '${language}';`).then(results => {
      results = results[0];

      // Needed To convert the blob object into a string 
      // Otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);

      }

      req.results = results;
      req.language = language;
      req.testresult = testresult;
      return next();

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })

  } else if (feature !== "all" && language !== "all" && query !== "" && testresult === "") {

    console.log("I am executing.\n\n\n");

    db.sequelize.query(`SELECT * FROM Result WHERE TestPassId = '${testPass}' AND Template = '${feature}' AND Language = '${language}' AND Output LIKE '%${query}%';`).then(results => {

      results = results[0];

      // Needed To convert the blob object into a string 
      // Otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);

      }

      req.results = results;
      req.language = language;
      req.testresult = testresult;
      return next();

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })

  } else if (feature !== "all" && language !== "all" && query !== "" && testresult !== "") {

    console.log(`FEATURE: ${feature}\n`);
    console.log(`LANGUAGE: ${language}\n`);
    console.log(`QUERY: ${query}\n`);
    console.log(`TEST RESULT: ${testresult}\n`);

    db.sequelize.query(`SELECT * FROM Result WHERE TestPassId = '${testPass}' AND Template = '${feature}' AND Language = '${language}' AND Output LIKE '%${query}%' AND Result = '${testresult}';`).then(results => {

      results = results[0];

      // Needed To convert the blob object into a string 
      // Otherwise it returns a buffer array object.
      for (var i = 0; i < results.length; i++) {
        results[i].Output = String(results[i].Output);

      }

      req.results = results;
      req.language = language;
      req.testresult = testresult;
      req.testpassid = testPass;
      return next();

    }).catch(function(err) {
      console.log('error: ' + err);
      return err;
    })
  }
};

/************************
 * Function: export_to_excel()
 * Purpose: exports to an excel document with headers
 * Parameters: results = test pass results, testPassId = the ID for the test pass (written into the excel file's name)
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.export_to_excel = function(req, res) {

  let results = req.results;
  let testPassId = req.query.testpassid;

  let fileName = `export-test-pass-id-${testPassId}.xlsx`;
  let datetime = new Date();
  //console.log(datetime);

  res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-disposition', `attachment; filename=${fileName}`);

  // Set options for Streaming large files
  let streamOptions = {
    filename: fileName,
    stream: res, // write to server response
    useStyles: false,
    useSharedStrings: false,
  };

  let workbook = new Excel.stream.xlsx.WorkbookWriter(streamOptions);

  let worksheet = workbook.addWorksheet('Raw_Data', {
    views: [
    {state: 'frozen', ySplit: 1}
    ]
    
    });

  worksheet.columns = [
    { header: 'Test Case Id:', key: 'TestCaseId', width: 12 },
    { header: 'Test Pass Id:', key: 'TestRunId', width: 12 },
    { header: 'Run Date/Time:', key: 'RunDate', width: 10 },
    { header: 'Template:', key: 'Template', width: 10 },
    { header: 'Language:', key: 'Language', width: 10 },
    { header: 'Result:', key: 'Result', width: 10 },
    { header: 'URL:', key: 'URLs', width: 50 },
    { header: 'Scenario:', key: 'Output', width: 100 }
  ];

  async function processExcelExport(results) {
    // map array to promises 
    const promises = results.map((item) => {

      worksheet.addRow({
        TestCaseId: item.TestCaseId,
        TestRunId: item.TestPassId,
        RunDate: item.RunDate,
        Template: item.Template,
        Language: item.Language,
        Result: item.Result,
        URLs: item.URLs,
        Output: item.Output
      }).commit()
    });

    await Promise.all(promises);
    console.log("export operation complete.");
    workbook.commit();

  }

  processExcelExport(results);
  
} // end exports.export_to_excel = function(req, res)




/************************
 * Function: getLangsAndTemps()
 * Purpose: provides a list of languages and templates that are in the test pass (for display in dropdowns on export.ejs)
 * Parameters: testPass = the test pass selected by the user
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.getLangsAndTemps = function(req, res) {

  let testPass = (req.body.testPass);

  db.sequelize.query("SELECT Template, Language FROM TestPass WHERE TestPassID = '" + testPass + "';").then(testPassInfo => {
    let info = testPassInfo[0];
    // console.log(info);

    res.send(info);

  }).catch(function(err) {
    console.log('error: ' + err);
    return err;
  })
};
