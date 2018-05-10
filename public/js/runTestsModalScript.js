// Invoke 'strict' JavaScript mode
'use strict';

// These functions are being used on the runTestsModal.ejs page -------------------------


function grabTCsForFeature(){   

  let reader = new FileReader();
  let templateParagraph= document.getElementById("selectedTemplates");
  let template = templateParagraph.innerHTML.toLowerCase();
  template = template.slice(16);  //this cuts out the "template: " part, including the &nbsp - space

  var templateChoice = { //  creating an object to feed into the database so that we can get an ID for the new TestCase
      "theTemplate": template
  };
  var arrayOfObjects = new Array();
  arrayOfObjects.push(templateChoice);
  let finalObject = JSON.stringify(arrayOfObjects);
  // console.log(finalObject);
  // console.log(finalObject + "-----------this is the final object ------------");

  // This function sends the data from the runTestsModal page, per the express.js page to the getTestCases() function on runTestsModal.js where the database is accessed and updated
  $.ajax({
    url: '/getTestCases',
    type: 'POST',
    data: finalObject,
    contentType: "application/json",
    error: function(data) {
      console.log(data + "------------ it didn't work -----------------");
    },
    success: function(data) {
      // console.log(data);
      console.log("I got Test Case IDs from the database.");

      console.log("the data is: " + data.length);
      
      for (var x = 0; x<data.length; x++){
        var node = document.createElement("LI");                 // Create a <li> node
        node.setAttribute("class", "list testcasechoice");
        var inputItem = document.createElement("input");
        inputItem.setAttribute("class", "double testcasechoice");
        inputItem.setAttribute("type", "checkbox");

        var textnode = document.createTextNode("  " + data[x].TestCaseId + " | " +data[x].TestCaseDescription);         // Create a text node
        node.appendChild(inputItem);
        node.appendChild(textnode);                              // Append the text to <li>
        document.getElementById("theTestCases").appendChild(node);     // Append <li> to <ul> with id="myList"
      }
    }
  })


}