/* We are not using Controllers in the Vault app - instead of using Controllers we 
condensed the code and have Route informtion in the express.js and Controller
code in the Routes file. */



// Invoke 'strict' JavaScript mode

/*'use strict';
var db = require('../../config/sequelize');
var Sequelize = require('sequelize');
const Op = Sequelize.Op;


var length = 0;


//List of Articles
 

exports.render = function(req, res) {
	db.results.findAll().then(results => {
  		//console.log(results)

  		var length = results.length;

  		res.render('results', {
  			length: length,
  			results: results,
			title: 'This is results page'
		});
	}).catch(function(err){
    	console.log('error: ' + err);
        return res.render('error', {
        	title: "Database Query Error.",
       		error: err,
       		status: 500
        });
    });
}
*/
