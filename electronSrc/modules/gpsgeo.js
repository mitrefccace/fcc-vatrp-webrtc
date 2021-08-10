const { ipcMain } = require('electron')
const http = require('http');

ipcMain.on('gpsgeo', function(event, url, longitude,latitude, espg){
      const data =
        '<location-info>' +
          '<Point xmlns="http://www.opengis.net/gml" srsName="urn:ogc:def:crs:ESPG::' + espg + '">' +
            '<pos>' + longitude + ' ' + latitude + '</pos>' + 
          '</Point>' + 
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
      console.dir(options)
      const req = http.request(options, (res) => {
        res.on('data', (chunk) => {
          event.reply('successgps');
        })
      });

      req.on('error', (error) => {
        event.reply('failedgps');
      });

      req.write(data);
      req.end();
    })
