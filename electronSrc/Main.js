/* eslint-disable no-unused-vars */

//JZ: Copied from Electron docs, we'll want to do this better
const url = require('url');
const path = require('path');
const { app, BrowserWindow } = require('electron')
const serve = require('electron-serve')
const env = process.env.NODE_ENV;
//require('../config/env');
const envfile = require('envfile');
const http = require('http');
const fetch = require('node-fetch');
require('dotenv').config();
global.Headers = fetch.Headers;
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
const loadDir = serve({directory: 'build'});

function installDevTools(ext){
  if(env === "development") {
    const {default: installExtension} = require('electron-devtools-installer');
    installExtension(ext)
      .then((name) => {console.log(`Successfully installed devtools: ${name}`)})
      .catch((err) => {console.error(`Error installing devtools: ${err}`)});
  }
}

function createWindow () {
  // Create the browser window.
  const pref = app.getPath('userData');
  console.log('user preferences are located at ' + pref);
  console.log('port is ' + process.env.PORT)

  if(env === 'development') {
    writePrefenv(pref);  
  }
  
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
      //webSecurity: false
    },

  })

  function writePrefenv(prefFile) {
    const file = prefFile + '\\config.json';
    if (!file) {
      return;
    }
    let fileString = "";
    [...file].forEach(c=>{
      if (c==='\\') fileString += '/';
         else fileString += c
    })

    process.env['REACT_APP_USER_PREFERENCES'] = fileString
    const pair = {'REACT_APP_USER_PREFERENCES' : fileString}

    const dotenv = require('dotenv')
    let envConfig = dotenv.parse(fs.readFileSync('.env'))

    const sourcePath = './.env';
    envConfig = {...envConfig, ...pair};
    const str = envfile.stringify(envConfig)
    console.log(str)
    fs.writeFile(sourcePath, str, function(err) {
      if(err) {
        return console.log(err);
      }
     });
  }

  if(env === "development"){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    console.log(`electron is starting at port ${process.env.PORT}`);
    win.loadURL(`http://localhost:${process.env.PORT}/`);
  }
  else{
    loadDir(win)
    /*win.loadURL(url.format({
      pathname: path.join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true,
    }));*/
  }

  // Install additional devtools and open the devtools window
  if(env === "development"){
    const {REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} = require('electron-devtools-installer');
    installDevTools(REACT_DEVELOPER_TOOLS);
    installDevTools(REDUX_DEVTOOLS);
    win.webContents.openDevTools();
  }
  else {
    //Used to hide file menu bar.  NOTE this method only works for windows and linux
    win.removeMenu();
    //This will hide the file menu for Mac since the above method does not work for OS.
    //app is not available for windows so check if available before hiding
    if(app.dock){
      app.dock.hide();
    }
  }

  win.on('close', (e) => {
    win.webContents.send('closing');
  })

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
/* eslint-disable no-unused-vars */

const gpsgeo = require('./modules/gpsgeo.js');
const civicgeo = require('./modules/civicgeo.js');
const addNewServer = require('./modules/addNewServer.js');
const getLoginConfig = require('./modules/getLoginConfig.js');
const jcardImport = require('./modules/jcardImport.js');
const jcardExport = require('./modules/jcardExport.js');
const CarddavClear = require('./modules/CarddavClear.js');
const CarddavSync = require('./modules/CarddavSync.js');
