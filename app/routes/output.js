'use strict';
var express = require('express');
var router = express.Router();

// Socket Expiremntation
var io = require('../../bin/www').io;

var fs = require('fs');
var path = require('path');
var rootPath = path.normalize(__dirname + '../../..');
var rootPath = rootPath + '/behat_projects/master_tests';
const spawn = require('child_process').spawn;


// Get the file directory contents with the features you intend on running
router.get('/', function(req, res) {
    res.render('file_output', {
      title: "Live File output"
    })
});


module.exports = router;


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
