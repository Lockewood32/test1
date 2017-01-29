//console.log(testData);

var content=[];

for (cellData in testData) {
  document.getElementById("cellNameTemplate").innerText = testData[cellData]["name"];
  document.getElementById("cellImageTemplate").className = ("menu-sprite b"+ cellData);
  document.getElementById("cellNumberTemplate").innerText = testData[cellData]["num"];
  var cellTemplate = document.getElementById("cellTemplate").outerHTML;
  content.push(cellTemplate);
}
content.push(document.getElementById("headingTemplate").outerHTML);
content.push(document.getElementById("spacerTemplate").outerHTML);
content = content.join("");

document.getElementById('content').innerHTML = content;





