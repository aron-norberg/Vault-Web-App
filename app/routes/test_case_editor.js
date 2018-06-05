'use strict';

const db = require('../../config/sequelize');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;


/************************
 * Function: editTestCases()
 * Purpose: provides all  test cases and templates
 * Parameters:
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.editTestCases = function(req, res) {  //getResultByTemplateCustom

    let testcases=null;
    let results = null;
  
    db.sequelize.query(`SELECT * FROM Template;`).then(whereUsed => {  //pulling in data on where each test case is used (in which templates)

        db.sequelize.query(`SELECT * FROM TestCase;`).then(results => {

            results = results[0];
            whereUsed= whereUsed[0];

            //console.log(results[1].Gherkin);

            res.render('test_case_editor', {
                title: 'Test Case Editor',
                testcases: results,
                template: whereUsed,
                user: req.user
            });

            return null;

    
        }).catch(function(err) {
        console.log('error: ' + err);
        return err;
    
        })
        return null;

    
    }).catch(function(err) {
    console.log('error: ' + err);
    return err;

    })
  
};

/************************
 * Function: deleteTestCases()
 * Purpose: removes test cases from the database
 * Parameters:
 * Author:  James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.deleteTestCases = function(req, res) {
  //console.log('Hello Waldo!');
  
  //let Id = req.query.Id; // GET method
  let Id = req.body.Id; // POST method
  console.log('Test case Id is - ' + Id);

  // testcase table
  db.TestCase.destroy({
    where: {
      TestCaseId: req.body.Id
    }

  }).then(function (TestCase) {

    if (TestCase >= 1) {
      console.log('PASS:  Test case - ' + Id + ' has been deleted from TestCase table.');
      res.send(Id);
    }
    else {
      console.log('FAIL: Test case - ' + Id + ' was not found in TestCase table.');
      res.send(Id);
    }

  }); // end db.TestCase.destroy().then()

}; // end exports.deleteTestCases = function(req, res)


exports.newGherkin = function (req, res) {

    let jsonObject = JSON.stringify(req.body);
    let CompleteGherkin = (req.body[0].theScenario + req.body[0].theGherkin);

    db.sequelize.query(`SELECT * FROM TestCase;`).then(gherkinData => {  // TestCase table has: TestCaseId, HashValue, TestCaseDescription, Live, Gherkin
        var gherkinData = gherkinData[0];
        db.sequelize.query('SELECT * FROM Template;').then(whereUsed => { //Template has: Id, TestCaseId ->     f1 - 1,2,3,4,

            if(req.body[0].theID == ""){  // if there wasn't an ID, create the new test case
                db.sequelize.query("INSERT INTO TestCase (HashValue,TestCaseDescription,Live,Gherkin,IsFunctionalTest) VALUES ('" + gherkinData.length +"-new', '" + req.body[0].theScenario + "' , 1 , '" + CompleteGherkin + "', '" + req.body[0].isItChecked + "');" ).then(newTestCase =>{
                    console.log("this is the new test case id " + newTestCase[0]);
                    // console.log("INSERT INTO TestCase (HashValue,TestCaseDescription,Live,Gherkin,IsFunctionalTest) VALUES ('" + gherkinData.length +"-new', '" + req.body[0].theScenario + "' , 1 , '" + CompleteGherkin + "', '" + req.body[0].isItChecked + "');" );
                    var newId = newTestCase[0];   
                    newId = JSON.stringify(newId);     
                    res.send(newId);

                }).catch(function(err) {
                    console.log('error: ' + err);
                    return err;
                })
            }   
        }).catch(function(err) {
            console.log('error: ' + err);
            return err;
        })
        
    }).catch(function(err) {
        console.log('error: ' + err);
        return err;
    })
}

/************************
 * Function: updateTestCaseAndTemplate()
 * Purpose: updates all aspects of a test case, including what templates it is applied to on the Template table
 * Parameters:
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function updateTestCaseAndTemplate(req, jsonObject){

    let match = 0; 

    return new Promise((resolve, reject) => {


        db.sequelize.query(`SELECT * FROM TestCase;`).then(gherkinData => {  // TestCase table has: TestCaseId, HashValue, TestCaseDescription, Live, Gherkin
            db.sequelize.query('SELECT * FROM Template;').then(whereUsed => { //Template has: Id, TestCaseId ->     f1 - 1,2,3,4,
                gherkinData = gherkinData[0];
                whereUsed = whereUsed[0];
                let CompleteGherkin = (req.body[0].theScenario + req.body[0].theGherkin);
                let wipedGherkin = CompleteGherkin.replace(/ /g, "");
                wipedGherkin = wipedGherkin.replace (/\n/g,"");
    
                for (var x = 0; x<gherkinData.length; x++){
                    let myvar = gherkinData[x].Gherkin.replace(/ /g,"")
                    myvar = myvar.replace (/\n/g,"");
                    if ( myvar == wipedGherkin ){
                        console.log("--------------------------------------found it ---------------------------"+myvar);
                        match = 1; 
                        // throw new Error("Please do not enter duplicative Code.  It looks like the code you entered is the same as Test Case # "+gherkinData[x].TestCaseId);
                        //reject("Please do not enter duplicative Code.  It looks like the code you entered is the same as Test Case # "+ gherkinData[x].TestCaseId);
                    }
                }
                
                if (match == 0){
                    console.log("got this far");
                    //if there already IS an ID, we are updating the TestCase table
                    db.sequelize.query("UPDATE TestCase SET HashValue = '" + req.body[0].theID + "-update', TestCaseDescription = '" + req.body[0].theScenario + "', Live = 1, Gherkin = '" +CompleteGherkin +"', IsFunctionalTest = '"+req.body[0].isItChecked+ "' WHERE TestCaseId = '" + req.body[0].theID + "'; "  ).catch(function(err) {
                        return err('error: ' + err);
                    })
                }
                
                // From the Textareas - we get these varibles pushed through a POST request -
                    // "theID": theCaseID, 
                    // "theScenario": newScenario, 
                    // "theGherkin": newGherkin, 
                    // "newPages": newPagesArray,
                    // "removals": removePagesArray,
                    // "isItChecked": isItChecked
                
                // remove tests cases that would run on a template (remove them from the Template table)
                if(req.body[0].removals != null){
                    for (var y = 0; y<req.body[0].removals.length; y++ ){//looping through the REMOVAL requests
                        for (var x = 0; x<whereUsed.length; x++){//looping through the database TEMPLATE TABLE
                            if (whereUsed[x].Id == req.body[0].removals[y]){
                                //grab the list of TESTCASEIDS , convert it to an array separated by commas, and pull out the theID -> then put the array back together and feed int into the TESTCASEID field in the Template table.
                                var caseArray = [];
                                caseArray = whereUsed[x].TestCaseId.split(",");
                                var whereIsIt = caseArray.indexOf(req.body[0].theID);
                                caseArray.splice(whereIsIt,1);
                                caseArray = caseArray.join(",");
                                // console.log(caseArray);
                                db.sequelize.query("UPDATE Template SET TestCaseId = '" + caseArray + "' WHERE Id = '" + req.body[0].removals[y] + "'; "  ).catch(function(err) {
                                    return err('error: ' + err);
                                })
                            }
                        }
                    }
                }
                // add test cases that would run on a template (add to the Template table)
                if(req.body[0].newPages != null){
                    for (var y = 0; y<req.body[0].newPages.length; y++ ){//looping through the ADDITION requests
                        for (var x = 0; x<whereUsed.length; x++){//looping through the database TEMPLATE TABLE
                            if (whereUsed[x].Id == req.body[0].newPages[y]){
                                caseArray = whereUsed[x].TestCaseId.concat("," + req.body[0].theID);
                                // console.log(caseArray);
                                db.sequelize.query("UPDATE Template SET TestCaseId = '" + caseArray + "' WHERE Id = '" + req.body[0].newPages[y] + "'; "  ).catch(function(err) {
                                    return err('error: ' + err);
                                })
                            }
                        }
                    }
                }

                        
                if(match<1){  

                    resolve("Gherkin successfully added to the Test Database.");
    
                }else{
    
                    reject("The code entered is identical to code already found in the database. Duplicates will not be entered into the database. Changes will be saved.");
                }

                return null;


            }).catch(function(err) {
                console.log('error: ' + err);
                return err;
            })

            return null;
    
        }).catch(function(err) {
            console.log('error: ' + err);
            return err;
        })
    }) // updateTestCasesAndTemplate
}


/************************
 * Function: postGherkin()
 * Purpose: sends test case edits to updateTestCaseAndTemplate
 * Parameters:
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

exports.postGherkin = function(req, res) {  // the user clicked on "Save Edits"
    console.log("here I am");
    let jsonObject = JSON.stringify(req.body);
    // console.log(jsonObject);

    updateTestCaseAndTemplate(req, jsonObject).then(response => {

        // evaluate response  
        console.log("return from update test case and template function.");     
        console.log("the response is "+response);
        res.send(response);

    }).catch(function(err) {
        console.log('error found: ' + err);
        res.send(err);
    })

   
    //console.log("this should be last");

}
