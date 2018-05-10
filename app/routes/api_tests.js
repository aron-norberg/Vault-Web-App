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

    io.sockets.emit('message', testId);
    console.log(testId);
  }

}


exports.getTestStatus = function(req, res) {

  async.parallel({

    status: function(cb) {

      db.sequelize.query(`SELECT * from Status ORDER BY TestPassId DESC;`).then(status => {

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


  console.log("This is the json object you are reading:\n");

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

exports.startProcess = function(req, res) {

  let jsonPath = req.jsonpath;

  console.log(jsonPath);

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
    //console.log(dataString);
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

  //* Expiremental Spawn Process Behavior 

  res.sendStatus(200);
  //res.send("start process complete.");

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

    res.sendStatus(200);

    return null;

  }).catch(function(err) {
    console.log('error: ' + err);
    return err;

  });
}
