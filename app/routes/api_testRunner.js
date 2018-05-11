'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Excel = require('exceljs');
const streamify = require('stream-array');
const os = require('os');
const async = require('async');
const dateFormat = require('dateformat');
const util = require('util');

// Read Excel File Data
const fs = require('fs');
const path = require('path');

//### NEED to find out correct path
let rootPath = path.normalize(__dirname + '../../../');
rootPath = rootPath + 'temp_directory';

exports.getTestCases = function(req, res) {

  // let jsonObject = JSON.stringify(req.body);
  let template = (req.body[0].theTemplate);
  console.log("hello i have a template " + template);  // f8

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

/*######################################
##
## Check to see if a process is running 
## Uses promises and a call to system 
## PS grep "keyword to check if running"
## Parameters: 
##
## 1. ProcessName ie. java
## 2. nameToMatch ie. selenium
##
####################################### */

function checkProcessByName(processName, nameToMatch) {
  return new Promise(function(resolve, reject) {
    let processList = new Array();

    const { spawn } = require('child_process');
    const ps = spawn('ps', ['ax']);
    const grep = spawn('grep', [processName]);

    ps.stdout.on('data', (data) => {
      grep.stdin.write(data);
    });

    ps.stderr.on('data', (data) => {

      console.log(`ps stderr: ${data}`);
    });

    ps.on('close', (code) => {
      if (code !== 0) {
        console.log(`ps process exited with code ${code}`);
      }
      grep.stdin.end();
    });

    // get output 
    grep.stdout.on('data', (data) => {
      let output = data.toString();
      processList.push(output);

    });

    grep.stderr.on('data', (data) => {
      console.log(`grep stderr: ${data}`);
    });

    grep.on('close', (code) => {

      let matchFlag = 0;

      for (var i = 0; i < processList.length; i++) {

        if (processList[i].includes(nameToMatch)) {
          matchFlag += 1;
        }
      }
      if (matchFlag) {
        //console.log("We really have a match");  
        resolve("success");
      } else {
        reject("fail");
      }

    });
  })
}

/*######################################
##
## Check to see if a process is running
## By using the Process Id
## 
## Parameters: PID
##
####################################### */

function checkProcessByPID(pid, item) {

  return new Promise(function(resolve, reject) {

    let processList = new Array();

    //return new Promise(function(resolve, reject) {
    const { spawn } = require('child_process');
    const ps = spawn('ps', [`p ${pid}`]);

    // get output 
    ps.stdout.on('data', (data) => {

      let output = data.toString();

      processList.push(output);

    });

    ps.stderr.on('data', (data) => {
      console.log(`ps stderr: ${data}`);
    });

    ps.on('close', (code) => {

      let matchFlag = 0;

      for (let i = 0; i < processList.length; i++) {

        if (processList[i].includes("perl")) {
          matchFlag += 1;
        }
      }

      if (matchFlag) {
        //console.log("We really have a match");  
        resolve(item);

      } else {

        reject("fail");
      }

      ps.stdin.end();

    });
  })
}

/*######################################
##
## Start Either Selenium or Phantomjs
## 
## Parameters: program to start
##
####################################### */

function startProcess(processToStart) {

  //
  // Startup process to start if not running
  //

  if (processToStart === "selenium") {
    let spawn = require('child_process').spawn,
      script = spawn('selenium-standalone', ['start'], { detached: true });

    script.stderr.on('data', (data) => {
      console.log(`ps stderr: ${data}`);
    });

    script.on('close', (code) => {
      if (code !== 0) {
        console.log(`start Script process exited with code ${code}`);
      }
      script.stdin.end();
    });

    //
    // Startup phantom js if not running
    //
  } else if (processToStart === "phantomjs") {

    let spawn = require('child_process').spawn,
      script = spawn('phantomjs', ['--webdriver=8643'], { detached: true });

    script.stderr.on('data', (data) => {
      console.log(`ps stderr: ${data}`);
    });

    script.on('close', (code) => {
      if (code !== 0) {
        console.log(`start Script process exited with code ${code}`);
      }
      script.stdin.end();
    });
  }
}

/*######################################
##
## Check to see if selenium or Phantom js 
## Is running  
##
## Parameters: None
##
####################################### */

function checkEnvironmentSettings() {

  return new Promise(function(resolve, reject) {

    let process1 = "selenium";
    let keyword1 = "java";
    let process2 = "phantomjs";
    let keyword2 = "phantom";

    let statusObject = {
      phantom: "on",
      selenium: "on"
    };

    // Check to see if Selenium is Running
    // Start Selenium if not running  

    checkProcessByName(keyword1, process1).then(response => {

      console.log("process: " + process1 + " is running");

    }).catch(function(response) {

      console.log("selenium is not running...starting");

      startProcess(process1);

    });

    // Check to see if Phantom js running 

    checkProcessByName(keyword2, process2).then(response => {

      console.log("process: " + process2 + " is running");

    }).catch(function(response) {

      console.log("phantomjs is not running...starting");

      startProcess(process2);

    });

    if (statusObject.phantom == "off" && statusObject.selenium == "off") {

      reject(statusObject);

    } else {

      resolve(statusObject);
    }
  })

};

/*######################################
##
## Get Test status information
##
## Parameters: None
##
####################################### */

function getTestProcessesFromDB() {

  return new Promise(function(resolve, reject) {

    async.parallel({

      statusResults: function(cb) {
        db.sequelize.query(`select * from Status where EndTime like '1970-01-02 00:00:00'`).then(statusResults => {

          statusResults = statusResults[0];

          // Convert Result back to string
          for (let i = statusResults.length - 1; i >= 0; i--) {
            statusResults[i].RunDate = dateFormat(statusResults[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
            statusResults[i].StartTime = dateFormat(statusResults[i].StartTime, "mm-dd-yy h:MM:ss TT"); // + " PST";
            statusResults[i].EndTime = dateFormat(statusResults[i].EndTime, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, statusResults);
        });
      },
      testPassResults: function(cb) {
        db.sequelize.query(`select * from TestPass where Note like '%PID%';`).then(testPassData => {

          testPassData = testPassData[0];

          for (let i = testPassData.length - 1; i >= 0; i--) {

            testPassData[i].RunDate = dateFormat(testPassData[i].RunDate, "mm-dd-yy h:MM:ss TT"); // + " PST";
          }

          cb(null, testPassData);

        });
      }
    }, (err, results) => {

      if (results) {

        resolve(results);

      } else {

        reject(err);
      }

    });
  });
};

/*######################################
##
## Check to see if tests are still running
##
## Parameters: test pass object
##
####################################### */

function checkTestProcessWithSystemPS(testPassTableResults) {

  // Loop through testPassTableResults
  return new Promise(function(resolve, reject) {

    let statusResults = new Array();

    async.each(testPassTableResults, function(item, callback, self) {

      let pid = item.Note.replace(/PID: /, '');

      checkProcessByPID(pid, item).then(successItem => {

        let statusObject = new Object();

        statusObject.id = successItem.TestPassId;
        statusObject.status = "success";
        statusObject.runDate = successItem.RunDate;

        statusResults.push(statusObject);

        callback();

      }).catch(function(failItem) {

        let statusObject = new Object();

        statusObject.id = failItem.TestPassId;
        statusObject.status = "fail";
        statusObject.runDate = failItem.RunDate;

        statusResults.push("fail");
        callback();

      })

    }, function(err) {

      if (err) {


        reject("error checking pids");

      } else {

        //console.log("this is the end result of the async function::" + statusResults.length)

        /*
        for (let i = 0; i < statusResults.length; i++) {

          console.log(util.inspect(statusResults[i], false, null))

        }

        */

        resolve(statusResults);
      }
    });
  })
}

/*

exports.getOverview = function(req, res) {

        res.render('dropdownTestRunner', {
          title: 'Run Tests',
          user: req.user.firstname

        });
  }

*/

exports.getOverview = function(req, res) {

  getTestCasesAndUrlsFromDB().then(tcsAndUrls => {
    checkEnvironmentSettings().then(environmentStatus => {
      getTestProcessesFromDB().then(results => {

        let theTCs = tcsAndUrls.testCases;
        let theURLs = tcsAndUrls.allTheUrls;

        for (var i = 1; i < theTCs.length; i++) {
          theTCs[i].HashValue = JSON.stringify(theTCs[i].HashValue);

        }

        let statusTableResults = results.statusResults;
        let testPassTableResults = results.testPassResults;

        checkTestProcessWithSystemPS(testPassTableResults).then(statusResults => {

          for (var i = 0; i < statusResults.length; i++) {
            //console.log(statusResults[i]);
          }

          // { id: 65, status: 'success' }

          for (var i = statusTableResults.length - 1; i >= 0; i--) {
            //console.log(statusTableResults[i]);
          }

          // TestPassId: 65,
          // RunDate: '04-19-18 4:35:14 PM',
          // StartTime: '04-19-18 4:35:14 PM',
          // EndTime: '01-02-70 12:00:00 AM' }


          for (var i = testPassTableResults.length - 1; i >= 0; i--) {
            //console.log(testPassTableResults[i]);
          }

          /*

            TestPassId: 40,
            Template: 'F1',
            Language: 'en-us',
            TestCases: 'F1 - all',
            RunDate: '04-19-18 3:44:55 PM',
            UrlIds: buffer string,
            Description: buffer string,
            Reliable: null,
            Note: 'PID: 15827' }

          */

          //req.flash('message', 'test flash!');

          //console.log(req.flash('message'));  // [ 'test flash!' ]

          res.render('testRunner', {
            title: 'Run Tests',
            driverStatus: environmentStatus,
            user: req.user.firstname,
            liveStatus: statusResults,
            status: statusTableResults,
            testPass: testPassTableResults,
            currentUrl: req.url,
            tcs: theTCs,
            urls: theURLs
          });
        });
      });
    });
  })
};
