// Invoke 'strict' JavaScript mode
'use strict';

// These functions are being used on the test-case-editor page -------------------------

function showIt(ID){
    var p = document.getElementById("gherkin");
    var gherk =document.getElementById("tcSelection").value;
    p.innerHTML = gherk;
    
    var p2=document.getElementById("selectedID");
    var input =ID[ID.selectedIndex].id;
    p2.innerHTML = input;

    var p3=document.getElementById("functionality");
    var selection = document.getElementById("tcSelection");
    var funct = selection.options[selection.selectedIndex].getAttribute("data-functional");
    p3.innerHTML = funct;
}

function editTc(){ //this populates the boxes below the "Edit Selected Test Case" button with what the Gherkin currently is

    var hidden=document.getElementById("hiddenRow");
    hidden.setAttribute("style", "display:visible");
    document.getElementById("createGherkin").disabled=true; 

    var checkbox = document.getElementById("funcitonalCheckbox");
    var checked = document.getElementById("functionality").innerHTML;
    if(checked == "1"){
        checkbox.checked = true;
    } else {
        checkbox.checked = false;
    }

            
    var placement1= document.getElementById("theID");
    var ID=document.getElementById("selectedID").innerHTML; //grab the TestCaseID from the hidden paragraph above
    placement1.innerHTML=ID;

    var placement2= document.getElementById("theScenario");  //get the location under the "Scenario" heading
    var content2 = document.getElementById("gherkin").innerHTML;
    if(content2.indexOf('Then') > -1){
        content2=content2.substring(0, content2.indexOf('Then'));
    }
    if(content2.indexOf('When') > -1){
        content2=content2.substring(0, content2.indexOf('When'));
    }
    placement2.innerHTML = content2;

    var placement3= document.getElementById("theGherkin");
    var content3=document.getElementById("tcSelection").value;
    content3= content3.replace(content2,''); //this gets rid of the Scenario so that content3 only contains Gherkin 
    content3=content3.replace("@javascript",''); //this gets rid of the '@javascript' that is in some of these Gherkin strings
    // content3=content3.replace(/\n/,''); 
    placement3.innerHTML=content3;
    // getLive(content1);

    var buttons = document.getElementsByClassName("x");

     for (var q=0; q<buttons.length; q++){
        buttons[q].setAttribute("class", "btn btn-light locale-button x");
    }

    var string = '"';
    for (var x=0; x<buttons.length; x++){
        var buttonData = buttons[x].value;
        buttonData = buttonData.split(",");

        if (buttonData.indexOf(ID.toString(),0) > -1){
            buttons[x].setAttribute("class", "btn btn-warning locale-button x");
        }
    }

    
}

function classSwitch(thisOne){
    var currentID = thisOne.getAttribute("id");
    var currentClass = thisOne.getAttribute("class").toString();
    if (currentClass.indexOf("btn-warning") > -1){
        thisOne.setAttribute("class", "btn locale-button x btn-danger");
    } else if (currentClass.indexOf("btn-danger") > -1) {
        thisOne.setAttribute("class", "btn locale-button x btn-warning");
    }else if (currentClass.indexOf("btn-light") > -1) {
        thisOne.setAttribute("class", "btn locale-button x btn-success");
    }else if (currentClass.indexOf("btn-success") > -1) {
        thisOne.setAttribute("class", "btn locale-button x btn-light");
    }

}

function createTc(){   //unhide the 'hiddenRow' section and put into it the basics of "scenario" and "when" - we then feed this to the database so that I can get an ID to display
    var hidden=document.getElementById("hiddenRow");
    hidden.setAttribute("style", "display:visible");
    document.getElementById("editGherkin").disabled=true;    
    // document.getElementById("theID").innerHTML = "";
    var Scenario = document.getElementById("theScenario");
    Scenario.value = "Scenario:";
    var Gherkin = document.getElementById("theGherkin");
    Gherkin.value = "When ";
    var newPages = document.getElementsByClassName("x");        
    for (var x=0; x<newPages.length; x++){
        newPages[x].setAttribute("class", "btn btn-light locale-button x");
    }
    var currentPages = document.getElementsByClassName("btn btn-warning locale-button x");        
    for (var y=0; y<currentPages.length; y++){
        currentPages[y].setAttribute("class", "btn btn-light locale-button x");
    }
    var removePages = document.getElementsByClassName("btn locale-button btn-danger x");        
    for (var r=0; r<removePages.length; r++){
        removePages[r].setAttribute("class", "btn btn-light locale-button x");
    }
  
    var newTestCase = { //  creating an object to feed into the database so that we can get an ID for the new TestCase
        "theID": "", 
        "theScenario": Scenario.value, 
        "theGherkin": "&nbsp"+Gherkin.value, 
        "newPages": null,
        "removals": null,
        "isItChecked": 1
    };
    var arrayOfObjects = new Array();
    arrayOfObjects.push(newTestCase);
    console.log(arrayOfObjects);
    // console.log(objBunnyEars.newPages[1] + "-----------this is a page that was selected to be added to ----------");

    let finalObject = JSON.stringify(arrayOfObjects);
  
    // console.log(finalObject + "-----------this is the final object ------------");
  
    // This function sends the data from the Test Case Editor page, through the express.js page to the newGherkin() function on test_case_editor.js where the database is accessed and updated
    $.ajax({
      url: '/new-gherkin',
      type: 'POST',
      data: finalObject,
      contentType: "application/json",
      error: function(data) {
        console.log(data + "------------ it didn't work -----------------");
      },
      success: function(data) {
        console.log(data);
        console.log("I sent a new test case to the database.");
        document.getElementById("theID").innerHTML= (data);

      }
    })

    //setTimeout(function() { cleanGherkin(); }, 5000);
} //end createTc()


/************************
 * Function: cleanGherkin()
 * Purpose: Deletes any test case thats selected from the TestCase table found in the test DB.  
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
************************/
function deleteTc() {

  var delConfirm = confirm("Are you sure you want to delete test case?");

  if (delConfirm == true) {
    alert('Delete selected test case is coming soon to a script near you!');
  }
  else {
    //alert('Delete canceled!');

  } // end if/else
  

} // end deleteTc()


/************************
 * Function: cleanGherkin()
 * Purpose: Deletes empty "Scenario:" text in testCaseDescription found in the tescase database when the test_case_editor.ejs page loads. 
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
************************/
function cleanGherkin() {
  // The id var is only used to trigger the "exports.cleanGherkin_DB = function(req, res)" function in the api_DB_writer.js page.
  var id = 1138;

  $.ajax({
    url: '/clean-gherkin',
    type: 'POST',
    data: id,
    success: function(data) {
      console.log(data);
      console.log("Gherkin cleaned");
    }
  })
  
} // end cleanGherkin()


function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("tcSelection");
    a = div.getElementsByTagName("option");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
        } else {
        a[i].style.display = "none";
        }
    }
}


function exportGherkin() {

    var arrayOfObjects = new Array();
    var theCaseID = document.getElementById("theID").innerHTML;
    var newScenario = document.getElementById("theScenario").value;
    var newGherkin = document.getElementById("theGherkin").value;
    var isItChecked = 2;
    var newPagesArray=[];
    var removePagesArray = [];
    var theCheckbox = document.getElementById('funcitonalCheckbox').checked;  //true or false for .checked
    if (theCheckbox){
        // console.log("this one was checked");
        isItChecked = 1;
    }else{
        // console.log("this was NOT checked");
        isItChecked = 0;}

    var newPages = document.getElementsByClassName("btn locale-button x btn-success");        
    for (var x=0; x<newPages.length;x++){
        newPagesArray[x] = newPages[x].innerHTML;
        newPagesArray[x]=newPagesArray[x].replace(/^[^f]*/, '');
        newPagesArray[x]=newPagesArray[x].replace(/[^\d+]+$/, '');
    }

    var removals = document.getElementsByClassName("btn locale-button x btn-danger");
    for (var q=0; q < removals.length; q++){
        removePagesArray[q] = removals[q].innerHTML;
        removePagesArray[q]=removePagesArray[q].replace(/^[^f]*/, '');
        removePagesArray[q]=removePagesArray[q].replace(/[^\d+]+$/, '');
    }

    var objBunnyEars = { //  for James and Aron  :P
        "theID": theCaseID, 
        "theScenario": newScenario, 
        "theGherkin": newGherkin, 
        "newPages": newPagesArray,
        "removals": removePagesArray,
        "isItChecked": isItChecked
    };

    arrayOfObjects.push(objBunnyEars);
    let finalObject = JSON.stringify(arrayOfObjects);

    // This function sends the data from the Test Case Editor page, through the express.js page to the postGherkin() function on test_case_editor.js where the database is accessed and updated
    $.ajax({
      url: '/post-gherkin',
      type: 'POST',
      data: finalObject,
      contentType: "application/json",
      error: function(data) {
        console.log(data + "------------ it didn't work -----------------");
      },
      success: function(data) {
        console.log(data);
        alert(data);
        window.location.reload();
      }
    })
  
};