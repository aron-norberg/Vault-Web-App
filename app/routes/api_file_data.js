'use strict';
var express = require('express');
var router = express.Router();

// Socket Expiremntation

var fs = require('fs');
var path = require('path');
var rootPath = path.normalize(__dirname + '../../..');
var rootPath = rootPath + '/behat_projects/master_tests';
const spawn = require('child_process').spawn;

exports.getStatus = function(req, res, next){

res.send("working process.");




}

// Get the file directory contents with the features you intend on running
exports.getAvailableTests = function(req, res, next) {

  console.log(rootPath);

  fs.readdir(rootPath, function(err, items) {

    for (var i = items.length - 1; i >= 0; i--) {

      if (!items[i].match(/behat_run/)) {

        items[i]
        items.splice(i, 1);
      }
      else{
        
      }
    }

    req.shellScripts = items;

    next();
  });

};

exports.getProcesses = function(req, res, next) {

  var processes = [];
  var status = [];

  var items = req.shellScripts;

  var scriptData = {
    status: status,
    scripts: items,
  }


  var outputString;

  // Print list of scripts available

  /*
  for (var i = 0; i < scriptData.scripts.length; i++) {
    console.log(scriptData.scripts[i]);
  }

  */

  const ps = spawn('ps', ['-o command']);

  // Change to search for behat_run
  const grep = spawn('grep', ['behat_run']);

  ps.stdout.on('data', (data) => {
    grep.stdin.write(data);
  });

  ps.stderr.on('data', (data) => {
    //console.log(`ps stderr: ${data}`);
  });

  ps.on('close', (code) => {
    if (code !== 0) {
      console.log(`ps process exited with code ${code}`);
    }
    grep.stdin.end();
  });

  grep.stdout.on('data', (data) => {

    outputString = data.toString();
    processes = outputString.split("\n");

  });

  grep.stderr.on('data', (data) => {
    console.log(`grep stderr: ${data}`);
  });

  grep.on('close', (code) => {
    if (code !== 0) {
      console.log(`grep process exited with code ${code}`);
    }

    for (var i = 0; i < scriptData.scripts.length; i++) {
      if (processes.includes("sh " + scriptData.scripts[i])) {

        console.log("scripts: " + scriptData.scripts[i]);

        scriptData.status.push("running");

      } else {
        scriptData.status.push("stopped");

      }

      // clean file script names for display and query purposes
      scriptData.scripts[i] = scriptData.scripts[i].replace("behat_run_", "");
      scriptData.scripts[i] = scriptData.scripts[i].replace(".sh", "");
      scriptData.scripts[i] = scriptData.scripts[i].replace("f", "");

    }

    scriptData.scripts = scriptData.scripts.sort((a, b) => a - b)

    for(var i = 0;i < scriptData.scripts.length;i++){

      scriptData.scripts[i] = "f" + scriptData.scripts[i];
    }

    console.log("processes: \n");

    for (var i = 0; i < processes.length; i++) {

      console.log("process: " + processes[i]);

    }

  
    res.render('test_runner', {
      title: 'Test Runner',
      scripts: scriptData.scripts,
      status: scriptData.status,
      processes: processes

    })
  });
}


exports.runTest = function(req, res) {

  console.log(req.params.script)
  // Process JSON Arguments
  var shell_script = req.params.script;
  shell_script = "behat_run_" + shell_script + ".sh";

  var options = {
    cwd: rootPath
  }

  var spawn = require('child_process').spawn,
    script = spawn('sh', [shell_script], options);

  script.stdout.on('data', function(data) {
    console.log('stdout: ' + data.toString());
  });

  script.stderr.on('data', function(data) {
    console.log('stderr: ' + data.toString());
  });

  script.on('exit', function(code) {
    console.log('child process exited with code ' + code.toString());
  });

  res.redirect('/test-runner/');

  /*
    // Listen on socket
    io.on('connection', function(socket) {
      socket.on('output', function() {

        script.stdout.on('data', function(data) {
          var msg = data.toString();
          console.log(msg);
          socket.broadcast.emit('chat message', msg);
        });

        script.stderr.on('data', function(data) {
          var msg = data.toString();
          console.log(msg);
          socket.broadcast.emit('chat message', msg);
        });

        script.on('exit', function(code) {
          var msg = code.toString();
          console.log(msg);
          socket.broadcast.emit('chat message', msg);
        });
      });
    });

    */
};




/*

##
## Example on Getting the pid
## 

/*

const { spawn } = require('child_process');
const grep = spawn('grep', ['ssh']);

console.log(`Spawned child pid: ${grep.pid}`);
grep.stdin.end();

*/
