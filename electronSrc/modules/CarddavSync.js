const { ipcMain } = require('electron')
const dav = require('dav');
const fetch = require('node-fetch');
let vCard = require('vcf');

//dav.debug.enabled = true;
let base64 = require('base-64');
var newContact;
//var contactNumber = [];
ipcMain.on('CarddavSync', function(event, serverURL, username, password, contacts, uniqueID){
  var xhr = new dav.transport.Basic(
    new dav.Credentials({
      username: username,
      password: password
    })
  );
  
  var client = new dav.Client(xhr);
  //No transport argument.  Test with https://aceconfig.task3acrdemo.com/radicale/
  client.createAccount({
    server: serverURL,
    accountType: 'carddav',
    loadCollections: true,
    loadObjects: true
  })
  .then(function(account){
    //event.sender.send('SuccessSync');
    let addressBook = account.addressBooks[0];
    //newID = addressBook.objects[0];//vc.addressData.length;
        
    var myHeaders = new Headers();
    myHeaders.append("Authorization", 'Basic ' + base64.encode(username + ":" + password));

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    fetch(addressBook.url,requestOptions)
      .then(response => response.text())
      .then(result => {
        var duplicate = false;
        if(result !== ""){
          var cards = vCard.parse(result);
          console.log('Remote cards: ' + cards.length + ' Local contacts: ' + contacts.length);                
          for(var i = 0; i < cards.length; i++){
            event.sender.send('SyncProgress', 'remote', i+1, cards.length);
            //console.log('Number of items in Remote card ' + cards[i].numbers.length);                            
            //console.log('Syncs: ' + (i+1) + ' of: ' + cards.length);                            
            for(var l = 0; l < contacts.length; l++){
                if(cards[i].get('tel') && typeof cards[i].get('tel').valueOf() != 'string' &&
                cards[i].get('tel').valueOf()[0].toString().replace(/^\D+/g, '') === contacts[l].numbers[0].number){
                  console.log('Comparing ' + cards[i].get('tel').valueOf()[0].toString().replace(/^\D+/g, '') + ' ' + contacts[l].numbers[0].number);
                  //console.log('Also comparing ' + cards[i].get('fn').valueOf() + ' and ' + contacts[l].name);
                  if(contacts[l].name === cards[i].get('fn').valueOf()){
                    console.log('Has same name for ' + cards[i].get('fn').valueOf())
                    duplicate = true;
                  }
                }
                else if(cards[i].get('tel') && cards[i].get('tel').valueOf().toString().replace(/^\D+/g, '') === contacts[l].numbers[0].number){
                  if(contacts[l].name === cards[i].get('fn').valueOf()){
                    duplicate = true;
                    //console.log('same telphone for ' + cards[i].get('fn').valueOf())
                  }
                }
            }
            //console.log('Duplicate flag: ' + duplicate + ' Local contacts: ' + contacts.length);                            
            if(!duplicate || contacts.length === 0){
              console.log('Not a duplicate or no local contact - update local');      
              //Need to format based on card format
              var contactNumber = [];
              if(cards[i].get('tel') && typeof cards[i].get('tel').valueOf() != 'string'){
                for(var m = 0; m < cards[i].get('tel').length; m++){
                  contactNumber.push({'number' : cards[i].get('tel').valueOf()[m].toString().replace(/^\D+/g, ''), 'type' : 'Home'})
                  console.log('contactNumber m ' + cards[i].get('tel').valueOf()[m].toString().replace(/^\D+/g, ''));                            
                }
                console.log('Number of items m ' + m+1);                            
              }else if(cards[i].get('tel') && typeof cards[i].get('tel').valueOf() === 'string'){
                contactNumber = [{'number' : cards[i].get('tel').valueOf().replace(/^\D+/g, ''), 'type' : 'Home'}];
                console.log('contactNumber string ' + cards[i].get('tel').valueOf().replace(/^\D+/g, ''));                            
              }else{
                contactNumber = [{'number' : 0, 'type ' : 'Home'}];
              }

              newContact = {
                name: cards[i].get('fn') ? cards[i].get('fn').valueOf() : "",
                numbers: contactNumber,
                uniqueID: uniqueID
              }
              console.log('Creating new local contact: ' + newContact.name + " numbers " + newContact.numbers.length );                                                
              uniqueID++;
              console.log('Adding to local contacts list size before add: ' + contacts.length);                    
              contacts.push(newContact);
            }else{
              duplicate = false;
            }
          }



        //console.log("Contacts is now " + JSON.stringify(contacts));
        //event.sender.send('syncedContacts', uniqueID, contacts);
        //Convert JSON array to vcard

        var stringCard = '';
        //console.log('Array is ' + vcardArray.toString('4.0'));
        for(var j = 0; j < contacts.length; j++){
          stringCard += 'BEGIN:VCARD\nVERSION:4.0\nFN:' + contacts[j].name + '\n';
          for(var k = 0; k < contacts[j].numbers.length; k++){
            stringCard += 'TEL;TYPE=' + contacts[j].numbers[k].type + ';VALUE=uri:tel:' + contacts[j].numbers[k].number + '\n';
          }
          stringCard += 'END:VCARD\n';
        }
        console.log('String card is ' + stringCard);
      }else { //Occurs when vcard is ""
          console.log('No entries on the Remote CardDAV Server Address Book but look for local contacts that could be uploaded to remote CardDAV Server');      
          //stringCard = 'BEGIN:VCARD\nVERSION:4.0\nEND:VCARD\n';
          stringCard = '';
          if (contacts.length > 0) {
            for (var j = 0; j < contacts.length; j++) {
              event.sender.send('SyncProgress', 'local', j+1, contacts.length);              
              stringCard += 'BEGIN:VCARD\nVERSION:4.0\nFN:' + contacts[j].name + '\n';
              for (var k = 0; k < contacts[j].numbers.length; k++) {
                stringCard += 'TEL;TYPE=' + contacts[j].numbers[k].type + ';VALUE=uri:tel:' + contacts[j].numbers[k].number + '\n';
              }
              stringCard += 'END:VCARD\n';
            }
            console.log('String card is ' + stringCard);
            event.sender.send('syncedContacts', uniqueID, contacts);
          } else {
            console.log('There are no contacts in the local Address Book either. No sync action taken');
            event.sender.send('noSync', uniqueID, contacts);
          }
      }


        //Send updated vcard to Carddav server
        var myHeaders = new Headers();
        myHeaders.append("Authorization", 'Basic ' + base64.encode(username + ":" + password));
        myHeaders.append("Content-Type", "text/plain");
        //var newcard = "BEGIN:VCARD\nVERSION:3.0\nFN:Test3\nEND:VCARD\nBEGIN:VCARD\nVERSION:3.0\nFN:Hello World\nTEL;TYPE=Home;VALUE=uri:tel:1234567890\nEND:VCARD";


        var requestOptions = {
          method: 'PUT',
          headers: myHeaders,
          body: stringCard,
          redirect: 'follow'
        };

        fetch(addressBook.url,requestOptions)
          .then(response => response.text())
          .then(result => {
            console.log(result)
//            event.sender.send('SuccessSync');
              event.sender.send('syncedContacts', uniqueID, contacts);
          })
          .catch(error => {
            console.log('error', error)
            event.sender.send('FailedSync', 'Error updating CardDAV addressbook');
          });
      event.sender.send('SuccessSync', contacts.length + ' contacts updated');

    //objects.addressData = vcardArray.toString('4.0');
    })//the .then
    .catch((error) => {
      console.error('Error:', error);
      event.sender.send('FailedSync', 'Error fetching addressbook');
    });
  })
  .catch((error) => {
    console.error('Error:', error);
    event.sender.send('FailedSync', 'Error contacting CardDAV server');
  });

});