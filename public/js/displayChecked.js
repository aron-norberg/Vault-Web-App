// Invoke 'strict' JavaScript mode
'use strict';


function displayChecked(checkedID, ULID, allID, destinationID, element) {


	var checkBox = document.getElementById(checkedID);  // Get the selected item
	var parentClass=checkBox.parentNode.parentNode.className; // grabs the UL's class
	var text = checkBox.parentNode.textContent; // Get the checkbox's text (in the <span>)
	var paragraph = document.createElement(element);  //create a paragraph
	var checkboxes = new Array();
	var allBox = document.getElementById(allID);
	var checkboxes = document.getElementsByTagName('input');
	var placement = document.getElementById(destinationID);

	if(placement.innerHTML && (!text.includes("all")) && destinationID != "chosenTestCases"){
		// Check if 
		text = ", " + text;
	}

	var content = document.createTextNode(text);   //create text (for the new paragraph)   

	// If the checkbox is checked, create a paragraph element and input the checkbox's text
	if (checkBox.checked == true){ 
		if (parentClass =="dropdown-item radial" && document.getElementById("radialChild").hasChildNodes()){//if a radio button was selected, remove any other radio choices from the display section
			document.getElementById("radialChild").innerHTML="";
		}

		//console.log(content);

		paragraph.appendChild(content);
		paragraph.setAttribute('id',checkedID+'x');
		placement.appendChild(paragraph);

		// if the ALL button was clicked, check every box and remove anything else from the paragraph section
		if (checkedID == allID){
			for(var i=0; i<checkboxes.length; i++){
				if(checkboxes[i].parentNode.parentNode.parentNode.id == ULID){// if the UL, above the Span and Input == ULID
					checkboxes[i].checked = true;
				}
			}				
			while (placement.firstChild){
				placement.removeChild(placement.firstChild);
			}
			placement.appendChild(paragraph);
				
		} else{}

	} else { // If you are un-checking the box, you will remove the child paragraph element that had been created.

			//If I'm un-checking the PAGE "all" box, uncheck ALL the boxes
			if (checkedID == allID){  
				for(var i=0; i<checkboxes.length; i++){
					if (checkboxes[i].parentNode.parentNode.parentNode.id == ULID){
						checkboxes[i].checked = false;  // un-check all the boxes 
					}
				}
				var child = document.getElementById(checkedID+'x'); 
				child.parentNode.removeChild(child); // and remove "all" under pages selected
			}	

			//If I'm un-checking anything other than the "all" boxes
			else if (checkedID != allID){ 
			//console.log("I'm not unchecking an All option" + checkedID + "--"+allID);

				//If the "all" box HAD been checked for the Feature Page section
				//console.log(allBox.id);
				if (allBox.checked == true){  // && ULID == ULID              <-----------???
				//console.log("I've unchecked something when ALL HAD been chosen");
					allBox.checked = false;  // un-check the "all" box and remove it from the pages selected section
					var allChild = document.getElementById(allID + "x");
					allChild.parentNode.removeChild(allChild);
					var eliminator = checkedID;  //note which page you were un-selecting
					
									
					//goes through all the possibilities, and if there was a checkbox for it, but it wasn't the ALL or Eliminator, add a paragraph for it
					for(var i=1; i<checkboxes.length-1; i++){
						if(checkboxes[i].checked && checkboxes[i].parentNode.parentNode.parentNode.id == ULID){
							var text = checkboxes[i].id;
							var paragraph = document.createElement(element);
							var placement = document.getElementById(destinationID);

							if(placement.innerHTML && (!text.includes("all"))){
								text = ", " + text;
							}

							var content = document.createTextNode(text);

							if (checkboxes[i].id != eliminator){
								paragraph.appendChild(content);
								paragraph.setAttribute('id',checkboxes[i].id+'x');
								placement.appendChild(paragraph);
							}
						}
					}
				}
				// if something other than "all" was un-checked, but "all" had not been checked, just remove the one item from pages selected
				else {  
				//console.log("I've unchecked something when ALL had NOT been selected" );
					var child = document.getElementById(checkedID+'x');
					child.parentNode.removeChild(child);
				}
				//console.log("the end");
			}  //end else if
		}  //end else
}
// function hide(thisID, targetID){
// 	var target = getElementById(targetID);
// 	var ThisItem = getElementById(thisID);
// 	if(ThisItem.checked == true){
// 		target.setAttribute('display','none');
// 	}
// 	else {
// 		target.setAttribute('display', 'block');
// 	}
// }