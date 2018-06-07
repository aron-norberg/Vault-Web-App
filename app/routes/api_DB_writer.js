// Invoke 'strict' JavaScript mode
'use strict';

//const db = require('../../config/sequelize');
var mysql = require('mysql');
const Sequelize = require('sequelize');
const async = require('async');
const util = require('util');
const dateFormat = require('dateformat');
var datetime = require('node-datetime');


/************************
 * Function: addNotesToResultTable_DB()
 * Purpose: Add Notes to result table in database
 * Parameters: id = the test result id (autoincremented in the database), notes = the text entered by the user on the Test Results page
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.addNotesToResultTable_DB = function(req, res) {
  //console.log('Hey Waldo, run the addOwnerToDB function!');
  //res.send("hello from waldo");

  // Gets the value from url string using get
  let id = req.query.Id;
  let notes = req.query.message;
  let owner = req.query.users;
  let resolveCkBox = req.query.resolved;

  // used to escape single quotes and apostrophe's
  notes = notes.replace(/'/g, '"');

  var db = mysql.createConnection({
    host: "localhost",
    port: "3306",
    dialect: 'mysql',
    user: "flukeqa",
    password: "H0lidayApples",
    database: "test"
  });


  // This script is used for testing variables
  /*db.connect(function(err) {
    if (err) throw err;
    console.log("Connected! - " + id);
    var sql = "SELECT * FROM result WHERE Id = '"+id+"'";

    res.end('ID: ' +id+ ' Note: ' +notes+ ' Checkbox: ' +resolve+ ' Mysql statement: ' +sql);

  });*/


  // Add Notes to result table in database
  db.connect(function(err) {
    if (err) throw err;
    //console.log("Connected!");

    db.query("SELECT Notes FROM Result WHERE Id = '"+id+"'", function (err, row) {
      if (err) throw err;
      //console.log(row);

      if (row[0].Notes) {
        var sql = "UPDATE Result SET Notes = CONCAT(Notes, '\n\n', '"+notes+"', ' - ', '"+owner+"') WHERE Id = '"+id+"'";

        if (resolveCkBox == 'RESOLVED') {
          //var sql = "UPDATE Result SET Notes = CONCAT(Notes, '\n\n', '"+notes+"', '\n', '"+resolveCkBox+"', '-', CURRENT_TIMESTAMP(), '\n', '"+owner+"') WHERE Id = '"+id+"'";
          //var sql = "UPDATE Result SET Notes = CONCAT(Notes, '\n\n', '"+notes+"', '\n', '"+resolveCkBox+"', '-', CURRENT_DATE(), '\n', '"+owner+"') WHERE Id = '"+id+"'";
          var sql = "UPDATE Result SET Notes = CONCAT('"+resolveCkBox+"', '\n\n', Notes, '\n\n', '"+notes+"', ' - ' '"+owner+"', '\n', CURRENT_DATE()) WHERE Id = '"+id+"'";

          var testResultId = id;
          changeOwner(testResultId);

        } // end nested if

      }
      else {
        var sql = "UPDATE Result SET Notes = CONCAT('"+notes+"', ' - ', '"+owner+"') WHERE Id = '"+id+"'";
        
      } //end if/else

      db.query(sql, function (err, result) {
        if (err) throw err;
        //console.log("1 record Notes inserted");

      }); //end db.query(sql, function (err, result)

    }); // end db.query("SELECT Notes FROM result WHERE Id = '"+id+"'", function (err, row)

  }); // end db.connect(function(err)

    res.redirect('back'); // used to redirect page back on submit

}; // end exports.addOwnerToDB = function(req, res)



/************************
 * Function: changeOwner(testResultId)
 * Purpose: Queries the result table and updates the Owner column with a new value 'Resolved'
 * Parameters: testResultId = id from the test result being updated
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: June 2018
 ************************/

function changeOwner(testResultId) {

  var db = mysql.createConnection({
    host: "localhost",
    port: "3306",
    dialect: 'mysql',
    user: "flukeqa",
    password: "H0lidayApples",
    database: "test"
  });

  var id = testResultId;

  // Change Owner value to 'Resolved' in database
  db.connect(function(err) {
    if (err) throw err;
    //console.log("Connected!");

    db.query("SELECT Owner FROM Result WHERE Id = '"+id+"'", function (err, row) {
      if (err) throw err;
      console.log(row);

      var sql = "UPDATE Result SET Owner = 'Resolved' WHERE Id = '"+id+"'";

      db.query(sql, function (err, result) {
        if (err) throw err;
        //console.log("1 record Notes inserted");

      }); //end db.query(sql, function (err, result)

    }); // end db.query("SELECT Notes FROM result WHERE Id = '"+id+"'", function (err, row)

  }); // end db.connect(function(err)

} // endc changeOwner()



/************************
 * Function: addOwnerToResultTable_DB()
 * Purpose: Add Owner to result table in database
 * Parameters: id = the test result id (autoincremented in the database), owner = the user selected from a dropdown menu
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.addOwnerToResultTable_DB = function(req, res) {

  // Gets the value from url string using get
  let id = req.query.Id;
  let owner = req.query.users;

  var db = mysql.createConnection({
    host: "localhost",
    port: "3306",
    dialect: 'mysql',
    user: "flukeqa",
    password: "H0lidayApples",
    database: "test"
  });

  db.connect(function(err) {
    if (err) throw err;
    //console.log("Connected!");
    var sql = "UPDATE Result SET Owner = '"+owner+"' WHERE Id = '"+id+"'";

    db.query(sql, function (err, result) {
      if (err) throw err;
      //console.log("1 record Owner inserted");
      res.redirect(req.get('referer')); // resfresh the get url and throws ajax error - However its currently needed for multiple changes

    }); // end db.query(sql, function (err, result)

  }); // end db.connect(function(err)
  
}; // end exports.addOwnerToResultTable_DB = function(req, res)


/************************
 * Function: cleanGherkin_DB()
 * Purpose: Removes empty Gherkin ids from testcase table in database
 * Parameters: 
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.cleanGherkin_DB = function(req, res) {

  // Gets the value from url string using get
  let id = req.query.Id;

  var db = mysql.createConnection({
    host: "localhost",
    port: "3306",
    dialect: 'mysql',
    user: "flukeqa",
    password: "H0lidayApples",
    database: "test"
  });

  db.connect(function(err) {
    if (err) throw err;
    //console.log("Connected!");
    var sql = "DELETE FROM TestCase WHERE testCaseDescription = 'Scenario:'";

    db.query(sql, function (err, result) {
      if (err) throw err;
      
      //console.log('Deleted Row(s):', result.affectedRows);

      //console.log(result);
      //console.log("All empty Gherkin records have been removed");

    }); // end db.query(sql, function (err, result)

  }); // end db.connect(function(err)
  
}; // end exports.cleanGherkin_DB = function(req, res)
