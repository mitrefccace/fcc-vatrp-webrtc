const { ipcMain } = require('electron')
const http = require('http');
ipcMain.on('civicgeo', function(event, url, streetState, city, streetName, streetType, postalCode){
  var data = 
        '<location-info>' +
          '<civicAddress xmlns="urn:ietf:params:xml:ns:pidf:geopriv10:civicAddr">' +
            '<country>US</country>' +
            '<A1>' + streetState + '</A1>' +
            '<A3>' + city + '</A3>' +
            '<RD>' + streetName + '</RD>' +
            '<STS>' + streetType + '</STS>' +
            '<HNO></HNO>' +
            '<PC>' + postalCode + '</PC>' +
          '</civicAddress>' +
        '</location-info>';

  const options = {
    hostname: '34.195.20.144',
    path: url,
    port: '443',
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64'),
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    res.on('data', (chunk) => {
      event.reply('successca');
    })
  });

  req.on('error', (error) => {
    event.reply('failedca');
  });

  req.write(data);
  req.end();
})