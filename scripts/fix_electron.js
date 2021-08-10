/**
 * This is a fix for the bug that plagued early development of VATRP 2. 
 * 
 * I discovered the problem was happening because the 'electron-devtools-installer' stored extensions 
 * messily in the AppData/Roaming folder. Simply deleting these folders is enough to resolve the issue and make 
 * things start again. Though for whatever reason there will be scary-looking warnings
 */

const fs = require('fs');
const path = require('path')

function getPath() {
  return process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + 'Library/Preferences' : process.env.HOME + "/.local/share")
};

var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const electronExtensions       = path.resolve(getPath() + "/Electron/");
const electronExtensionsExists = fs.existsSync(electronExtensions);
const vatrp2Extensions         = path.resolve(getPath() + "/vatrp-version2/");
const vatrp2ExtensionsExists   = fs.existsSync(vatrp2Extensions);

console.log(`Electron extensions ${electronExtensions}\tExists: ${electronExtensionsExists}`);
console.log(`VATRP2 extensions ${vatrp2Extensions}\tExists: ${vatrp2ExtensionsExists}`);

if(electronExtensionsExists) {
  console.log("Removing Electron Extensions . . . ");
  deleteFolderRecursive(electronExtensions, {recursive: true});
}

if(vatrp2ExtensionsExists) {
  console.log("Removing VATRP2 Extensions . . . ");
  deleteFolderRecursive(vatrp2Extensions);
}