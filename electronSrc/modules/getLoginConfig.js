const { ipcMain } = require('electron')
const fetch = require('node-fetch');
ipcMain.on('getLoginConfig', function(event, url){

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
      event.reply('obtainedLoginConfig', fetchJson);
    }).catch((e) => {
      console.log("Error: " + e);
      event.sender.send('failedLoginConfigServer', 'Please check the URL of remote login server');
    });

});
