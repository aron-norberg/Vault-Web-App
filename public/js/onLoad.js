// Invoke 'strict' JavaScript mode
'use strict';

 function uncheckAll(){ 
      var w = document.getElementsByTagName('input'); 
      for(var i = 0; i < w.length; i++){ 
        if(w[i].type=='checkbox'){ 
          w[i].checked = false; 
        }
      }
  } 



  function loadingAnimation() {
    document.getElementById("loading").style.display = "block";
    document.getElementById("page").style.display = "none";
    // alert("This might take a moment.  Hit OK");
  }


  function dashboardPage() {
    var dashboardTitle = document.getElementById('h2Title').innerHTML;

    if (dashboardTitle === 'Dashboard') {
      //document.getElementById('dashboard-1').style.display = "block";
      document.getElementById('dashboard-2').style.display = "none";
    }
    else {
      document.getElementById('dashboard-1').style.display = "none";
      //document.getElementById('dashboard-2').style.display = "block";
    }

  } // end dashboardPage()


  function loadTester(){
    alert("hello");
    document.getElementById("loading").style.display = "block";
  }
