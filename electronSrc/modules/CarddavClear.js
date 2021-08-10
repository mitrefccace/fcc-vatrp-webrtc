const { ipcMain } = require('electron')
const dav = require('dav');
const fetch = require('node-fetch');

//dav.debug.enabled = true;
let base64 = require('base-64');
ipcMain.on('CarddavClear', function(event, serverURL, username, password){
  var xhr = new dav.transport.Basic(
    new dav.Credentials({
      username: username,
      password: password
    })
  );

  var client = new dav.Client(xhr);
  client.createAccount({
    server: serverURL,
    accountType: 'carddav',
    loadCollections: true,
    loadObjects: true
  })
  .then(function(account){
    event.sender.send('clearAccount');

    let addressBook = account.addressBooks[0];
    //Send updated vcard to Carddav server
    var myHeaders = new Headers();
    myHeaders.append("Authorization", 'Basic ' + base64.encode(username + ":" + password));
    myHeaders.append("Content-Type", "text/plain");

    var requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: "BEGIN:VCARD\nVERSION:3.0\nEND:VCARD",
      redirect: 'follow'
    };
    fetch(addressBook.url,requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => {
        console.log('error', error)
        event.sender.send('FailedDavClear', 'Error clearing Carddav addressbook');
      });
  })
});