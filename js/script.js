//console.log(testData);

var content=[];

var headingIndex = 0;
for (cellData in testData) {
  document.getElementById("cellNameTemplate").innerText = testData[cellData]["name"];
  document.getElementById("cellImageTemplate").className = ("menu-sprite b"+ cellData);
  document.getElementById("cellNumberTemplate").innerText = testData[cellData]["num"];
  var cellTemplate = document.getElementById("cellTemplate").outerHTML;
  content.push(cellTemplate);
  
  headingIndex++;
  console.log(headingIndex);
  if (headingIndex >= 30){
    headingIndex = 0;
    content.push(document.getElementById("headingTemplate").outerHTML);
  }
}
content.push(document.getElementById("spacerTemplate").outerHTML);
content = content.join("");
console.log(headingIndex);
document.getElementById('content').innerHTML = content;




