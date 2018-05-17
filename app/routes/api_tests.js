// test Status

'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');
const async = require('async');
const util = require('util');
const dateFormat = require('dateformat');

const spawn = require('child_process').spawn;
// Read Excel File Data
const fs = require('fs');
var mkdirp = require('mkdirp');
const path = require('path');
//### NEED to find out correct path
let rootPath = path.normalize(__dirname + '../../../');
rootPath = rootPath + '/behat_projects/master_tests';
let behat_path = rootPath;

function broadcastData(req, res, dataString) {

  const io = req.app.get('socketio');

  io.on('connection', function(client) {

    console.log('Connection to client established');

    //client.emit('message', "hello frank");

    // Success!  Now listen to messages to be received
    client.on('connection', function(event) {
      console.log('Received message from client!', event);
    });

    client.on('disconnect', function() {
      console.log('Server has disconnected');
    });
  });

  let testId = "";

  if (dataString.search(/The test pass/) !== -1) {

    testId = dataString.match(/'([^']+)'/)[1]

    //console.log("This should only be for the test pass id");
    //console.log(dataString);
    //io.sockets.emit('message', dataString);
  }

  if (testId) {

    // Only emit test start id
    // and test end id
    io.sockets.emit('test-run', testId);
    console.log(testId);
  }

}


exports.getTestStatus = function(req, res) {

  async.parallel({

    status: function(cb) {

      db.sequelize.query(`SELECT * FROM Status WHERE EndTime > "1971" ORDER BY TestPassId DESC;`).then(status => {

        status = status[0];

        for (var i = 0; i < status.length; i++) {

          //results[i].Output = String(results[i].Output);
          status[i].RunDate = dateFormat(status[i].RunDate, "mmm dS, yyyy, h:MM:ss TT"); // + " PST";

          status[i].StartTime = dateFormat(status[i].StartTime, "mmm dS, yyyy, h:MM:ss TT"); // + " PST";

          if (status[i].EndTime) {
            status[i].EndTime = dateFormat(status[i].EndTime, "mmm dS, yyyy, h:MM:ss TT"); // + " PST";
          } else {

            status[i].EndTime = "TERMINATED";
          }
        }

        cb(null, status);
      });
    },
    testPass: function(cb) {

      db.TestPass.findAll().then(testPass => {

        cb(null, testPass);
      });
    }

  }, (err, results) => {

    res.render('test_status', {

      status: results.status,
      testPass: results.testPass

    })

  });
}

exports.getProcesses = function(req, res) {

  // Option all 
  let ps = spawn('ps', ['a']);

  let grep = spawn('grep', ['start']);

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

  grep.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  grep.stderr.on('data', (data) => {
    console.log(`grep stderr: ${data}`);
  });

  grep.on('close', (code) => {
    if (code !== 0) {
      console.log(`grep process exited with code ${code}`);
    }
  });

  res.send("process complete.");

}

exports.postTest = function(req, res, next) {

  let now = new Date();
  let jsonTestparams = JSON.stringify(req.body);


  req.testParams = jsonTestparams;

  //console.log("This is the json object you are reading:\n");

  // Get time down to millisecond, preventing duplication.

  let currentTime = dateFormat(now, "ddddmmmmdSyyyyhMMsslTT");

  let directory = behat_path + "/tmp/" + currentTime;

  fs.mkdir(directory, function(err) {
    if (err) {
      console.log('failed to create directory', err);
    } else {
      fs.writeFile(directory + "/temp.json", jsonTestparams, function(err) {
        if (err) {
          console.log('error writing file', err);
        } else {

          let jsonPath = directory + "/temp.json";

          console.log(jsonPath);

          console.log('writing file succeeded');

          req.jsonpath = jsonPath;

          next();
        }
      });
    }
  });
}

function getTotalNumberOfTestCases(testParameterObject) {

  return new Promise((resolve, reject) => {
    let count = 0;
    let finalCount = 0;
    let limit = 0;

    async function getCount(testParameterObject) {

      // map array to promises 
      const promises = testParameterObject.languages.map((languageSelection) => {
        // evaulate if features is f4, if so, limit to 100
        if (testParameterObject.features == "F4" && testParameterObject.Urls == "all" || (testParameterObject.features == "F4" && testParameterObject.Urls > 100)) {

          limit = 100;

          // convert string to large number if all
        } else if (testParameterObject.Urls == "all") {
          // 10 million/ should never come close to or exceed this value
          limit = 10000000;
        }

        // evaulate if language is all

        if (languageSelection == "all") {
          languageSelection = "%";
        }
        // evaulate if feature is all

        if (testParameterObject.features == "all") {
          testParameterObject.features = "%";
        }

        return db.sequelize.query(`select count(*) from (select Url from Urls where language like '${languageSelection}' and TemplateId like '${testParameterObject.features}' limit 10000000) As a;`).then(count => {
          count = count[0][0]['count(*)'];
          return count

        }).catch((err) => {
          console.log("error querying test case count");
          console.log('error: ' + err);
        })
      });

      await Promise.all(promises).then(count => {
        // Count is an array of results
        // sum up all results to obtain answers
        for (let i = 0; i < count.length; i++) {
          finalCount += count[i];
        }

        // multiple final count by test Cases 
        finalCount = finalCount * testParameterObject.TestCaseSelections.length;
        console.log("The final count is " + finalCount);

      })

      if (finalCount) {
        resolve(finalCount)

      } else {

        reject(finalCount);
      }
    }

    getCount(testParameterObject);

  });
}


exports.startProcess = function(req, res) {

  let jsonPath = req.jsonpath;

  // read json data and get test parameters

  // Expiremental Spawn Process Behavior 
  let options = {
    cwd: rootPath,
    detached: true
  }

  let spawn = require('child_process').spawn,
    script = spawn('perl', ['start.pl', 'json', jsonPath], options);

  console.log("The pid is " + script.pid);

  // get output 
  script.stdout.on('data', (data) => {
    //script.stdin.write(data);
    let dataString = String(data)
    console.log(dataString);
    broadcastData(req, res, dataString);

  });

  script.stderr.on('data', (data) => {
    console.log(`ps stderr: ${data}`);
  });

  script.on('close', (code) => {
    if (code !== 0) {

      console.log(`start Script process exited with code ${code}`);
    }
    script.stdin.end();
  });

  // query db for number of tests to run based on user selection
  getTotalNumberOfTestCases(JSON.parse(req.testParams)).then(count => {

    console.log("this is the actual count of test cases to run: " + count);

    res.sendStatus(200);

  }).catch((err) => {

    console.log('error: ' + err);
    return err;

  })
}


exports.stopTest = function(req, res) {

  let id = req.query.testid;

  // Query Test Pass by id, get the PID
  db.sequelize.query(`SELECT Note from TestPass where TestPassId = "${id}"`).then(pid => {

    pid = pid[0][0].Note;
    // Remove extraneous Text
    pid = pid.replace(/PID: /i, '');

    /*

    // Execute System command to stop the process by PID

    let spawn = require('child_process').spawn,
      script = spawn('kill', ['-9', pid]);

    // get output 
    script.stdout.on('data', (data) => {
      //script.stdin.write(data);
      let dataString = String(data)
      console.log(dataString);
    });

    script.stderr.on('data', (data) => {
      console.log(`ps stderr: ${data}`);
    });

    script.on('close', (code) => {
      if (code !== 0) {
        console.log(`stop Script process exited with code ${code}`);
      }
      script.stdin.end();
    });

    console.log(" I should be killing the process.")

    */

    getTotalNumberOfTestCases(req.testParams).then(testPassData => {

      res.sendStatus(200);

    }).catch((err) => {

      console.log('error: ' + err);
      return err;

    })

    return null;

  }).catch((err) => {
    console.log('error: ' + err);
    return err;

  });
}
