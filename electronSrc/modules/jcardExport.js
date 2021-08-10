const { ipcMain } = require('electron')
const fetch = require('node-fetch');
ipcMain.on('jcardExport', function(event, serverURL, jcard){
  fetch(serverURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(jcard),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    event.sender.send('sentJcard');
  })
  .catch((error) => {
    console.error('Error:', error);
    event.sender.send('failedJcardexport', error);
  });
});