/* eslint-disable @typescript-eslint/no-unused-vars */
import { SettingsState, InitialStateType } from '../settings/types'
//import {JssipStateType} from './jssip/types';
import {createRef} from 'react';
import {JanusStateType} from './janus/types';
import * as jssip from 'jssip';
import Store from 'electron-store';
import _ from 'lodash'
import jssipReducer from './jssipReducer';
import janusReducer from './janusReducer';
import { WebSocketInterface } from 'jssip';

let config = {
  sockets: [new WebSocketInterface("ws://example.com")],
  uri: "sip:intentionally@example.com",
  password: ''
}

const store = new Store()
let initialSettingsState: SettingsState  = {
  "currentUser": "",
  "servers": [],
  "VATRPmode": "StandardSIPCalling",
  "name": "",
  "debug": true,
  "anonymous": false,
  "maxLoginAttempts": 1,
  "logName": "",
  "logPath": "",
  "logLevel": "",
  "geolocationURI": "",
  "contactURI": "",
  "postURL": "",
  "DialAroundURI": "",
  "voicemailStatus": "",
  "messageCount": "",
  "JCardImportURI": "",
  "JCardExportURI": "",
  "CardDAV": "",
  "mwiURI": "",
  "callHistory": {
    'callHistoryList': [],
  },
  "contacts" : {
    "nextUniqueID" : 0,
    "contactsList": []
  },
  "isRTT": false,
  'rttLogin': {}
}

let janusState: JanusStateType = {
  username: '',
  password: '',
  sipRegistrar: '',
  sipIdentity: '',
  janus: null,
  sipHandler: null,
  jsep: null,
  server: '',
  storeLocalMessages: '',
  storeRemoteMessages: ''
}

let initialState : InitialStateType = {
  settings : initialSettingsState,
  //jssipState: jssipState,
  janusState: janusState
}

type SettingsKey = keyof typeof initialState.settings;

/* Electron functions to interact with the electron store.  These values will be used to update redux state  */
function setCurrentUser(state:SettingsState, phoneNumber: string){
  state = updateStateSetting(state, 'currentUser', phoneNumber)
  state = loadDefaultUserSettings(state)
  const callHistory = store.get(state.currentUser + '.callHistory.callHistoryList');
  if (!_.isEqual(callHistory, state.callHistory.callHistoryList)) 
     state=updateStateSetting(state, 'callHistory', {'callHistoryList': callHistory})

  let contactsList = []
  let nextUniqueID = 0
  if (store.has(state.currentUser + '.contacts.contactsList')) {
    contactsList = store.get(state.currentUser + '.contacts.contactsList');
    nextUniqueID = store.get(state.currentUser + '.contacts.nextUniqueID')
  }

  //Load the servers
  if (store.has(state.currentUser + '.settings.JCardImportURI')){
    state=updateStateSetting(state, 'JCardImportURI', store.get(state.currentUser + '.settings.JCardImportURI'));
  }
  if(store.has(state.currentUser + '.settings.JCardExportURI')){
    state=updateStateSetting(state, 'JCardExportURI', store.get(state.currentUser + '.settings.JCardExportURI'));
  }
  if(store.has(state.currentUser + '.settings.CardDAV')){
    state=updateStateSetting(state, 'CardDAV', store.get(state.currentUser + '.settings.CardDAV'));
  }
  if(store.has('geolocationURI')){
    state=updateStateSetting(state, 'geolocationURI', store.get('geolocationURI'));
  }
  if(store.has('contactURI')){
    state=updateStateSetting(state, 'contactURI', store.get('contactURI'));
  }
  if(store.has('postURL')){
    state=updateStateSetting(state, 'postURL', store.get('postURL'));
  }
  
  if (!_.isEqual(contactsList, state.contacts.contactsList)) {
     state=updateStateSetting(state, 'contacts', {'contactsList': contactsList, 'nextUniqueID': nextUniqueID})
  }
  return state
}

// redux functions to set state
function updateStateSetting(state:SettingsState, name:string, value:any){
  const newSetting = {
    ...state,
    [name]: value
  }

  return Object.assign({}, state, newSetting)
}

function getStateSetting(state:SettingsState, name: SettingsKey) {
  if (_.isNil(state[name])) return null
  return state[name]; 
}

function loadDefaultUserSettings(state:SettingsState) {
  const defaultSettingsJson = require('../../assets/defaultUserSettings.json');
  //iterates through fields in defaultSettingsJson and loads them in if they haven't already been set by the user
  for (let field in defaultSettingsJson) {
    let settingValue = store.get(state.currentUser + '.settings.' + field);
    if (settingValue === undefined) {
      if (defaultSettingsJson.hasOwnProperty(field)) {
        if (field === "logPath") {
          if (navigator.appVersion.indexOf('Win')) {
            settingValue = "\\AppData\\Roaming\\webrtc-vatrp\\logs\\renderer.log";          
          } else if (navigator.appVersion.indexOf('Mac')) {
            settingValue = "~/Library/Logs/webrtc-vatrp/renderer.log"     
          } else if (navigator.appVersion.indexOf('Linux')) {
            settingValue = "~/.config/webrtc-vatrp/logs/renderer.log"        
          }           
        }
        else settingValue = defaultSettingsJson[field]   
      }      
    }
    state = updateStateSetting(state, field, settingValue); 
  }
  return state
}


function settingsReducer(state=initialState, action: { type: any; payload?: any; }) {
  switch (action.type) {
    case 'RTT_REGISTER':
      state.settings = updateStateSetting(state.settings, 'rttLogin', {
        'sipRegistrar': 'sip:' + action.payload.server,
        'sipIdentity': 'sip:' + action.payload.username + '@' + action.payload.server,
        'username': action.payload.username,
        'password': action.payload.password,
        'server': action.payload.server
      })
      return state
    case 'REGISTER_USER':
      if(state.settings.VATRPmode === 'FullJanusCommunication'){
        return janusReducer(state, {type: 'REGISTER_USER', payload: action.payload});
      }
      break;
    case 'CALL':
      if(state.settings.VATRPmode === 'FullJanusCommunication'){
        return janusReducer(state, {type: 'JANUS_CALL', payload: action.payload});
      }
      break;
    case 'INCOMING':
      if(state.settings.VATRPmode === 'FullJanusCommunication'){
        return janusReducer(state, {type: 'JANUS_INCOMING', payload: action.payload});
      }
      break;
    case 'JANUS_ACCEPT':
      if(state.settings.VATRPmode === 'FullJanusCommunication'){
        return janusReducer(state, {type: 'JANUS_ACCEPT', payload: action.payload});
      }
      break;
    case 'JANUS_REMOTE_ACCEPT':
      if(state.settings.VATRPmode === 'FullJanusCommunication'){
        return janusReducer(state, {type: 'JANUS_REMOTE_ACCEPT', payload: action.payload});
      }
      break;
    case 'JANUS_CHANNEL_OPEN':
      if(state.settings.VATRPmode === 'FullJanusCommunication'){
        return janusReducer(state, {type: 'JANUS_CHANNEL_OPEN', payload: action.payload});
      }
      break;
    case 'JANUS_RTT_RECEIVE':
      if(state.settings.VATRPmode === 'FullJanusCommunication'){
        return janusReducer(state, {type: 'JANUS_RTT_RECEIVE', payload: action.payload});
      }
      break;
    case 'JANUS_RTT_SEND':
      if(state.settings.VATRPmode === 'FullJanusCommunication'){
        return janusReducer(state, {type: 'JANUS_RTT_SEND', payload: action.payload});
      }
      break;
    case 'GET_SETTING':
      return getStateSetting(state.settings, action.payload)
    case 'UPDATE_SETTING':
      var newStateSettings = updateStateSetting(state.settings, action.payload.name, action.payload.value);
      return {
        ...state,
        settings: newStateSettings
      }
    case 'SET_CURRENT_USER':
      // state is set to initialState to ensure initial values 
      // in case a user logs in again with a different number
      state.settings = setCurrentUser(state.settings, action.payload)
      console.log("SET USER " + JSON.stringify(state.settings) + " " + JSON.stringify(action.payload));
      return state;
    default:
      return state
  }
}

export default settingsReducer