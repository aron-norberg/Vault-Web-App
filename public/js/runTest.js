'use strict';
// Invoke 'strict' JavaScript mode
// Socket Connections for running tests // 

let socket = io.connect('/');

socket.on('test-run', function(msg) {

  // Remove temporary loading row

  if (msg.includes("start-id")) {

    console.log(msg);

    $(".temp-loader-row").empty().remove(); // removes the row and the contents within row

    let timestamp = getTimeStamp()
    let id = msg.replace("start-id:", "");

    let $cell1 = `<td>${id}</td>`;
    let $cell2 = `<td>${timestamp}</td>`;
    let $cell3 = '<td><span class="dot-light-on"></span></td>';
    let $cell4 = `<td><button type="button" class="btn btn-sm btn-primary" onclick="getInfo(${id})">Info</button></td>`;
    let $cell5 = `<td><button type="button" class="btn btn-sm btn-danger" onclick="stopTest(${id})">Stop</button></td>`;

    let $newRow = $('#test-status-table').prepend($(`<tr id="${id}">`));

    $newRow = $(`#${id}`);

    let $newRowItem = $($newRow).hide().prepend($cell1 + $cell2 + $cell3 + $cell4 + $cell5).fadeIn(1000);
    document.getElementById("notice").innerHTML="";

  } else if (msg.includes("complete-id")) {

    console.log(msg);

    let id = msg.replace("complete-id:", "");

    let $oldRow = $(`#${id}`);

    $($oldRow).empty().remove(); // removes the row and the contents within row

  }

});


// Socket Connections end here //


// test run Selection Functions //


// this needs work - it currently removes the checkboxes
// $(document).ready(function(){
//     $("#langSearch").on("keyup", function() {
//         var value = $(this).val().toLowerCase();
//         $("#myUL *").filter(function() {
//         $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
//         });
//     });
// });

let langArrayTestRunner = document.getElementsByClassName('lang double');
let templateArray = document.getElementsByClassName("form-check-input double");

let langParagraph = document.getElementById("chosenLangs");
let tcParagraph = document.getElementById("chosenTestCases");
let templateParagraph = document.getElementById("selectedTemplates");
let urlParagraph = document.getElementById("selectedURLs");

let templateButton = document.getElementById("tb");
let testCaseButton = document.getElementById("tcb");
let urlButton = document.getElementById("url");
let descriptionBox = document.getElementById("description");

let noticeBox = document.getElementById("notice");

let node = document.createElement("LI");

function grabTCsForFeature() {

  let reader = new FileReader();
  let templateParagraph = document.getElementById("selectedTemplates");
  let template = templateParagraph.innerHTML.toLowerCase();

  //console.log(template);
  template = template.slice(16); //this cuts out the "template: " part, including the &nbsp - space

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
      console.log("successful response from test case request")
      for (var x = 0; x < data.length; x++) {
        var node = document.createElement("LI"); // Create a <li> node
        node.setAttribute("class", "list testcasechoice");
        var span = document.createElement("SPAN");
        var inputItem = document.createElement("input");
        inputItem.setAttribute("class", "double testcasechoice");
        inputItem.setAttribute("type", "checkbox");
        inputItem.setAttribute("onclick", "displayChecked(this.id, 'theTestCases', 'TCAll', 'chosenTestCases', 'p')");
        var mystring = " " + data[x].TestCaseId + " | " + data[x].TestCaseDescription;
        console.log("mystring is "+mystring);
        inputItem.setAttribute("id",mystring);

        var textnode = document.createTextNode(mystring); // Create a text node
        node.appendChild(span);
        span.appendChild(inputItem);
        span.appendChild(textnode); // Append the text to <li>
        document.getElementById("theTestCases").appendChild(node); // Append <li> to <ul> with id="myList"
      }
    }
  })
}

// function showLangs() { //this shows the languages selected in the selections area
//   langParagraph.innerHTML = "Languages: ";
//   for (var x = 0; x < langArrayTestRunner.length; x++) {
//     if (langArrayTestRunner[x].checked == true) {
//       langParagraph.innerHTML = langParagraph.innerHTML + "&nbsp" + langArrayTestRunner[x].id + ", ";
//       templateButton.removeAttribute("disabled");
//     }
//   }
// }
function unhideTemplates(){ //this function unhides the Template button
  console.log("number of items with class is lang double = " +langArrayTestRunner.length);
  for (var x = 0; x < langArrayTestRunner.length; x++) {
    if (langArrayTestRunner[x].checked == true) {
      templateButton.removeAttribute("disabled");
    }
  }

}


function showTemplates() {
  let langParagraphLength = document.getElementById("chosenLangs").innerHTML;
  templateParagraph.innerHTML = "Template: ";
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
  // tcParagraph.innerHTML = "Test Cases: ";

  testCaseButton.removeAttribute("disabled");
  urlButton.removeAttribute("disabled");
  grabTCsForFeature();
}

// function showTCs() {
//   // let testCaseArray = document.getElementsByClassName("list testcasechoice");
//   // let caseCheckboxes = document.getElementsByClassName("double testcasechoice");
//   // // tcParagraph.innerHTML = "Test Cases: ";
//   // for (var x = 0; x < testCaseArray.length; x++) {
//   //   if (caseCheckboxes[x].checked == true) {
//   //     tcParagraph.innerHTML = tcParagraph.innerHTML + "<br>" + testCaseArray[x].innerText;
//   //   }
//   // }
// }

function showInput() {
  let box = document.getElementById("typedURL");
  box.setAttribute("style", "display:block;");

}

function showURLChoice() {

  let urlChoiceArray = document.getElementsByClassName("aURL");
  urlParagraph.innerHTML = "URLs: ";
  for (var y = 0; y < urlChoiceArray.length; y++) {
    if (urlChoiceArray[y].checked == true) {
      urlParagraph.innerHTML = urlParagraph.innerHTML + urlChoiceArray[y].parentElement.innerText;
    }
  }
  let typedInURL = document.getElementById("enteredURL").value;
  console.log(typedInURL);
  if (typedInURL.length > 0) {
    console.log("something was typed");
    urlParagraph.innerHTML = "URLs: " + typedInURL;
  }
}

function runit() {

  let description = descriptionBox.value;
  // console.log("description = "+description);
  let spans = langParagraph.childNodes;
  let langArray = [];
  for (var x =0; x<spans.length; x++){
    var y = spans[x].innerText.slice(0,-2);
    y = y.replace(/ /g, "");
    langArray.push(y);
  }
  // console.log("langArray is -"+langArray);
  var langs = langArray.toString();
  langs = langs.replace(/\s/g, "");
  langs = langs.split(",");
  // console.log(langs[0].length +" langs = " + langs);

  let temp = templateParagraph.innerHTML.substring(9);
  temp = temp.replace(/&nbsp;/g, "");
  temp = temp.replace(/ /g, "");
  // console.log(temp.length+" temp = " + temp);

  let tcs = tcParagraph.innerHTML;
  tcs = tcs.replace(/\<p\sid=\"/g,"");
  tcs = tcs.replace(/ /g, "");
  let tcIDs = tcs.split("\">");
  for (var x = 0; x < tcIDs.length; x++) {
    tcIDs[x] = tcIDs[x].split("\|")[0];
  }
  // console.log(tcIDs);
  tcIDs.shift();
  // console.log(tcIDs.length +" tcIDs = " + tcIDs);

  let urlChoices = urlParagraph.innerHTML.substring(7)
  urlChoices = urlChoices.replace(/&nbsp;/g, "");
  urlChoices = urlChoices.replace(" URLs", "");
  // console.log(urlChoices.length+" urlChoices = " + urlChoices);
  if(langs.length == 0 ||tcIDs.length ==0 || urlChoices.length ==0){
    if (langs[0].length ==0){
      alert("Please select at least one language to test.");
    }
    if (tcIDs.length ==0){
      alert("Please select at least one test case to run.");
    }
    if (urlChoices.length ==0){
      alert("Please make a URL selection.");
    }
    return;
  }
  else{
    noticeBox.innerHTML=" one moment... ";
  }

  let modalObject = {
    "languages": langs,
    "features": temp,
    "TestCaseSelections": tcIDs,
    "Urls": urlChoices,
    "description": description
  };

  let object = JSON.stringify(modalObject);

  console.log(object);

  
  $.ajax({
    url: '/run-test',
    type: 'POST',
    data: object,
    contentType: "application/json",
    error: function(data) {
      console.log(data);
    },
    success: function(data) {
      console.log(data);
      console.log("Successful post request.");
      
    }
  })

}

/* Test Run Function Ends Here */


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



function runTest() {


  let arrayOfObjects = new Array();
  let featureCheckboxes = document.getElementsByClassName('FX');
  let langCheckboxes = document.getElementsByClassName('lang');
  let checkedLangs = [];
  let checkedFeats = [];

  for (var q = 0; q < langCheckboxes.length; q++) {
    if (langCheckboxes[q].checked == true) {
      checkedLangs.push(langCheckboxes[q].id);
    }
  }
  //console.log(checkedLangs);

  for (var x = 0; x < featureCheckboxes.length; x++) {
    if (featureCheckboxes[x].checked == true) {
      checkedFeats.push(featureCheckboxes[x].id);
    }
  }
  //console.log(checkedFeats);

  //We will move to Phase2 after we build in Test Case Selection, and URL selection
  let phase1 = {
    "features": checkedFeats,
    "languages": checkedLangs
  };

  // var Phase2 = {
  //   "languages": "xx",
  //   "features": "xx",
  //   "TestCaseSelections":["F1":"all", "F2":"all", "F3":"1"],
  //   "NumOfUrls":["F1":"all", "F2":"all", "F3":"1"],
  //   "Urls":"xx",
  //   }; 


  let testParamsJson = JSON.stringify(phase1);

  console.log(testParamsJson);

  $.ajax({
    url: '/run-test',
    type: 'POST',
    data: testParamsJson,
    contentType: "application/json",
    error: function(data) {
      console.log(data);
    },
    success: function(data) {
      console.log(data);

      let $newRow = $('#test-status-table').append($(`<tr><td colspan="5" class="temp-loader-row">`));

      $(".temp-loader-row").hide().text("...Loading New Test Data").fadeIn(100);

    }
  })
};

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

function hideAllTC(){
  var box = document.getElementById("allTCs");
  box.style.display = 'none';
  // box.classList.toggle = 'note-icon-caret';
}


// function exportSelections() {

//   let template = '';
//   let language = ''; 
//   let testresult=""; 
//   let query = ""; 
//   let thehref="";
//   let testdate="";

//   let TchildCount = document.getElementById("pageChildren").children.length;
//   let LchildCount = document.getElementById("langChildren").children.length;

//   template = document.getElementById("pageChildren").children[0].id; // this takes the first child and puts it in 'template'
//   template = template.slice(0, -1);

//   for (var x = 1; x < TchildCount; x++) { // if there are additional children, we add a comma and the feature page for each child
//     let t = document.getElementById("pageChildren").children[x].id;
//     t = t.slice(0, -1);
//     template = template + "," + t;
//   }


//   language = document.getElementById("langChildren").children[0].id; // this takes the first language child and puts it in 'language'
//   language = language.slice(0,-1);
//   if (language == "LAll"){
//     language = "All"
//   }

//   for (var y = 1; y < LchildCount; y++) { // if additional languages were chosen, we add a comma and the language for each one selected
//     let l = document.getElementById("langChildren").children[y].id;
//     l = l.slice(0, -1);
//     language = language + "," + l;
//   }

//   testdate = document.getElementById("dateChild").children[0].id;
//   testdate = testdate.slice(0, -1);
//   console.log(testdate +"---------------------------------------------------");

//   //the href will contain a list of each languages as 'en-us,de-de' and features will be 'f1,f3,f5' 
//   // in the getExportFromResults() function on 'api_export.js' these commas are watched for, so that the string can be split to an array and a query created for all the selections

//   thehref="/export?feature="+ template + "&language=" + language + "&testresult=" + testresult + "&query=" + query + "&testpassid=" + testdate;
//   document.getElementById("myhref").href=thehref;
// }


