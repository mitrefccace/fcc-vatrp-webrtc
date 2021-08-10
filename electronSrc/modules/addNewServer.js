const { ipcMain } = require('electron')
const fetch = require('node-fetch');
ipcMain.on('addNewServer', function(event, url){

  fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })
    .then((response) => {
      return response.json();
    }).then((fetchJson) => {
      //Returns the obtained json
      event.reply('obtainedServers', fetchJson);
    }).catch((e) => {
      console.log("Error: " + e);
      event.sender.send('failedAddServer', 'Please check the URL of remote server');            
    });

});
