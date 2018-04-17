'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Excel = require('exceljs');
const streamify = require('stream-array');
const os = require('os');
const async = require('async');
const dateFormat = require('dateformat');

// Read Excel File Data
const fs = require('fs');
const path = require('path');

//### NEED to find out correct path
let rootPath = path.normalize(__dirname + '../../../');
rootPath = rootPath + 'temp_directory';

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

function checkProcessByPID(pid) {

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
      console.log(`grep stderr: ${data}`);
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
        resolve("success");

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

  let statusResults = [];

  // Loop through testPassTableResults
  return new Promise(function(resolve, reject) {

    async.each(testPassTableResults, function(item, callback) {

      let pid = item.Note.replace(/PID: /, '');

      checkProcessByPID(pid).then(success => {

        //console.log("This is successful");

        statusResults.push(success);
        callback();

      }).catch(function(fail) {

        //console.log("This is not successful");

        statusResults.push(fail);
        callback();

      })

    }, function(err) {
      // if any of the file processing produced an error, err would equal that error
      if (err) {

        reject("error checking pids");

      } else {

        resolve(statusResults);
      }
    });
  })
}

exports.getOverview = function(req, res) {

	      res.render('dropdownTestRunner', {
          title: 'Run Tests',
          user: req.user.firstname

        });
	}


/*
exports.getOverview = function(req, res) {

  checkEnvironmentSettings().then(environmentStatus => {

    getTestProcessesFromDB().then(results => {

      let statusTableResults = results.statusResults;
      let testPassTableResults = results.testPassResults;

      checkTestProcessWithSystemPS(testPassTableResults).then(statusResults => {

        console.log("The size of status Results is " + statusResults.length);

        for (var i = statusResults.length - 1; i >= 0; i--) {
        	console.log(statusResults[i]);
        }

        res.render('dropdownTestRunner', {
          title: 'Run Tests',
          driverStatus: environmentStatus,
          user: req.user.firstname,
          status: statusTableResults,
          testPass: testPassTableResults

        });
      });
    });
  })
};

*/

