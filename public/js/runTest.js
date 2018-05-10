// Invoke 'strict' JavaScript mode
'use strict';

function getTimeStamp(){

  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth()+1; //January is 0!
  let yyyy = today.getFullYear();

  let hr = today.getHours();
  let min = today.getMinutes();
  let sec = today.getSeconds();
 
  if(dd<10) {
      dd = '0'+dd
  } 

  if(mm<10) {
      mm = '0'+mm
  } 

  let timestamp = mm + '-' + dd + '-' + yyyy + ' ' + hr + ':' + min + ':' + sec;

  return timestamp;

}

function getInfo(id) {


  console.log("This is the id"+ id);
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
  let checkedLangs =[];
  let checkedFeats = [];

  for(var q = 0; q<langCheckboxes.length; q++){
    if (langCheckboxes[q].checked == true){
      checkedLangs.push(langCheckboxes[q].id);
    }
  }
  //console.log(checkedLangs);

  for(var x=0; x<featureCheckboxes.length; x++){
    if(featureCheckboxes[x].checked == true){
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

function exportSelections(){

  let template = '';
  let language = '';
  let testresult = "";
  let query = "";
  let thehref = "";

  let TchildCount= document.getElementById("pageChildren").children.length;
  let LchildCount= document.getElementById("langChildren").children.length;

  template = document.getElementById("pageChildren").children[0].id; // this takes the first child and puts it in 'template'
  template = template.slice(0,-1);

  for (var x=1; x < TchildCount; x++){  // if there are additional children, we add a comma and the feature page for each child
    let t = document.getElementById("pageChildren").children[x].id; 
    t=t.slice(0,-1);
    template=template + "," + t;
  }
  
  
  language = document.getElementById("langChildren").children[0].id; // this takes the first language child and puts it in 'language'
  language = language.slice(0, -1);

  for (var y=1; y < LchildCount; y++){  // if additional languages were chosen, we add a comma and the language for each one selected
    let l = document.getElementById("langChildren").children[y].id; 
    l=l.slice(0,-1);
    language =language + "," + l;
  }
  
  var testdate = document.getElementById("dateChild").children[0].id;
  testdate = testdate.slice(0, -1);

  //the href will contain a list of each languages as 'en-us,de-de' and features will be 'f1,f3,f5' 
  // in the getExportFromResults() function on 'api_export.js' these commas are watched for, so that the string can be split to an array and a query created for all the selections


  //thehref="/export?feature="+ template + "&language=" + language + "&testresult=" + testresult + "&query=" + query + "&testpassid=" + testdate;
  thehref="/export?feature="+ template + "&language=" + language + "&testresult=" + testresult + "&query=" + query + "&testpassid=" + testdate;
  document.getElementById("myhref").href=thehref;
}
