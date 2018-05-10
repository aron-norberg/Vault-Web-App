module.exports = function(app) {
const dashboard = require('../controllers/dashboard.server.controller');
const exec = require('child_process').exec;

app.get('/dashboard', dashboard.render);
app.get('/test', dashboard.testScript);

};

/*

var yourscript = exec('sh hi.sh',(error, stdout, stderr) => {
	console.log(`${stdout}`);
    console.log(`${stderr}`);
    if (error !== null) {
    	console.log(`exec error: ${error}`);	
    }
});

*/
