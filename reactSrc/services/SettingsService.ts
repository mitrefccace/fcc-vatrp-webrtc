import Store from 'electron-store';
const store = new Store();
const defaultSettingsJson = require('../assets/defaultUserSettings.json');

export default class SettingsService {
  currentUser  : string;
  debug        : boolean;

  constructor() {
    if (!store.has('currentUser')) {
      this.setCurrentUser('');
    }
    this.currentUser = store.get('currentUser');
    this.debug = false;
  }

  /*********************
   * Utility Functions *
   *********************/


  loadSetting=(name: string): any=>{
    let field = this.currentUser + '.settings.' + name;
    return store.get(field);
  }

  loadSettingGlobal(name: String): any{
    let field = 'global.settings.' + name;
    return store.get(field);
  }

  updateSettings(name:string, value:any){
    let field = this.currentUser + '.settings.' + name;
    store.set(field,value);
    //console.log(field +': ' + store.get(field));
  }

  updateSettingsGlobal(name:string, value:any){
    let field = 'global.settings.' + name;
    store.set(field, value);
  }

  setCurrentUser(phoneNumber: string){
    store.set('currentUser',phoneNumber);
    this.currentUser = phoneNumber;
    this.loadDefaultUserSettings();
  }

  getCurrentUser=()=>{
    return this.currentUser;
  }

  loadDefaultUserSettings() {
    //iterates through fields in defaultSettingsJson and loads them in if they haven't already been set by the user
    for (let field in defaultSettingsJson) {
      if (this.loadSetting(field) === undefined) {
        if (defaultSettingsJson.hasOwnProperty(field)){
          if(field === "logPath" && navigator.appVersion.indexOf('Win')){
            this.updateSettings("logPath" , "\\AppData\\Roaming\\webrtc-vatrp\\logs\\renderer.log");
          }else if(field === "logPath" && navigator.appVersion.indexOf('Mac')){
            this.updateSettings("logPath" , "~/Library/Logs/webrtc-vatrp/renderer.log");
          }else if(field === "logPath" && navigator.appVersion.indexOf('Linux')){
            this.updateSettings("logPath" , "~/.config/webrtc-vatrp/logs/renderer.log");
          } else{
            this.updateSettings(field, defaultSettingsJson[field]);
          }
        }
      }  
    }
  }
}