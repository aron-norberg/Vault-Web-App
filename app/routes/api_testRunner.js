'use strict';

var mysql = require('mysql');
const db = require('../../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Excel = require('exceljs');
const streamify = require('stream-array');
const os = require('os');
const async = require('async');
const dateFormat = require('dateformat');
const util = require('util');
const moment = require('moment');

// Read Excel File Data
const fs = require('fs');
const path = require('path');

//### NEED to find out correct path
let rootPath = path.normalize(__dirname + '../../../');
rootPath = rootPath + 'temp_directory';


/************************
 * Function: getTestCases()
 * Purpose: Gets a list of test cases run against the selected template page
 * Parameters:
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.getTestCases = function(req, res) {

  // let jsonObject = JSON.stringify(req.body);
  let template = (req.body[0].theTemplate);
  //console.log("hello i have a template " + template);  // f8

  if (template != "all") {

    db.sequelize.query("select * from Template where Id like '" + template + "';").then(templates => {
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

  } else {

    db.sequelize.query("select * from TestCase;").then(cases => {
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
  }
};


/************************
 * Function: getTestCasesAndUrlsFromDB()                                    <---------------- delete?
 * Purpose: Gets a list of test cases and URLs
 * Parameters:
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

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


/************************
 * Function: checkProcessByName()
 * Purpose: Check to see if a process is running, Uses promises and a call to system, PS grep "keyword to check if running"
 * Parameters: ProcessName ie. java, nameToMatch ie. selenium
 * Author: James Sandoval, Aron T Norberg
 * Date: April 2018
 ************************/

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

/************************
 * Function: checkProcessByPID()
 * Purpose: Check to see if a process is running By using the Process Id
 * Parameters: PID
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function checkProcessByPID(pid, item) {

  //console.log("the pid in question is " + pid);

  return new Promise(function(resolve, reject) {

    let processList = new Array();

    //return new Promise(function(resolve, reject) {
    const { spawn } = require('child_process');
    const ps = spawn('ps', [`${pid}`]);

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
        //console.log("pid finds a match.");  
        resolve(item);

      } else {
        //console.log("pid does not find a match.")
        reject("fail");
      }

      ps.stdin.end();

    });
  })
}


/************************
 * Function: startProcess()
 * Purpose: Start Either Selenium or Phantomjs
 * Parameters:program to start
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

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


/************************
 * Function: checkEnvironmentSettings()
 * Purpose: Check to see if selenium or Phantom js Is running 
 * Parameters:None
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

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

      if (process.platform == "darwin" || process.plaform == "linux") {

        console.log("selenium is not running...starting");

        startProcess(process1);
      } else {

        console.log("selenium is not running...you need to start it manually");

      }

    });

    // Check to see if Phantom js running 

    checkProcessByName(keyword2, process2).then(response => {

      console.log("process: " + process2 + " is running");

    }).catch(function(response) {

      if (process.platform == "darwin" || process.plaform == "linux") {

        console.log("phantomjs is not running...starting");

        startProcess(process1);
      } else {

        console.log("phantomjs is not running...you need to start it manually");

      }

    });

    if (statusObject.phantom == "off" && statusObject.selenium == "off") {

      reject(statusObject);

    } else {

      resolve(statusObject);
    }
  })

};

/************************
 * Function: getTestProcessesFromDB()
 * Purpose: Get Test status information
 * Parameters:None
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function getTestProcessesFromDB() {

  return new Promise(function(resolve, reject) {

    // Get the Current Date/Time
    let CurrentDateStamp = moment().format();
    let cutOffTime = moment(CurrentDateStamp).add(10, 'minutes');

    console.log("The current time is " + CurrentDateStamp);
    console.log("The cut off time is " + cutOffTime);

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


/************************
 * Function: checkTestProcessWithSystemPS()
 * Purpose: Check to see if tests are still running
 * Parameters:test pass object
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function checkTestProcessWithSystemPS(testPassTableResults) {

  // Loop through testPassTableResults
  return new Promise(function(resolve, reject) {

    let statusResults = new Array();

    async.each(testPassTableResults, function(item, callback, self) {

      // Modify to get correct process and count

      let pid = item.Note.replace(/PID: /, '');
      pid = pid.substring(0, pid.indexOf(':'));

      console.log("The pid is " + pid);

      if (!pid) {

        // If pid is null, check the date value 
        let CurrentDateStamp = moment().format();
        let cutOffTime = moment(CurrentDateStamp).add(10, 'minutes');

        if (item.EndTime <= cutOffTime) {
          // Add to the list
          let statusObject = new Object();

          statusObject.id = successItem.TestPassId;
          statusObject.status = "complete";
          statusObject.runDate = successItem.RunDate;
          statusResults.push(statusObject);

          callback();
        }

        callback();
      }

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

        resolve(statusResults);
      }

    });
  })
}
/************************
 * Function: getOverview()
 * Purpose: render the Run Tests page
 * Parameters:
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

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
            console.log(statusResults[i]);
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
            urls: theURLs,
            user: req.user
          });
        });
      });
    });
  })
};

/************************
 * Function: addToSchedule()
 * Purpose: used for getting the schedule selected from the Test-runner page and adding the selection to the database
 * Parameters: testParamsJSON = the selections made on the Run Tests page, day = the day chosen on the Test Scheduler modal
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: June 2018
 ************************/
exports.addToSchedule = function(req, res) {

  let jsonTestparams = JSON.stringify(req.body);
  let testParams = JSON.parse(jsonTestparams);
  let schedule = "";

  //  testParameters = 
  //   "languages": langs,
  //   "features": template,
  //   "TestCaseSelections": tcs,
  //   "Urls": urlChoices,
  //   "domain": domain,
  //   "description": description

  if (isNaN(testParams.day)){
    schedule = "0 0 " +testParams.time + " ? * " + testParams.day +" *";
  }
  else {
    schedule = "0 0 " +testParams.time + " " + testParams.day +" * ? *";
  }  

  db.sequelize.query("INSERT INTO TestSchedule (Languages, Template, TestCaseIds, URLsCount, Domain, Description, Schedule) VALUES ('"+testParams.languages+"','"+ testParams.features + "','"+testParams.TestCaseSelections + "','"+testParams.Urls + "','"+testParams.domain + "','"+ testParams.description+ "','"+schedule + "');", function (err, row) {
     if (err) throw err;

  }).catch(function(err) {
    console.log('error: ' + err);
    return err;
  })

  console.log("sent information to the TestSchedule table");

  res.send("success"); // used to redirect page back on submit

}

