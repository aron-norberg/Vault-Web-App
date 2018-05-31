// Invoke 'strict' JavaScript mode
'use strict';

//const db = require('../../config/sequelize');
var mysql = require('mysql');
const Sequelize = require('sequelize');
const async = require('async');
const util = require('util');
const dateFormat = require('dateformat');
var datetime = require('node-datetime');


// Add Notes to result table in database
exports.addNotesToResultTable_DB = function(req, res) {
  //console.log('Hey Waldo, run the addOwnerToDB function!');
  //res.send("hello from waldo");

  // Gets the value from url string using get
  //let locale = req.params.locale;
  let id = req.query.Id;
  let notes = req.query.message;

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
    //console.log("Connected! - " + id);
    //var sql = "SELECT * FROM result WHERE Id = '"+id+"'";

    res.end('working - ' + id + ' - ' + notes + ' --- ' + sql);

  });*/


  // Add Notes to result table in database
  db.connect(function(err) {
    if (err) throw err;
    //console.log("Connected!");

    db.query("SELECT Notes FROM Result WHERE Id = '"+id+"'", function (err, row) {
      if (err) throw err;
      //console.log(row);

      if (row[0].Notes) {
        var sql = "UPDATE Result SET Notes = CONCAT(Notes, '\n\n', '"+notes+"') WHERE Id = '"+id+"'";
      }
      else {
        var sql = "UPDATE Result SET Notes = '"+notes+"' WHERE Id = '"+id+"'";
        
      } //end if/else

      db.query(sql, function (err, result) {
        if (err) throw err;
        //console.log("1 record Notes inserted");

      }); //end db.query(sql, function (err, result)

    }); // end db.query("SELECT Notes FROM result WHERE Id = '"+id+"'", function (err, row)

  }); // end db.connect(function(err)

    res.redirect('back'); // used to redirect page back on submit

}; // end exports.addOwnerToDB = function(req, res)


// Add Owner to result table in database
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


// Removes empty Gherkin ids from testcase table in database
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
