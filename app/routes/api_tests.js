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

/************************
 * Function: broadcastData()
 * Purpose: determine if a test is running
 * Parameters:
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function broadcastData(req, res, dataString, count, ppid) {

  const io = req.app.get('socketio');

  let testId = "";

  if (dataString.search(/The test pass/) !== -1) {
    testId = dataString.match(/'([^']+)'/)[1]
  }

  if (testId) {

    // Brodcast Test Pass Progress
    // Only initiate if testId contains start-id
    if (testId.includes("start")) {
      broadcastTestProgress(req, testId, count, ppid);
    }

    io.sockets.emit('test-run', testId);
  }
}

/************************
 * Function: broadcastTestProgress()
 * Purpose: determine progress of test pass
 * Parameters:
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/
// Long poll the db 
function broadcastTestProgress(req, testId, count, ppid) {
  const io = req.app.get('socketio');

  testId = testId.replace(/start-id:/g, "");

  let intervalId = setInterval(() => {
    checkIfProcessRunningByPPID(ppid).then(result => {
      // Check that the process is actually running.
      db.sequelize.query(`Select count(*) from Result where TestPassId = ${testId}`).then(resultCount => {

        resultCount = resultCount[0][0]['count(*)'];

        // divide resultCount and count to get the percentage
        let percentage = ((resultCount / count) * 100).toFixed(2);

        let countOutput = `Test Id: ${testId} - percentage: ${percentage} %`;

        console.log(countOutput);

        io.sockets.emit('test-progress', countOutput);

      }).catch((err) => {
        console.log('error: ' + err);
        return err;
      })

    }).catch(err => {
      clearInterval(intervalId);
      console.log(`test-progress complete for test id: ${testId}`);

    })
  }, 1500);
};

/************************
 * Function: checkIfProcessRunningByPPID()     
 * Purpose: 
 * Parameters:
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/
// beta tests...may need to loop process to ensure working as expected.

function checkIfProcessRunningByPPID(ppid) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const ps = spawn('ps', [`${ppid}`]);
    ps.stdout.on('data', (data) => {
      let output = data.toString();
      //console.log(output);
      if (output.includes("perl")) {
        resolve("true");
      } else {
        reject("false");
      }

    });
  });
}

/************************
 * Function: getTestStatus()
 * Purpose: Get the status of all                                <----------------  ?  Is this getting the status of completed tests?
 * Parameters:
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/
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
      testPass: results.testPass,
      user: req.user

    })

  });
}


/************************
 * Function: getProcesses()
 * Purpose: 
 * Parameters:
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/
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

/************************
* Function postFxTest()
* Purpose: Obtain form data from fx test 
* and Initiate a test run
/************************/

exports.postFxTest = function(req, res, next) {

  let now = new Date();
  let testParamIds = req.body.ids;
  let testParamObject = {};
  let testArray = [];
  let count = 0;

  getfxTest(testParamIds);

  function getfxTest(testParamIds) {
    let testNumber = 1;
    var promises = testParamIds.map((id) => { // return array of promises
      return db.sequelize.query(`select * from QaFunctionalUrls where Id = ${id}`).then(data => {
        data = data[0][0];
        //console.log(data);
        let testCases = data.TestCaseId.split(",")

        let object = {
          testNumber: testNumber++,
          id: data.Id,
          url: String(data.URL),
          feature: data.Template,
          testCases: testCases
        }

        count += testCases.length;

        testArray.push(object);

      }, function(err) {
        console.error('error: ' + err);
        return err;
      });
    });

    Promise.all(promises).then(() => {

      testParamObject.tests = testArray;
      testParamObject.testType = "functional";
      testParamObject.languages = "en-us";
      testParamObject.description = "functional Test";
      testParamObject.count = count;

      // As a javascript Object:
      console.log(testParamObject);

      testParamObject = JSON.stringify(testParamObject);

      // As a json object:
      //console.log(testParamObject);

      let currentTime = dateFormat(now, "ddddmmmmdSyyyyhMMsslTT");

      let directory = behat_path + "/tmp/" + currentTime;

          fs.mkdir(directory, function(err) {
      if (err) {
        console.log('failed to create directory', err);

      } else {

        fs.writeFile(directory + "/temp.json", testParamObject, function(err) {

          if (err) {

            console.log('error writing file', err);

          } else {

            let jsonPath = directory + "/temp.json";

            req.jsonpath = jsonPath;

            req.count = count

            // console.log("Remove return statemement to continue to run test. aka start.pl");
            // return false;

            next();
          }
        });
      }
    });
    })
  }

  res.status(200);

}


/************************
 * Function: postTest()
 * Purpose: 
 * Parameters:
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/
exports.postTest = function(req, res, next) {

  let now = new Date();
  let jsonTestparams = JSON.stringify(req.body);

  req.testParams = JSON.parse(jsonTestparams);

  // query db for number of tests to run based on user selection
  getTotalNumberOfTestCases(req.testParams).then(count => {

    // add thet test count to object
    req.testParams.count = count;

    jsonTestparams = JSON.stringify(req.testParams)

    // Get time down to millisecond, preventing duplication...with some degree of certainty
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

            req.jsonpath = jsonPath;

            req.count = count

            next();
          }
        });
      }
    });

  }).catch((err) => {

    console.log('error: ' + err);
    return err;

  })
}

/************************
 * Function: startProcess()
 * Purpose: 
 * Parameters:
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/
exports.startProcess = function(req, res) {

  let jsonPath = req.jsonpath;
  let count = req.count;

  // read json data and get test parameters

  // Expiremental Spawn Process Behavior 
  let options = {
    cwd: rootPath,
    detached: true
  }

  let spawn = require('child_process').spawn,
    script = spawn('perl', ['start.pl', 'json', jsonPath], options);

  console.log("The pid is " + script.pid);

  // obtain the parent pid to verify that the script is running.

  let ppid = script.pid

  // get output 
  script.stdout.on('data', (data) => {
    //script.stdin.write(data);
    let dataString = String(data);
    console.log(dataString);
    broadcastData(req, res, dataString, count, ppid);

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

  let testPassData = {
    "testPassCount": count,
    "jsonStartPath": jsonPath
  }

  testPassData = JSON.stringify(testPassData);
  res.send(testPassData);
}

/************************
 * Function: stopTest()
 * Purpose: 
 * Parameters:
 * Author: James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/
exports.stopTest = function(req, res) {

  let id = req.query.testid;
  let testPassString = req.query.jsonStartPath;

  // Query Test Pass by id, get the PID
  db.sequelize.query(`SELECT Note from TestPass where TestPassId = "${id}"`).then(pid => {

    pid = pid[0][0].Note;
    // Remove extraneous Text
    pid = pid.replace(/PID: /i, '');

    // key is :: 
    // pkill -9 -p $PPID
    // Execute System command to stop the process by PID

    let spawn = require('child_process').spawn,
      script = spawn('pkill', ['f', testPassString]);

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

    console.log(" I should be killing the processes.")

    // create object with test id.

    res.send("process has been killed.");

    return null;

  }).catch((err) => {
    console.log('error: ' + err);
    return err;

  });
}


/************************
 * Function: getTotalNumberOfTestCases()
 * Purpose: Obtains the number of test cases that should be run in order to 
 * provide a basis for test pass progess/validation
 * Parameters: testParameterObject - which is the input object that contains
 * all details for how a specific test pass is composed
 * Returns: The Test Pass Count
 * Author: James Sandoval
 * Date: June 2018
 ************************/

function getTotalNumberOfTestCases(testParameterObject) {
  return new Promise((resolve, reject) => {

    let finalCount = 0;
    let templateCount = 1;
    let features = [];
    let languages = [];
    let limitStore = 0;
    let limit = testParameterObject.Urls;

    // If limit is all, set it to a large number, 1 mil should be sufficient
    // as this searches for urls per specific lang and locale
    // An example is f4 and en-us, which should net ~ 1100 urls.

    if (limit == "all") {
      limit = 1000000;
    }

    async.parallel({
      allDistinctTemplates: (cb) => {
        db.sequelize.query(`SELECT DISTINCT TemplateId FROM Urls;`).then(allDistinctTemplates => {
          allDistinctTemplates = allDistinctTemplates[0];

          cb(null, allDistinctTemplates);

        }).catch((err) => {
          console.log('error Obtaining Distinct Templates: ' + err);
          return err;

        });
      },
      allDistinctLanguages: (cb) => {
        db.sequelize.query('SELECT DISTINCT Language FROM Urls;').then(allDistinctLanguages => {
          allDistinctLanguages = allDistinctLanguages[0];

          cb(null, allDistinctLanguages);

        }).catch((err) => {
          console.log('error Obtaining Distinct Languages: ' + err);
          return err;

        });
      },
      allTestCases: (cb) => {

        if (testParameterObject.features == "all") {
          testParameterObject.features = "%";
        }

        db.sequelize.query(`SELECT TestCaseId FROM Template where Id like '${testParameterObject.features}';`).then(allTestCases => {
          allTestCases = allTestCases[0];

          cb(null, allTestCases);
        }).catch((err) => {
          console.log('error Obtaining all Test Cases: ' + err);
          return err;

        });
      }
    }, (err, results) => {

      //console.log(results.allTestCases[0].TestCaseId);

      // if test cases == all, set test cases to new value;

      // Set to true if test case is all
      let testCaseSelectAllFlag = 0;

      if (testParameterObject.TestCaseSelections == "all") {
        testCaseSelectAllFlag = 1;
        testParameterObject.TestCaseSelections = results.allTestCases[0].TestCaseId.split(',');

      }

      if (testParameterObject.languages[0] == "all") {
        for (let i = 0; i < results.allDistinctLanguages.length; i++) {
          languages.push(results.allDistinctLanguages[i].Language)
        }

      } else {
        languages = testParameterObject.languages;
      }

      if (testParameterObject.features == "all" || testParameterObject.features == "%") {
        for (let i = 0; i < results.allDistinctTemplates.length; i++) {
          features.push(results.allDistinctTemplates[i].TemplateId)
        }

      } else {
        features.push(testParameterObject.features);
      }

      //console.log("loop after insert goes here: ");

      for (let i = 0; i < languages.length; i++) {
        //console.log(languages[i])
      }

      for (let i = 0; i < features.length; i++) {
        //console.log(features[i])
      }

      finalTestCaseCount(testParameterObject, languages, features, limit).then(count => {

        // multiply by the number of test cases
        console.log("The final - final count is " + count);
        resolve(count)

      }).catch((err) => {
        console.log('error: ' + err);
        return err;

      })
    });
  });
}

/********************
 * Function: getUrlsByLangFeatureLimit
 * Description: Obtain urls from query and return for count accumulation.
 * 
 *
 *********************/

function getUrlsByLangFeatureLimit(testParameterObject, feature, language, limit, count) {
  return new Promise((resolve, reject) => {

    let query = `select count(*) from (select Url from Urls where language like '${language}' and TemplateId like '${feature}' limit ${limit}) As a;`;

    db.sequelize.query(query).then(mainCount => {

      mainCount = mainCount[0][0]['count(*)'];
      count = mainCount * testParameterObject.TestCaseSelections.length;

      resolve(count);


    }).catch((err) => {
      console.log('error: ' + err);
      reject(err);
      return err;

    })

  })
}

/************************
 * Function: getfinalTestCaseCount
 * Purpose: obtains a count from urls by feature and language and limit
 * This limits f4 to 100 if limit is > 100
 * Returns: a Promise for the number of urls available given the selection.
 * Author: James Sandoval
 * Date: June 2018
 ************************/

function finalTestCaseCount(testParameterObject, languages, features, limit) {
  return new Promise((resolve, reject) => {
    let limitStore = 0;
    let count = 0;
    let featureArray = []
    let languageArray = []

    async.eachOfSeries(languages, (language, key1, callbackLanguage) => {
      // process language here
      async.eachOfSeries(features, (feature, key2, callbackFeature) => {

        if (feature.toUpperCase() == "F4" && limit > 100) {

          limitStore = limit;
          limit = 100;

        }

        getUrlsByLangFeatureLimit(testParameterObject, feature, language, limit, count).then(count => {


          count += count;

          if (key1 + 1 == languages.length && key2 + 1 == features.length) {

            console.log("The correct count is: " + count);

            resolve(count)
          }

        }).catch((err) => {
          console.log('error: ' + err);
          reject(err);
          return err;

        })

        // restore the correct value to limit after limiting f4 selection
        limit = limitStore;

        callbackFeature();

      }, (err1) => {

        if (err1) {
          console.log("error from async each feature");
          reject(err1)
        }

      });
      callbackLanguage();

    }, (err2) => {

      if (err2) {

        console.log("error from async each language");
        reject(err2);

      }

      // This should be the completion of the loop

    });

  });
}
