// Invoke 'strict' JavaScript mode
'use strict';
//pie
// Load google charts
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

// Draw the chart and set the chart values
function drawChart() {
  var data = google.visualization.arrayToDataTable([
  ['Test', 'Passed or Failed'],
  ['Passed', 8],
  ['Failed', 9],
  ['Other', 4],

]);

    // Optional; add a title and set the width and height of the chart
    // Options can be variables such as title: $Title
  var options = {
    'title': 'Cumulative Results',
    'colors': ['green', '#E2453C', 'grey'], 
    'backgroundColor':'', 
    'is3D': true,
    'chartArea':{width:'350', height:'80%'},
    'legend':{textStyle:{fontSize:20}, alignment: 'center', position: 'left'},
    'slices': { 0: {offset:0.0},
              1: {offset: 0.2},
              2: {offset: 0.0}}

  };

  // Display the chart inside the <div> element with id="pieChart"
  var chart = new google.visualization.PieChart(document.getElementById('pieChart'));
  chart.draw(data, options);
}