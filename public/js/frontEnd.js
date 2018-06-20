// Invoke 'strict' JavaScript mode
'use strict';

/***********************************************************************
 ***  Dashboard scripts - BEGIN
 ***********************************************************************/

/************************
 * Function: dashboardPage()
 * Purpose: Hides container id='dashboard-2' if title = 'Dashboard' if not then it shows its on the dashboard page.
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function dashboardPage() {
  var dashboardTitle = document.getElementById('h2Title').innerHTML;

  if (dashboardTitle === 'Dashboard') {
    //document.getElementById('dashboard-1').style.display = "block";
    document.getElementById('dashboard-2').style.display = "none";
  } else {
    document.getElementById('dashboard-1').style.display = "none";
    //document.getElementById('dashboard-2').style.display = "block";
  }
} // end dashboardPage()


/************************
 * Function: deleteTestResults(Id)
 * Purpose: Deletes Test result by TestPassId from TestPass, Status, and Result tables from the dashboard page.
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function deleteTestResults(Id) {

  var delConfirm = confirm("Are you sure you want to delete test result ID: " + Id + "?");

  if (delConfirm == true) {

    $.ajax({
      url: "/deleteTestResults",
      type: "GET",
      dataType: "html",
      data: {
        Id: Id
      },
      success: function() {
        console.log('success');
        window.location = '/dashboard';

      }, // end success : function()
      error: function() {
        console.log('error');

      } // end error : function()

    }); // end .ajax()

  } else {
    //alert('Delete canceled!');

  } // end if/else


} // end deleteTestResults(Id)


/************************
 * Function: addUnreliableToTestResult()
 * Purpose: Add a 0 value to reliable and Notes to the testPass table in the database.
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function addUnreliableToTestResult() {

  var Id = document.getElementById('idTestPass').innerHTML;
  var ckBox = document.getElementById('unreliableCkbox').value;
  var notes = document.getElementById('textareaNotes').value;
  var unreliableConfirm = confirm("Are you sure you want to mark this test result ID: " + Id + " unreliable?");

  if (unreliableConfirm == true) {

    $.ajax({
      url: "/addUnreliableToTestResult",
      type: "Get",
      data: {
        Id: Id,
        ckBox: ckBox,
        notes: notes
      },
      success: function() {
        console.log('success');
        location.reload(true); //Refresh page

      },
      error: function() {
        console.log('error');
      }

    }); // end .ajax()

  } else {
    //alert('unreliable canceled!');

  } // end if/else

} // end unreliableCheckBox()

/***********************************************************************
 ***  DASHBOARD SCRIPTS - END
 ***********************************************************************/


/***********************************************************************
 ***  EXPORT RESULTS SCRIPTS - BEGIN
 ***********************************************************************/

function exportSelections() { //this function is triggered on the "Export Data" button.

  let template = '';
  let language = '';
  let testresult = "";
  let query = "";
  let thehref = "";

  let TchildCount = document.getElementById("pageChildren").children.length;
  let LchildCount = document.getElementById("langChildren").children.length;

  template = document.getElementById("pageChildren").children[0].id; // this takes the first child and puts it in 'template'
  template = template.slice(0, -1);

  for (var x = 1; x < TchildCount; x++) { // if there are additional children, we add a comma and the feature page for each child
    let t = document.getElementById("pageChildren").children[x].id;
    t = t.slice(0, -1);
    template = template + "," + t;
  }

  language = document.getElementById("langChildren").children[0].id; // this takes the first language child and puts it in 'language'
  language = language.slice(0, -1);

  for (var y = 1; y < LchildCount; y++) { // if additional languages were chosen, we add a comma and the language for each one selected
    let l = document.getElementById("langChildren").children[y].id;
    l = l.slice(0, -1);
    language = language + "," + l;
  }

  var testdate = document.getElementById("radialChild").children[0].id;
  testdate = testdate.slice(0, -1);
  // testdate = testdate.substring(0, testdate.indexOf(' | '))
  console.log("the testdate is " + testdate);
  console.log("/export?feature=" + template + "&language=" + language + "&testresult=" + testresult + "&query=" + query + "&testpassid=" + testdate);

  //the href will contain a list of each languages as 'en-us,de-de' and features will be 'f1,f3,f5' 
  // in the getExportFromResults() function on 'api_export.js' these commas are watched for, so that the string can be split to an array and a query created for all the selections

  //thehref="/export?feature="+ template + "&language=" + language + "&testresult=" + testresult + "&query=" + query + "&testpassid=" + testdate;
  thehref = "/export?feature=" + template + "&language=" + language + "&testresult=" + testresult + "&query=" + query + "&testpassid=" + testdate;
  document.getElementById("myhref").href = thehref;

  // location.reload(); //resets the export selection tool

} // end exportSelections()

// This function populates the languages and templates for display in the drop-down menus.
function displayInfo(data, id) {
  document.getElementById("testData").innerHTML = (data);
  document.getElementById("langButton").disabled = false;
  document.getElementById("mybutton").disabled = false;
  document.getElementById("runTest").disabled = false;
  var lkids = document.getElementById("langChildren");
  var pkids = document.getElementById("pageChildren");

  while (lkids.firstChild) {
    lkids.removeChild(lkids.firstChild);
  }

  while (pkids.firstChild) {
    pkids.removeChild(pkids.firstChild);
  }

  //clear out any content in the language and template dropdowns
  var langParent = document.getElementById("langList");
  while (langParent.hasChildNodes() && langParent.lastChild.id != "langAll") {
    langParent.removeChild(langParent.lastChild);
  }

  var templateParent = document.getElementById("featureUL");
  while (templateParent.hasChildNodes() && templateParent.lastChild.id != "tempAll") {
    templateParent.removeChild(templateParent.lastChild);
  }

  let exportObject = {
    "testPass": id
  };

  let object = JSON.stringify(exportObject);

  $.ajax({
    url: '/getTemplatesAndLangFromTestPass',
    type: 'POST',
    data: object,
    contentType: "application/json",
    error: function(data) {
      console.log("This is the data" + data);
      if (data.testpassCount == 0) {
        noticeBox.innerHTML = "";
      }
    },
    success: function(data) {
      console.log(data);
      console.log("Successful post request.");

      data = JSON.parse(data);
      // Get the id 
      let stopId = data.jsonStartPath;
      // console.log(data.testPassCount);

      if (data.testPassCount == 0) {
        noticeBox.innerHTML = "";
      }

      // if the query was successful, populate the lang and template dropdowns with the results
      var theTemplates = data[0].Template.split(",");
      var theLanguages = data[0].Language.split(",");
      console.log(theTemplates + "<---");
      console.log(theLanguages + "<---");

      for (var x = 0; x < theLanguages.length; x++) {
        var node = document.createElement("LI");
        node.setAttribute("class", "width-set dropdown-item");

        var span = document.createElement("SPAN");
        span.setAttribute("id", "langParent-" + [x]);

        var langinputItem = document.createElement("input");
        langinputItem.setAttribute("class", "lang double");
        langinputItem.setAttribute("type", "checkbox");
        langinputItem.setAttribute("id", theLanguages[x]);
        langinputItem.setAttribute("onclick", "displayChecked(this.id, 'langList', 'LAll', 'langChildren', 'span')");

        var langtextnode = document.createTextNode("  " + theLanguages[x]);
        node.appendChild(span);
        span.appendChild(langinputItem);
        span.appendChild(langtextnode);
        document.getElementById("langList").appendChild(node);
      }

      for (var x = 0; x < theTemplates.length; x++) {

        var node2 = document.createElement("LI");
        node2.setAttribute("class", "width-set dropdown-item");

        var span2 = document.createElement("SPAN");
        span2.setAttribute("id", "templateParent-" + [x]);

        var templateItem = document.createElement("input");
        templateItem.setAttribute("class", "FX double");
        templateItem.setAttribute("type", "checkbox");
        templateItem.setAttribute("id", theTemplates[x]);
        templateItem.setAttribute("onclick", "displayChecked(this.id, 'featureUL','All','pageChildren', 'span')");

        var thePage = "";
        switch (theTemplates[x]) {
          case "F1":
            thePage = "(F1) Home Page";
            break;
          case "F2":
            thePage = "(F2) Product Tabe of Contents";
            break;
          case "F3":
            thePage = "(F3) Product Sub-Category";
            break;
          case "F4":
            thePage = "(F4) Product Display";
            break;
          case "F5":
            thePage = "(F5) HTML Page";
            break;
          case "F6":
            thePage = "(F6)";
            break;
          case "F7":
            thePage = "(F7) New Fluke Products";
            break;
          case "F8":
            thePage = "(F8) Promotions and Contests TOC";
            break;
          case "F9":
            thePage = "(F9) Article Table of Contents";
            break;
          case "F10":
            thePage = "(F10) Webcard Table of Contents";
            break;
          case "F11":
            thePage = "(F11) Webcard";
            break;
          case "F12":
            thePage = "(F12) Fluke News Table of Contents";
            break;
          case "F13":
            thePage = "(F13) Fluke News Sub-Category";
            break;
          case "F14":
            thePage = "(F14) Article";
            break;
          case "F15":
            thePage = "(F15) Tradeshows and Seminars";
            break;
          case "F16":
            thePage = "(F16) Training Library";
            break;
          case "F17":
            thePage = "(F17) Webinars";
            break;
          case "F18":
            thePage = "(F18)";
            break;
          case "F19":
            thePage = "(F19) Manuals";
            break;
          case "F20":
            thePage = "(F20) Press Releases";
            break;
          case "F21":
            thePage = "(F21) Safety Notices";
            break;
          case "F22":
            thePage = "(F22) Software Downloads";
            break;
          case "F23":
            thePage = "(F23) Where to Buy";
            break;
          case "F24":
            thePage = "(F24) Link to Offsite Location";
            break;
          case "F25":
            thePage = "(F25) Promotions and Contests Page";
            break;
          default:
            thePage = "unknown";
        }
        console.log("I am a success.");
      }
    }
  })
}


/************************
 * Function: getSelectVal(sel)
 * Purpose: Adds the seleceted name from dropdown list to the database
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: March 2018
 ************************/

function getSelectVal(sel) {

  $.ajax({
    url: "/addOwnerToResultsPage",
    type: "GET",
    dataType: "html",
    data: {
      Id: $(sel).closest("form").find("input[type=hidden]").prop("name", "Id").val(),
      users: sel.value
    },
    success: function() {
      console.log('success');
      location.reload(true); //Refresh page

    }, // end success : function()
    error: function() {
      console.log('error');

    } // end error : function()

  }); // end .ajax()

} // end getSelectVal()


/************************
 * Function: resolvedInNotes()
 * Purpose: Finds all notes on the results page with the text 'RESOLVED' and changes the font color.
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: June 2018
 ************************/

function resolvedInNotes() {
  //console.log('Hello Waldo!');

  $(".notesMsg").each(function() {

    $('.notesMsg:contains("RESOLVED")').css({ "color": "#28A745", "font-weight": "bold" });

  }); // end $(".notesMsg").each(function()

} // end resolveTestCase()


/***********************************************************************
 ***  EXPORT RESULTS SCRIPTS - END
 ***********************************************************************/


/***********************************************************************
 ***  GLOBAL - EXPORT RESULTS AND RUN TESTS - BEGIN
 ***********************************************************************/

// This function is used in the dropdowns where checkboxes (including "all" options) can be selected 
// - Export Results page, Run Tests page
//
function displayChecked(checkedID, ULID, allID, destinationID, element) {

  var checkBox = document.getElementById(checkedID); // Get the selected item
  var parentClass = checkBox.parentNode.parentNode.className; // grabs the UL's class
  var text = checkBox.parentNode.textContent; // Get the checkbox's text (in the <span>)
  var paragraph = document.createElement(element); //create a paragraph
  var checkboxes = new Array();
  var allBox = document.getElementById(allID);
  var checkboxes = document.getElementsByTagName('input');
  var placement = document.getElementById(destinationID);

  if (placement.innerHTML && (!text.includes("all")) && destinationID != "chosenTestCases") {
    // Check if 
    text = ", " + text;
  }

  var content = document.createTextNode(text); //create text (for the new paragraph)   

  // If the checkbox is checked, create a paragraph element and input the checkbox's text
  if (checkBox.checked == true) {
    if (parentClass == "dropdown-item radial" && document.getElementById("radialChild").hasChildNodes()) { //if a radio button was selected, remove any other radio choices from the display section
      document.getElementById("radialChild").innerHTML = "";
    }

    //console.log(content);

    paragraph.appendChild(content);
    paragraph.setAttribute('id', checkedID + 'x');
    placement.appendChild(paragraph);

    // if the ALL button was clicked, check every box and remove anything else from the paragraph section
    if (checkedID == allID) {
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].parentNode.parentNode.parentNode.id == ULID) { // if the UL, above the Span and Input == ULID
          checkboxes[i].checked = true;
        }
      }
      while (placement.firstChild) {
        placement.removeChild(placement.firstChild);
      }
      placement.appendChild(paragraph);

    } else {}

  } else { // If you are un-checking the box, you will remove the child paragraph element that had been created.

    //If I'm un-checking the PAGE "all" box, uncheck ALL the boxes
    if (checkedID == allID) {
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].parentNode.parentNode.parentNode.id == ULID) {
          checkboxes[i].checked = false; // un-check all the boxes 
        }
      }
      var child = document.getElementById(checkedID + 'x');
      child.parentNode.removeChild(child); // and remove "all" under pages selected
    }

    //If I'm un-checking anything other than the "all" boxes
    else if (checkedID != allID) {
      //console.log("I'm not unchecking an All option" + checkedID + "--"+allID);

      //If the "all" box HAD been checked for the Feature Page section
      //console.log(allBox.id);
      if (allBox.checked == true) { // && ULID == ULID              <-----------???
        //console.log("I've unchecked something when ALL HAD been chosen");
        allBox.checked = false; // un-check the "all" box and remove it from the pages selected section
        var allChild = document.getElementById(allID + "x");
        allChild.parentNode.removeChild(allChild);
        var eliminator = checkedID; //note which page you were un-selecting


        //goes through all the possibilities, and if there was a checkbox for it, but it wasn't the ALL or Eliminator, add a paragraph for it
        for (var i = 1; i < checkboxes.length - 1; i++) {
          if (checkboxes[i].checked && checkboxes[i].parentNode.parentNode.parentNode.id == ULID) {
            var text = checkboxes[i].id;
            var paragraph = document.createElement(element);
            var placement = document.getElementById(destinationID);

            if (placement.innerHTML && (!text.includes("all"))) {
              text = ", " + text;
            }

            var content = document.createTextNode(text);

            if (checkboxes[i].id != eliminator) {
              paragraph.appendChild(content);
              paragraph.setAttribute('id', checkboxes[i].id + 'x');
              placement.appendChild(paragraph);
            }
          }
        }
      }
      // if something other than "all" was un-checked, but "all" had not been checked, just remove the one item from pages selected
      else {
        //console.log("I've unchecked something when ALL had NOT been selected" );
        var child = document.getElementById(checkedID + 'x');
        child.parentNode.removeChild(child);
      }
      //console.log("the end");
    } //end else if
  } //end else
}


/************************
 * Function: filterFunction()  -TEST CASE EDITOR PAGE 
 * Purpose: Used for each character entered in the search field 
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/
function filterFunction() {

  var input, div, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  console.log("filter is " + filter);
  div = document.getElementById("tcSelection");
  a = div.getElementsByTagName("option");
  console.log( "a is "+a);

  for (i = 0; i < a.length; i++) {
    if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

/***********************************************************************
 ***  GLOBAL - EXPORT RESULTS AND RUN TESTS - END
 ***********************************************************************/


/***********************************************************************
 ***  TEST CASE EDITOR SCRIPTS - BEGIN
 ***********************************************************************/

function grabTCsForFeature() {

  let reader = new FileReader();
  let templateParagraph = document.getElementById("selectedTemplates");
  let template = templateParagraph.innerHTML;

  //console.log(template);
  console.log("fetching test cases");

  // remove excess data from string so that only template is sent to query.
  template = template.substring(template.indexOf(";") + 1);

  var templateChoice = { //  creating an object to feed into the database so that we can get an ID for the new TestCase
    "theTemplate": template
  };
  var arrayOfObjects = new Array();
  arrayOfObjects.push(templateChoice);
  let finalObject = JSON.stringify(arrayOfObjects);

  // console.log(finalObject + "-----------this is the final object ------------");

  // This function sends the data from the runTestsModal page, per the express.js page to the getTestCases() function on runTestsModal.js where the database is accessed and updated
  $.ajax({
    url: '/getTestCases',
    type: 'POST',
    data: finalObject,
    contentType: "application/json",
    error: function(data) {
      console.log(data + "------------ GET TEST CASES FAILED -----------------");
    },
    success: function(data) {
      // console.log(data);
      //console.log("successful response from test case request")d
      for (var x = 0; x < data.length; x++) {
        var node = document.createElement("LI"); // Create a <li> node
        node.setAttribute("class", "list testcasechoice");
        var span = document.createElement("SPAN");
        var inputItem = document.createElement("input");
        inputItem.setAttribute("class", "double testcasechoice");
        inputItem.setAttribute("name", "testcase");
        inputItem.setAttribute("type", "checkbox");
        inputItem.setAttribute("onclick", "displayChecked(this.id, 'theTestCases', 'TCAll', 'chosenTestCases', 'p')");
        var mystring = " " + data[x].TestCaseId + " | " + data[x].TestCaseDescription;
        //console.log("mystring is " + mystring);
        inputItem.setAttribute("id", mystring);

        var textnode = document.createTextNode(mystring); // Create a text node
        node.appendChild(span);
        span.appendChild(inputItem);
        span.appendChild(textnode); // Append the text to <li>
        document.getElementById("theTestCases").appendChild(node); // Append <li> to <ul> with id="myList"
      }
    }
  })
}


//this function unhides the Template button
function unhideTemplates() {
  let templateButton = document.getElementById("tb");
  let langArrayTestRunner = document.getElementsByClassName('lang double');
  //console.log("number of items with class is lang double = " + langArrayTestRunner.length);

  for (var x = 0; x < langArrayTestRunner.length; x++) {
    if (langArrayTestRunner[x].checked == true) {
      templateButton.removeAttribute("disabled");
    }
  }

}

// Show Templates on the Test Runner page
function showTemplates() {
  let urlButton = document.getElementById("url");
  let testCaseButton = document.getElementById("tcb");
  let templateParagraph = document.getElementById("selectedTemplates");
  let templateArray = document.getElementsByClassName("form-check-input double");
  let langParagraphLength = document.getElementById("chosenLangs").innerHTML;
  templateParagraph.innerHTML = "<b>Template: </b>";
  for (var q = 0; q < templateArray.length; q++) {
    if (templateArray[q].checked == true) {
      templateParagraph.innerHTML = templateParagraph.innerHTML + "&nbsp" + templateArray[q].id;
    }
  }

  //remove any list items that were added to the Test Case modal from any previous selections
  var ulParent = document.getElementById("theTestCases");
  while (ulParent.hasChildNodes()) {
    ulParent.removeChild(ulParent.lastChild);
  }

  testCaseButton.removeAttribute("disabled");
  urlButton.removeAttribute("disabled");
  grabTCsForFeature();
}

// Show Input on the test Runner for Urls
function showInput() {
  let box = document.getElementById("typedURL");
  box.setAttribute("style", "display:block;");

}

/************************
 * Function: getBehatLogFile(id)
 * Purpose: Produces log file per test pass, file output is seen in console
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: June 2018
 ************************/


/*### 
### FOR DEVELOPMENT ONLY.
### OUTPUT MUST BE UNCOMMENTED IN START.PL 
### */

function getBehatLogFile(id) {

  id = {
    id: id
  }

  id = JSON.stringify(id);

  $.ajax({
    url: '/getlogfile',
    type: 'POST',
    data: id,
    contentType: "application/json",
    error: function(data) {
      console.log(data + "Retrieving Log File failed.");
    },
    success: function(data) {
      // This should be a log file
      console.log(data);

    }
  })
}

// Show Input on the test Runner for Urls
function showInput() {
  let box = document.getElementById("typedURL");
  box.setAttribute("style", "display:block;");

}


// Show url choice on test runner page
function showURLChoice() {
  let urlParagraph = document.getElementById("selectedURLs");

  // Obtain the value from the domain selection
  let domainSelection = document.getElementById("domain-selection");

  // Append the domain value to the inner html @ selectedDomain for selection display
  document.getElementById("selectedDomain").innerHTML = "<b>Domain:</b> " + domainSelection.value;

  let urlChoiceArray = document.getElementsByClassName("aURL");
  urlParagraph.innerHTML = "<b>URLs: </b>";
  for (var y = 0; y < urlChoiceArray.length; y++) {
    if (urlChoiceArray[y].checked == true) {
      urlParagraph.innerHTML = urlParagraph.innerHTML + urlChoiceArray[y].parentElement.innerText;
    }
  }

  let typedInURL = document.getElementById("enteredURL").value;
  console.log(typedInURL);
  if (typedInURL.length > 0) {
    //console.log("something was typed");
    urlParagraph.innerHTML = "<b>URLs: </b>" + typedInURL;
  }
}

// Send a json object to server to run a test 
// with given parameters
function getContentTestParameters() {

  let noticeBox = document.getElementById("notice");
  let descriptionBox = document.getElementById("description");
  let urlParagraph = document.getElementById("selectedURLs");
  let langParagraph = document.getElementById("chosenLangs");
  let templateParagraph = document.getElementById("selectedTemplates");
  let tcs = [];
  let tcs_filter = [];
  let langs = [];

  // Parse language selection 
  for (let i = 0; i < langParagraph.childNodes.length; i++) {
    // Remove white space
    langs[i] = langParagraph.childNodes[i].innerHTML.replace(/\s/g, '');
    langs[i] = langs[i].substring(langs[i].indexOf(";") + 1);
  }

  // Parse Template data
  let template = templateParagraph.innerHTML.substring(templateParagraph.innerHTML.indexOf(";") + 1);

  // Parse Test Case Data
  tcs = document.getElementById('chosenTestCases').innerHTML.split("\n");
  console.log("tcs is " + tcs);

  // Validate if all 
  let tcsCheckIfAll = tcs;
  tcsCheckIfAll = tcs[1];
  tcsCheckIfAll = tcsCheckIfAll.split(";").pop();
  console.log("tcsCheckIfAll is " + tcsCheckIfAll);

  if (tcsCheckIfAll == "all") {

    tcs[0] = "all";
    tcs.length = 1;

  } else {

    for (let i = 0; i < tcs.length - 1; i += 2) {
      tcs_filter.push(tcs[i]);
    }

    for (let i = 0; i < tcs_filter.length; i++) {
      tcs_filter[i] = tcs_filter[i].split("id=\"\ ").pop();
      tcs_filter[i] = tcs_filter[i].substring(0, tcs_filter[i].indexOf('\ '));
    }

    tcs = tcs_filter;

  }

  // Parse Url Selection 
  let urlChoices = urlParagraph.innerHTML.substring(urlParagraph.innerHTML.indexOf(";") + 1);
  urlChoices = urlChoices.substring(0, urlChoices.indexOf('\ '));

  // Parse Domain Selection 
  let domain = document.getElementById("selectedDomain").innerHTML;
  domain = domain.substring(domain.indexOf("\ ") + 1);
  //console.log(domain);

  // Parse description selection
  let description = descriptionBox.value;

  if (langs.length == 0 || tcs.length == 0 || urlChoices.length == 0 || description.length == 0) {
    if (langs[0].length == 0) {
      alert("Please select at least one language to test.");
    }
    if (tcs.length == 0) {
      alert("Please select at least one test case to run.");
    }
    if (urlChoices.length == 0) {
      alert("Please make a URL selection.");
    }
    if (description.length == 0) {
      alert("Please add a description to your test pass.");
    }
    return;
  } else {
    noticeBox.innerHTML = " loading... ";
  }

  let testParameters = {
    "languages": langs,
    "features": template,
    "TestCaseSelections": tcs,
    "Urls": urlChoices,
    "domain": domain,
    "description": description,
    "testType": "content",
  };

  let testParamsJSON = JSON.stringify(testParameters);

  return (testParamsJSON);

}
/********************************
 *
 * Functional Test Section
 *
 ********************************/

/***************************
 * Purpose: Select All Functional Tests
 ****************************/

$("#checkAll").click(function() {
  $(".test-check").prop('checked', $(this).prop('checked'));
});

/***************************
 * Purpose: Pass functional Test id to form inside view/edit modal
 * Open up Edit Page with selected Data
 ****************************/

$(document).on("click", ".edit-fx-test", function() {

  let id = $(this).attr('id');
  id = id.replace('test-pass-modal-id-', '');

  id = {
    id: id
  }

  $.ajax({
    url: '/get-functional-test-by-id',
    type: 'get',
    data: id,
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    dataType: "json",
    error: function(data) {
      console.log(data + "GET TEST CASES FAILED - FROM EDIT FX TEST ");
    },
    success: function(data) {
      data = data[0][0];

      let url = data.URL;
      let id = data.Id;
      let template = data.Template;
      let testCases = data.TestCaseId;

      testCases = testCases.split(",");

      // Display Feature and Test Id 
      $("#fx-edit-id-info").text(`Feature: ${template} - ID: ${id}`);

      // Select Feature and disable selecting new one
      // The use should delete if they want to create a new feature
      $("#editFeature option").each(function() {
        if ($(this).val() == template) {
          $(this).attr("selected", "selected");
          return false;
        }
      });

      $("#editFeature").attr("disabled", true);

      // Add the URl to the correct box -> Set the value 
      $("#editUrl").val(url);

      // Add id to hidden input field
      $("#edit-fx-id").val(id);

      //$("#fx-delete-button").text("test");

      $("#fx-delete-button").attr('data-feature', template);

      populateTestCases();

      // Populate the test Case Options:
      async function populateTestCases() {
        let casesAdded = await getTestCasesByFeature(template);

        if (casesAdded) {
          // Select the test case Options 
          for (let i = 0; i < testCases.length; i++) {
            $("#test-case-fx-edit-container input").each(function() {
              if ($(this).val() == testCases[i]) {
                $(this).attr("checked", true);
                return false;
              }
            });
          }
        }
      }
    }
  })
});
/***************************
 * Purpose: Clear Functional test Add form when new is selected
 ****************************/

function clearTestCasesOnNew() {
  $("#newFeature option").each(function() {
    if ($(this).val() == "Select:") {
      $(this).attr("selected", "selected");
      return false;
    }
  });

  $("#newUrl").empty();

  let testCaseContainer = $(".test-case-fx-container");
  $(testCaseContainer).empty();

}

function deleteFxTestById() {

  let feature = $("#fx-delete-button").attr('data-feature');
  let id = $("#edit-fx-id").val();

  id = {
    id: id
  }

  $.ajax({
    url: '/delete-fx-test-by-id',
    type: 'DELETE',
    data: id,
    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
    dataType: "json",
    error: function(data) {
      console.log(data + "Delete FX Test Failed");
    },
    success: function(data) {

      console.log(`#main-test-node-${feature}-${id.id}`);

      $(`#main-test-node-${feature}-${id.id}`).remove();
    }
  })
}
/***************************
 * Purpose: Submit Parameters to run/schedule functional test
 * Description: Convert form data into json and send as paremeter to runner/scheduler
 ****************************/

$("#fx-test-container").submit(function(event) {

  // prevent submit Default
  event.preventDefault();
  let $this = $(this);

  // validation  
  let $testSelections = $(this).find(":checkbox:checked");
  let fxTestIdArray = [];

  $.each($testSelections, (key, value) => {

    if (value.id != "checkAll") {
      fxTestIdArray.push(parseInt(value.value));
    }

  });

  let fxTests = {
    ids: fxTestIdArray
  }

  fxTests = JSON.stringify(fxTests);

  $.ajax({
    url: "/run-fx-test",
    type: 'POST',
    data: fxTests,
    contentType: "application/json",
    error: function(data) {
      console.log(data + "run fx test Error");
    },
    success: function(data) {
      console.log("Success from fx test.");
    }
  })
})


/***************************
 * Purpose: Submit New Functional Test 
 * Description: Adds A new Test 
 ****************************/

$("#addNewFxTest").submit(function(event) {
  console.log("add fx function is called.");
  event.preventDefault(); // Prevents the page from refreshing
  let $this = $(this); // `this` refers to the current form element

  let $testCases = $(this).find(":checkbox:checked");

  // Test Case Selection Validation
  if ($testCases.length < 1) {

    alert("Please Choose a test case to Continue.")
    return false;
  }

  $.post(
    $this.attr("action"), // Gets the URL to sent the post to
    $this.serialize(), // Serializes form data in standard format
    function(data) { /** code to handle response **/
      $('.modal').modal('hide');
      alert("Functional Test Added.");
      // Obtain the correct div element

      data = data.split(",");
      let newFeature = data[0];
      let newFeatureNumber = data[0].substr(1);
      let newId = data[1];

      let newFxTestElement = `<div class="list-group" style="margin-bottom:5px" id="main-test-node-${newFeature}-${newId}">
                  <span class="list-group-item"><h5>Feature: ${newFeature}  Id:${newId} </h5></li>
                <!-- Sub Feature Item --> 
                <span class="list-group-item">
                  <div class="form-check form-check-inline" style="min-width: 100%">
                      <input type="checkbox" class="form-check-input test-check" name="test-input" id="test-input-id-${newId}" value="${newId}" style="margin-right:3%">
                      <div class="alert alert-primary" role="alert" style="width:100%"">
                         <p>Url goes here</p>
                      </div>
                      <!--<input type="text" class="form-control" id="url-id$" placeholder="http://www.sample.com" value="http://www.sample.com">-->
                  </div>
                </span>
                  <span class="btn-sm btn-primary edit-fx-test" style="margin-top: 10px; float: right;" data-toggle="modal" data-target="#fx-test-pass-edit-modal" id="test-pass-modal-id-${newId}">View/Edit Test Cases</span>
                  <!-- END -> Sub Feature Item -->
                </div>`;

      //let newChildId = `#main-test-node-${newFeature}-${newId}`; 

      // Obtain All test elements to find the correct one to append to
      let $fxTestElements = $("div[id*=main-test-node]");

      // If there are no main test nodes, add the first one.
      if ($fxTestElements.length < 1) {

        let $mainContainer = $("#fx-test-container div.checkbox");

        // TODO ADD TEST TEST
        $($mainContainer).after(newFxTestElement);
        return true;

      }

      let fxSubElementArray = []
      let fxTestExistsCount = 0;
      let fxparentFeature = [];

      $.each($fxTestElements, (key, value) => {

        let elementString = value.id;
        let fxElementArray = elementString.split('-');
        let id = fxElementArray[4];
        let feature = fxElementArray[3];
        let featureNumber = feature.substr(1);

        // Add the feature items to the sub element array if there are multiple/one elements
        if (newFeatureNumber == featureNumber) {
          fxSubElementArray.push(value);
          fxTestExistsCount += 1;
        }

        // Get the parent features as long as they are less than the new feature number 
        if (newFeatureNumber > featureNumber) {
          fxparentFeature.push(value);
        }

      });

      let parent = "";

      // If feature does not exist Get last parent element and place new element after
      if (fxTestExistsCount === 0) {

        // Add first feature or if feature < first feature number
        if (fxSubElementArray.length < 1 && fxparentFeature.length < 1) {

          console.log("first feature/first child added")
          parent = $("#fx-test-container div.checkbox");

        // add feature as last child of pre-existing feature
        } else {

          console.log("New fx added here.");
          parent = fxparentFeature[fxparentFeature.length - 1];
        }

      } else {

        console.log("feature as last child of pre-existing feature");
        
        parent = fxSubElementArray[fxSubElementArray.length - 1];

      }

      $(parent).after(newFxTestElement);
    }
  );
});

/***************************
 * Purpose: Submit Edit Functional Test 
 ****************************/

$("#editFxTest").submit(function(event) {
  console.log("edit fx function is called.");
  event.preventDefault(); // Prevents the page from refreshing
  let $this = $(this); // `this` refers to the current form element

  $.ajax({
    url: $this.attr("action"),
    type: 'PUT',
    data: $this.serialize(),
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    error: function(data) {
      console.log(data + "Ajax Edit call failed.");
    },
    success: function(testCases) {
      console.log("Test Edit Successfully Saved.");
      console.log("response obtained from put")
      $('.modal').modal('hide');
    }
  })


});

/***************************
 * Function: getTestCasesByFeature(this.value)
 * purpose: get test cases by feature after a  
 * user has selected from a dropdown (triggered by an onchange)
 ****************************/

function getTestCasesByFeature(feature) {

  return new Promise((resolve, reject) => {

    feature = {
      feature: feature
    }

    feature = JSON.stringify(feature);

    $.ajax({
      url: '/getTestCases',
      type: 'POST',
      data: feature,
      contentType: "application/json",
      error: function(data) {
        console.log(data + "------------ GET TEST CASES FAILED -----------------");
        reject(false)
      },
      success: function(testCases) {

        let testCaseContainer = $(".test-case-fx-container");
        $(testCaseContainer).empty();

        for (let i = 0; i < testCases.length; i++) {
          //console.log(testCases[i].TestCaseId);
          //console.log(testCases[i].TestCaseDescription);
          $(testCaseContainer).append(`<br><input class="form-check-input" type="checkbox" name="testCases" id="test-case-${testCases[i].TestCaseId}" value="${testCases[i].TestCaseId}">${testCases[i].TestCaseId} : ${testCases[i].TestCaseDescription}<br>`);
        }

        resolve(true);

      }
    })
  })
}
/***************************
 * Function: runContentTest()
 * purpose: Run content tests in parallel
 ****************************/

function runContentTest() {

  let testParamsJSON = getContentTestParameters();
  //console.log(testParamsJSON);

  $.ajax({
    url: '/run-test',
    type: 'POST',
    data: testParamsJSON,
    contentType: "application/json",
    error: function(data) {
      console.log(data + "Gherkin data has failed at ajax request response.");

    },
    success: function(data) {

      console.log(data);
      console.log("Successful post request.");

      data = JSON.parse(data);

      console.log("the test pass count is " + data.testpassCount);

    }
  })
}


function scheduleTest() {

  let testParamsJSON = getTestParameters();
  // testParamsJSON = JSON.parse(testParamsJSON);
  // console.log(testParamsJSON.languages);

  var dayOptions = document.getElementsByName('day');
  var day = "false";
  var timeOptions = document.getElementsByName('time');
  var time = "0";

  for (var i = 0; i < dayOptions.length; i++) {
    if (dayOptions[i].checked) {
      day = dayOptions[i].value;
      break;
    }
  }
  for (var s = 0; s < timeOptions.length; s++) {
    if (timeOptions[s].checked) {
      time = timeOptions[s].value;
      break;
    }
  }
  testParamsJSON = JSON.parse(testParamsJSON);
  testParamsJSON.day = day;
  testParamsJSON.time = time;
  testParamsJSON = JSON.stringify(testParamsJSON);

  $.ajax({
    url: '/add-to-schedule',
    type: 'POST',
    data: testParamsJSON,
    contentType: "application/json",

    error: function(data) {
      console.log(data + "Gherkin data has failed at ajax request response.");
    },

    success: function(data) {
      alert("Your test has been scheduled.");
      console.log("post request successful");
      // data = JSON.parse(data);
    }

  })
}

// Get a timestamp
function getTimeStamp() {

  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();

  let hr = today.getHours();
  let min = today.getMinutes();
  let sec = today.getSeconds();

  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  let timestamp = mm + '-' + dd + '-' + yyyy + ' ' + hr + ':' + min + ':' + sec;

  return timestamp;

}

// TODO write ajax get info for test Pass
function getInfo(id) {


  console.log("This is the id" + id);
  //let id = 

  /*
    $.ajax({
      url: '/stop-test',
      type: 'get',
      data: {
        testId: id
      },
      error: function(data) {
        console.log(data);
      },
      success: function(data) {

        console.log("Test was a success billbo");
        console.log(data);

      }
    })

    */

}

// Stop a test ajax Function
function stopTest(id) {

  $.ajax({
    url: '/stop-test',
    type: 'get',
    data: {
      testid: id
    },
    error: function(data) {
      console.log(data);

    },
    success: function(data) {

      console.log("Test stop was a success");
      console.log(data);

    }
  })
}

// Pending Deletion 
function exportLanguageSet() {

  alert("Results have been exported to QA Folder.");

  var arrayOfObjects = new Array();

  var checkboxes2 = document.getElementsByClassName('lang');

  for (var x = 0; x < checkboxes2.length; x++) {

    if (checkboxes2[x].checked == true) {
      var theLocale = checkboxes2[x].id;

      var obj = { "name": "all", "locale": theLocale };
      arrayOfObjects.push(obj);
    }
  }

  var finalObject = { "features": arrayOfObjects };
  var myJSON = JSON.stringify(finalObject);

  // Send data to server
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/export", true);
  xmlhttp.setRequestHeader("Content-type", "application/json");

  try {
    xmlhttp.send(myJSON);
  } catch (err) {
    console.log("AJAX error: " + err);
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      console.log(xmlhttp);
    }
  }
}


// Pending Deletion 
function exportAll() {

  alert("Results have been exported to QA Folder.");

  var arrayOfObjects = new Array();

  var obj = { "name": "all", "locale": "all" };
  arrayOfObjects.push(obj);

  var finalObject = { "features": arrayOfObjects };
  var myJSON = JSON.stringify(finalObject);

  // Send data to server
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/export", true);
  xmlhttp.setRequestHeader("Content-type", "application/json");

  try {
    xmlhttp.send(myJSON);
  } catch (err) {
    console.log("AJAX error: " + err);
  }

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      console.log(xmlhttp);
    }
  }
}


// Hid the all test cases on test runner page
function hideAllTC() {
  var box = document.getElementById("allTCs");
  box.style.display = 'none';
  // box.classList.toggle = 'note-icon-caret';
}


// These functions are being used on the test-case-editor page -------------------------
function showIt(ID) {
  var p = document.getElementById("gherkin");
  var gherk = document.getElementById("tcSelection").value;
  p.innerHTML = gherk;

  var p2 = document.getElementById("selectedID");
  var input = ID[ID.selectedIndex].id;
  p2.innerHTML = input;

  var p3 = document.getElementById("functionality");
  var selection = document.getElementById("tcSelection");
  var funct = selection.options[selection.selectedIndex].getAttribute("data-functional");
  p3.innerHTML = funct;
}

function editTc() { //this populates the boxes below the "Edit Selected Test Case" button with what the Gherkin currently is

  var hidden = document.getElementById("hiddenRow");
  hidden.setAttribute("style", "display:visible");
  document.getElementById("createGherkin").disabled = true;
  document.getElementById("deleteGherkin").disabled = true;

  var checkbox = document.getElementById("funcitonalCheckbox");
  var checked = document.getElementById("functionality").innerHTML;
  if (checked == "1") {
    checkbox.checked = true;
  } else {
    checkbox.checked = false;
  }


  var placement1 = document.getElementById("theID");
  var ID = document.getElementById("selectedID").innerHTML; //grab the TestCaseID from the hidden paragraph above
  placement1.innerHTML = ID;

  var placement2 = document.getElementById("theScenario"); //get the location under the "Scenario" heading
  var content2 = document.getElementById("gherkin").innerHTML;
  if (content2.indexOf('Then') > -1) {
    content2 = content2.substring(0, content2.indexOf('Then'));
  }
  if (content2.indexOf('When') > -1) {
    content2 = content2.substring(0, content2.indexOf('When'));
  }
  placement2.innerHTML = content2;

  var placement3 = document.getElementById("theGherkin");
  var content3 = document.getElementById("tcSelection").value;
  content3 = content3.replace(content2, ''); //this gets rid of the Scenario so that content3 only contains Gherkin 
  content3 = content3.replace("@javascript", ''); //this gets rid of the '@javascript' that is in some of these Gherkin strings
  // content3=content3.replace(/\n/,''); 
  placement3.innerHTML = content3;
  // getLive(content1);

  var buttons = document.getElementsByClassName("x");

  for (var q = 0; q < buttons.length; q++) {
    buttons[q].setAttribute("class", "btn btn-light locale-button x");
  }

  var string = '"';
  for (var x = 0; x < buttons.length; x++) {
    var buttonData = buttons[x].value;
    buttonData = buttonData.split(",");

    if (buttonData.indexOf(ID.toString(), 0) > -1) {
      buttons[x].setAttribute("class", "btn btn-warning locale-button x");
    }
  }
  detectClassSwitch();

}


function classSwitch(thisOne) {
  var currentID = thisOne.getAttribute("id");
  var currentClass = thisOne.getAttribute("class").toString();
  if (currentClass.indexOf("btn-warning") > -1) {
    thisOne.setAttribute("class", "btn locale-button x btn-danger");
  } else if (currentClass.indexOf("btn-danger") > -1) {
    thisOne.setAttribute("class", "btn locale-button x btn-warning");
  } else if (currentClass.indexOf("btn-light") > -1) {
    thisOne.setAttribute("class", "btn locale-button x btn-success");
  } else if (currentClass.indexOf("btn-success") > -1) {
    thisOne.setAttribute("class", "btn locale-button x btn-light");
  }

  //detectClassSwitch(currentClass);
}


function createTc() { //unhide the 'hiddenRow' section and put into it the basics of "scenario" and "when" - we then feed this to the database so that I can get an ID to display
  var hidden = document.getElementById("hiddenRow");
  hidden.setAttribute("style", "display:visible");
  document.getElementById("editGherkin").disabled = true;
  // document.getElementById("theID").innerHTML = "";
  var Scenario = document.getElementById("theScenario");
  Scenario.value = "Scenario:";
  var Gherkin = document.getElementById("theGherkin");
  Gherkin.value = "When ";
  var newPages = document.getElementsByClassName("x");
  for (var x = 0; x < newPages.length; x++) {
    newPages[x].setAttribute("class", "btn btn-light locale-button x");
  }
  var currentPages = document.getElementsByClassName("btn btn-warning locale-button x");
  for (var y = 0; y < currentPages.length; y++) {
    currentPages[y].setAttribute("class", "btn btn-light locale-button x");
  }
  var removePages = document.getElementsByClassName("btn locale-button btn-danger x");
  for (var r = 0; r < removePages.length; r++) {
    removePages[r].setAttribute("class", "btn btn-light locale-button x");
  }

  var newTestCase = { //  creating an object to feed into the database so that we can get an ID for the new TestCase
    "theID": "",
    "theScenario": Scenario.value,
    "theGherkin": "&nbsp" + Gherkin.value,
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
      document.getElementById("theID").innerHTML = (data);

    }
  })

  //setTimeout(function() { cleanGherkin(); }, 5000);
} //end createTc()


/************************
 * Function: detectClassSwitch()
 * Purpose: Look for class ".btn-warning" and counts how many exist. If none exists for feature page then it enables the delete test case button.
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function detectClassSwitch() {

  var count = 0;
  var total = 0;
  var elemList = "";

  var elem = document.querySelectorAll("#templatesID .btn-warning");

  for (var i = 0; i < elem.length; i++) {
    //elemList += elem[i].id + ", ";
    //console.log(elemList);
    count += 1;
    total = count;

  } // end for()

  if (total == 0) {
    document.getElementById("deleteGherkin").disabled = false;
  } else {
    // Do nothing!

  } // end if/else

  //console.log(total);

} // end detectClassSwitch()


/************************
 * Function: deleteTc()
 * Purpose: Deletes any test case thats selected from the TestCase table found in the test DB.  
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/

function deleteTc() {

  var select = document.getElementById("tcSelection").selectedIndex;
  var Id = document.getElementsByTagName("option")[select].getAttribute("id");

  var delConfirm = confirm("Are you sure you want to delete test result ID: " + Id + "?");

  if (delConfirm == true) {

    $.ajax({
      url: '/delete-test-case',
      type: 'POST',
      data: {
        Id: Id
      },
      error: function(data) {
        console.log(data + 'Test case did not delete.');

      }, // end error : function()
      success: function(data) {
        console.log(data);
        console.log("Test case deleted!");
        window.location = '/test-case-editor';

      } // end success : function()

    }) // end $.ajax
  } else {
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
    data: {
      id: id
    },
    error: function(data) {
      console.log(data + 'Gherkin did not clean.');

    }, // end error : function()
    success: function(data) {
      console.log(data);
      console.log("Gherkin cleaned!");

    } // end success : function()

  })

} // end cleanGherkin()

/************************
 * Function: exportGherkin()
 * Purpose: This function sends the data from the Test Case Editor page, through the express.js page to the postGherkin() function on test_case_editor.js where the database is accessed and updated 
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: May 2018
 ************************/
function exportGherkin() {

  var arrayOfObjects = new Array();
  var theCaseID = document.getElementById("theID").innerHTML;
  var newScenario = document.getElementById("theScenario").value;
  var newGherkin = document.getElementById("theGherkin").value;
  var isItChecked = 2;
  var newPagesArray = [];
  var removePagesArray = [];
  var theCheckbox = document.getElementById('funcitonalCheckbox').checked; //true or false for .checked
  if (theCheckbox) {
    // console.log("this one was checked");
    isItChecked = 1;
  } else {
    // console.log("this was NOT checked");
    isItChecked = 0;
  }

  var newPages = document.getElementsByClassName("btn locale-button x btn-success");
  for (var x = 0; x < newPages.length; x++) {
    newPagesArray[x] = newPages[x].innerHTML;
    newPagesArray[x] = newPagesArray[x].replace(/^[^f]*/, '');
    newPagesArray[x] = newPagesArray[x].replace(/[^\d+]+$/, '');
  }

  var removals = document.getElementsByClassName("btn locale-button x btn-danger");
  for (var q = 0; q < removals.length; q++) {
    removePagesArray[q] = removals[q].innerHTML;
    removePagesArray[q] = removePagesArray[q].replace(/^[^f]*/, '');
    removePagesArray[q] = removePagesArray[q].replace(/[^\d+]+$/, '');
  }

  var objBunnyEars = { //  for James and Aron  :P <- Blerggghaaahh
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


/************************
 * Function: updateUser()
 * Purpose: Updates the user's roles in database - Basic = 1 / Admin = 2.
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: June 2018
 ************************/

function updateUser() {
  var usersRadId = document.getElementsByName('updateUserRad');
  var usersRoles = document.getElementsByName('updateUserRoles');
  var usersId = 0;
  var usersRole = 0;

  for (var i = 0; i < usersRadId.length; i++) {

    if (usersRadId[i].checked === true) {
      //Id += usersRadId[i].value; //used for checkboxes
      usersId = usersRadId[i].value; //used for radio buttons
    } // end if
  } // end for()

  if (usersId != 0) {

    for (var j = 0; j < usersRoles.length; j++) {
      if (usersRoles[j].checked === true) {
        //Id += usersRadId[i].value; //used for checkboxes
        usersRole = usersRoles[j].value; //used for radio buttons
      } // end if
    } // end for()


    if ((usersRole == 1) || (usersRole == 2)) {

      $.ajax({
        url: "/updateUser",
        type: "POST",
        dataType: "text",
        data: {
          Id: usersId,
          role: usersRole
        },
        success: function(userName) {
          //console.log('success');
          if (usersRole == 1) {
            var updatedRole = 'Basic';
          } else if (usersRole == 2) {
            var updatedRole = 'Admin';
          }

          document.getElementById('updateConfirm').innerHTML = userName + ' has been updated to ' + updatedRole + ' role!';
          document.getElementById('updateConfirm').style.fontSize = "1.3em";
          document.getElementById('updateConfirm').style.fontWeight = "bold";
          document.getElementById('updateConfirm').style.color = "red";

        },
        error: function() {
          console.log('error');
        }

      }); // end .ajax()
    } else {
      alert("Please select a user's access: Basic or Admin");
    } // end nested if/else

  } else {
    alert("Please select a user!");
  } // end if/else

} // end updateUser()


/************************
 * Function: removeUser()
 * Purpose: Removes a user form the database. 
 * Author: Jennifer C Bronson, James Sandoval, Aron T Norberg
 * Date: June 2018
 ************************/

function removeUser() {

  var usersRadId = document.getElementsByName('removeUserRad');
  var userData = [];
  var usersId = 0;
  var userName = '';

  for (var i = 0; i < usersRadId.length; i++) {
    if (usersRadId[i].checked === true) {
      //Id += usersRadId[i].value; //used for checkboxes
      userData = usersRadId[i].value; //used for radio buttons
      usersId = userData.slice(0, 2);
      userName = userData.slice(2);
    } // end if
  } // end for()


  if (usersId != 0) {

    var delConfirm = confirm("Are you sure you want to delete user: " + userName + "?");

    if (delConfirm == true) {

      $.ajax({
        url: "/removeUser",
        type: "POST",
        dataType: "text",
        data: {
          Id: usersId
        },
        success: function(userName) {
          //console.log('success');
          document.getElementById('removeConfirm').innerHTML = userName + ' has been removed!';
          document.getElementById('removeConfirm').style.fontSize = "1.3em";
          document.getElementById('removeConfirm').style.fontWeight = "bold";
          document.getElementById('removeConfirm').style.color = "red";

        },
        error: function() {
          console.log('error');
        }

      }); // end .ajax()

    } else {
      //alert('Delete canceled!');
    } // end nested if/else

  } else {
    alert("Please select a user!");

  } // end if/else

} // end removeUser()

/***********************************************************************
 ***  DOCUMENTATION SCRIPTS - BEGIN
 ***********************************************************************/

function showMore(something, theButton) {
  var theThing = document.getElementById(something);
  theThing.style.display = "block";
  var myButton = document.getElementById(theButton);
  myButton.style.display = "none";
}

function showLess(something, theButton) {
  var theThing = document.getElementById(something);
  theThing.style.display = "none";
  var myButton = document.getElementById(theButton);
  myButton.style.display = "block";
}

/***********************************************************************
 ***  DOCUMENTATION SCRIPTS - END
 ***********************************************************************/


/***********************************************************************
 ***  PAGE LOADING SCRIPTS - BEGIN
 ***********************************************************************/
// The below functions are used when transitioning to a new page
// - all pages

function uncheckAll() {
  var w = document.getElementsByTagName('input');
  for (var i = 0; i < w.length; i++) {
    if (w[i].type == 'checkbox') {
      w[i].checked = false;
    }
  }
}

function loadingAnimation() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("page").style.display = "none";
  // alert("This might take a moment.  Hit OK");
}

/***********************************************************************
 ***  PAGE LOADING SCRIPTS - END
 ***********************************************************************/
