//setup the template data file ****************************************************************
  var STATUS = {
    GREEN : {value: "Done", color: "#9dee63"}, 
    YELLOW: {value: "Pending", color: "#eee063"}, 
    BLUE : {value: "Active", color: "#63d9ee"},
    RED: {value: "Inactive", color: "#ee6363"},
    CLEAR: {value: "", color: "#ffffff"}
  };
  var selectedStatus = STATUS.CLEAR;

  var FILENAME = 'appsettings.json';
  var fileId = null;
  var state = {  };
  var stateTemplate = {
    version: "0.4.7",
    testBox: {'001': 'NewData', '002': 'NewData', '003': 'Update', '004': 'four'},
  };
  
  function lookupColor(v){
    //get the status value of the cell from state, use to retrieve the matching color
    var c = STATUS.CLEAR.color;
    for (item in STATUS){
      //console.log(STATUS[item].value);
      if (STATUS[item].value == v){
        return STATUS[item].color;
      }
    }
    return c;
  }
 
  
  function getCellStatus(cell){
    //takes an html element
    //console.log(status);
    //return status;
  }
  function setCellStatus(cell, status){
    //takes an html element and a status object from STATUS
    state["testBox"][cell.id] = status.value;
    //console.log(cell.id);
    //console.log(state["testBox"][cell.id])
    setCellColor(cell, status);
  }
  function getCellColor(cell){
    //takes an html element
   console.log(cell.style.backgroundColor);
   //return color;
  }
  function setCellColor(cell,status){
    //takes an html element and a status object from STATUS
    //console.log(status);
    cell.style.backgroundColor = status.color;
  }
  function getSelectedStatus(){
    console.log(selectedStatus);
  }
  function setSelectedStatus(status){
    //takes status object from STATUS
    selectedStatus = status;
    document.getElementById("statusPicker").style.backgroundColor = status.color;
  }




  
  function resetData(){
    //state = stateTemplate;
    state = JSON.parse(JSON.stringify(stateTemplate));
    writeState();
    console.log(state);
  }
  
  function checkDataVersion(){
    var currentData = state;
    if ("version" in currentData){
      if (currentData.version < stateTemplate.version){
        var newData = JSON.parse(JSON.stringify(stateTemplate));
        for (id in stateTemplate["testBox"]){
          //newData.testBox[id] = ((id in currentData.testBox) ? currentData.testBox[id] : "test")
          if (id in currentData.testBox){
            newData.testBox[id] = currentData.testBox[id];
          }
          state = newData;
          writeState();
        }
        //console.log(newData);
      }
    } else {
      console.log("version info not found. resetting save data.");
      //if the savedata has no version, reset to blank template
      resetData();
      }
    
  }

  
  //console.log(state);
//transform the state data to the page **************************************  state: json, key: field in json(testbox), box: matching item for key?
  function stateToForm() {
    //console.log('doing state to form...');
    for(key in state) {
      if(key == "testBox") {
        for(box in state[key]) {
          $("#" + box).text(state[key][box]);
          //TODO: use the status from state to get the color, then set the cell's color to that.
          //console.log(state[key][box]);
          document.getElementById(box).style.backgroundColor = lookupColor(state[key][box]);
        }
     } else {
        $("#" + key).val(state[key]);
      }
    }
    $('#in').show();
  }
//transform the page data to the state ***************************************  
  function formToState() {
    console.log('doing form to state...');
    console.log(state);
    for(key in state) {
      if(key == 'checkbox') {
        for(box in state[key]) {
          state[key][box] = $("#checkbox" + box).prop("checked");
        }
        
      } else if (key == 'version'|| key == 'testBox'){
        //TODO: get rid of this workaround... it only exists to preserve the function of getting form data. since I write the state directly, this is wonky.
      
      } else {
        console.log("setting " + state[key] + ":" + $("#" + key).text() );
        state[key] = $("#" + key).val();
      }
    }
  }

  //assign functions to elements in the page using jquery *********************************************************************
  function loaded() {
    $('#settings').submit(function() {
      formToState();
      console.log(state);
      writeState();
      return false;
    });
    
    $('#discon').click(function() {
      var token = gapi.auth.getToken();
      var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' +
            token.access_token;
      $.ajax({
          type: 'GET',
          url: revokeUrl,
          async: false,
          contentType: "application/json",
          dataType: 'jsonp',
          success: function(nullResponse) {
            $('#myGsignin').show();
            $('#in').hide();
          }
        });
    })
  }
//hides sign in button on successful sign in ************************************
  function onSignIn(authResult) {
    //console.log(authResult);
    if (authResult['access_token']) {
      console.log("Signed in");
      $('#myGsignin').hide();

      gapi.client.load('drive', 'v2', function() {
        console.log('Loaded drive client');
        readState();
      });
    } else {
      console.log("Not signed in");
      $('#myGsignin').show();
    }
  }
  
  function checkFileId() {
    if(fileId != null) {
      return true;
    }
    var request = gapi.client.drive.files.list({
      'q': '\'appdata\' in parents'
    });
    request.execute(function(resp) {
      //console.log(resp);
      for (i in resp.items) {
        //console.log(resp.items[i]);
        if(resp.items[i].title == FILENAME) {
          fileId = resp.items[i].id;
          console.log('AppData file found, reading data...');
          readState();
          return;
        }
      }
      // If we have nothing, use the defaults.
      console.log('AppData file not found.');
      stateToForm();
    });
    return false;
  }
  
  function readState() {
    if (!checkFileId()) {
      return;
    }
    var request = gapi.client.drive.files.get({
      'fileId': fileId
    });
    request.execute(function(resp) {
        //console.log(resp);
        if (resp.id) {
          var token = gapi.auth.getToken();
          $.ajax(resp.downloadUrl, {
            headers: {Authorization: 'Bearer ' + token.access_token},
            success: function(data) {
              state = data;
              console.log("READING STATE");
              stateToForm();
              console.log(data);
            }
          });
        }
    });
  }

  function writeState() {
    gapi.client.load('drive', 'v2', function() {
      var metadata = { 
        title: FILENAME, 
        mimeType: 'application/json',
        parents: [{id: 'appdata'}]
      }
      //console.log("WRITING STATE");
      //console.log(state);
      
      data = new FormData();
      data.append("metadata", new Blob([ JSON.stringify(metadata) ], { type: "application/json" }));
      data.append("file", new Blob([ JSON.stringify(state) ], { type: "application/json" }));
      //console.log("attempting to write state...");
      //console.log(data);
      
      var token = gapi.auth.getToken();
      var up = fileId != null ? '/' + fileId : '';
      $.ajax("https://www.googleapis.com/upload/drive/v2/files" + up + "?uploadType=multipart", {
        data: data,
        headers: {Authorization: 'Bearer ' + token.access_token},
        contentType: false,
        processData: false,
        type: fileId != null ? 'PUT' : 'POST',
        success: function(data) {
          console.log("File written");
        }
      })
    });
  }
