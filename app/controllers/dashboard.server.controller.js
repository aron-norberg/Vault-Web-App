
// Invoke 'strict' JavaScript mode
'use strict';

var fs = require('fs');
var path = require('path');
var rootPath = path.normalize(__dirname + '/../..');
var rootPath = rootPath + '/test_scripts';
const exec = require('child_process').exec;

// Create a new 'render' controller method
exports.render = function(req, res) {
	res.render('dashboard', {
		title: 'Dashboard',
	});
};

// Create a new 'render' controller method
exports.testScript = function(req, res) {
	fs.readdir(rootPath, function(err, items) {
		exec(rootPath+'/'+items[0],(error, stdout, stderr) => {
            var output = `${stdout}`;
            console.log(output);
			res.render('dashboard', {
				title: 'testScript',
				bash_dir: rootPath, 
				content: items[0],
				output: output,
			});
		});

	});
};

/*


// Create a new 'render' controller method
exports.testScript = function(req, res) {
	fs.readdir(rootPath, function(err, items) {
		exec('sh hi.sh',(error, stdout, stderr) => {
            console.log(`${stdout}`);
            console.log(`${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
			res.render('dashboard', {
				title: 'testScript',
				bash_dir: rootPath, 
				contents: items[0],
			});
		});

	});
};

*/
