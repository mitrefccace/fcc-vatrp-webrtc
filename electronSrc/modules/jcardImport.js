const { ipcMain } = require('electron')
const fetch = require('node-fetch');
ipcMain.on('jcardImport', function(event, serverUrl){
  fetch(serverUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  }).then((response) => {
    return response.json();
  }).then((fetchJson) => {
    event.sender.send('obtainedJcard', fetchJson);
    return fetchJson;
  }).catch((e) => {
    console.log("Error: " + e);
    event.sender.send('failedJcardimport')
  })
});