/* eslint-disable @typescript-eslint/no-unused-vars */
import { JanusStateType } from './janus/types';
import { SettingsState, InitialStateType } from '../settings/types'
import { 
  REGISTER_USER, 
  JANUS_CALL, 
  JANUS_INCOMING, 
  JANUS_ACCEPT,
  JANUS_HANGUP, 
  JANUS_DECLINE, 
  JANUS_REMOTE_ACCEPT,
  JANUS_CHANNEL_OPEN,
  JANUS_RTT_SEND,
  JANUS_RTT_RECEIVE } from "../constants/action-types";
import _ from 'lodash'

//const Janus = require('Janus');

function janusReducer(state:InitialStateType, action: { type: any, payload?: any, }) {
  var characterArray, messagesJanusState, newMessagesState
  switch (action.type) {
    case REGISTER_USER:
      var register = {"request" : "register", "username" : action.payload.username, 
            "authuser" : action.payload.authuser, "display_name" : action.payload.display_name, "secret" : action.payload.secret,
            "proxy" : action.payload.proxy};

      action.payload.sipHandler.send({ message: register });
      console.log("Registering to Janus");

      var newJanusState = 
      {
        ...state.janusState,
        sipRegistrar: 'sip:' + action.payload.server,
        sipIdentity: action.payload.username,
        username: action.payload.username,
        password: action.payload.password,
        janus: action.payload.janus,
        sipHandler: action.payload.sipHandler,
        jsep: action.payload.jsep,
        server: action.payload.server
      }

      var newState = {
        ...state,
        janusState : newJanusState
      }

      return state = Object.assign({}, state, newState)
    case JANUS_CALL:
      var handle = action.payload.handle;
      if(action.payload.handle){
        handle.peer = action.payload.number;
        handle.createOffer(
          {
            media : {
              audioSend: true, audioRecv: true,
              videoSend: true, videoRecv: true,
              data : true
            },
            success: function(jsep : any){
              var body = { request: "call", uri: action.payload.number}

              handle.send({message: body, jsep: jsep});
            },
            error: function(error : any){
              console.log("Error sending call " + error);
            }
          }
        )
      }

      return state
    
    //Need this case to set jsep so janus can accept a call request
    case JANUS_INCOMING:
      var newIncomingJanusState = 
      {
        ...state.janusState,
        sipRegistrar: state.janusState.sipRegistrar,
        sipIdentity: state.janusState.sipIdentity,
        username: state.janusState.username,
        password: state.janusState.password,
        janus: state.janusState.janus,
        sipHandler: state.janusState.sipHandler,
        jsep: action.payload.jsep,
        server: state.janusState.server
      }

      var newIncomingState = {
        ...state,
        janusState : newIncomingJanusState
      }

      return state = Object.assign({}, state, newIncomingState)
    case JANUS_ACCEPT:
        // This is imported Janus code.  For more details visit https://janus.conf.meetecho.com/
        var sipcallAction = state.janusState.sipHandler.createAnswer;
        sipcallAction(
          {
            jsep: state.janusState.jsep,
            media: { audio: true, video: true, data: false },
            success: function(jsep : any) {
              var body = { request: "accept" };
              state.janusState.sipHandler.send({ message: body, jsep: jsep });
            },
            error: function(error : any) {
              // Don't keep the caller waiting any longer, but use a 480 instead of the default 486 to clarify the cause
              var body = { request: "decline", code: 480 };
              state.janusState.sipHandler.send({ message: body });
              console.log("Janus error accepting call " + error);
            }
          });
      return state
    case JANUS_HANGUP:
      state.janusState.sipHandler.hangup();
      return state
    case JANUS_DECLINE:
      var body = { request: "decline" };
      state.janusState.sipHandler.send({ message: body });
      return state
    case JANUS_REMOTE_ACCEPT:
      if(action.payload.jsep) {
        state.janusState.sipHandler.handleRemoteJsep({ jsep: action.payload.jsep, error: console.log("Accept error") });
      }
      state.janusState.sipHandler.callId = action.payload.callId;
      return state
    case JANUS_CHANNEL_OPEN:
      state.janusState.sipHandler.localMessages = [];
      state.janusState.sipHandler.remoteMessages = [];
      state.janusState.sipHandler.remoteText = "";
      
      characterArray = new Uint8Array(3)
      characterArray[0] = 239;
      characterArray[1] = 187;
      characterArray[2] = 191;
      state.janusState.sipHandler.data({ data: characterArray, label: 'RTT', protocol: 't140' });
      return state
      
    case JANUS_RTT_SEND:
      //Check if character or backspace
      if(action.payload.characterKey === 13){
        characterArray = new Uint8Array(3);
        characterArray[0] = 226;
        characterArray[1] = 128;
        characterArray[2] = 168;
        state.janusState.sipHandler.data({ data: characterArray, label: 'RTT', protocol: 't140' });
        //Only push the message when enter is clicked
        state.janusState.sipHandler.localMessages.push({
          timestamp: new Date(),
          text: state.janusState.storeLocalMessages
        });
        var messagesEnterJanusState = 
        {
          ...state.janusState,
          sipRegistrar: state.janusState.sipRegistrar,
          sipIdentity: state.janusState.sipIdentity,
          username: state.janusState.username,
          password: state.janusState.password,
          janus: state.janusState.janus,
          sipHandler: state.janusState.sipHandler,
          jsep: state.janusState.jsep,
          server: state.janusState.server,
          storeLocalMessages: '',
          storeRemoteMessages: state.janusState.storeRemoteMessages
        }

        var newEnterState = {
          ...state,
          janusState : messagesEnterJanusState
        }

        return state = Object.assign({}, state, newEnterState)		
      }else{
        characterArray = new Uint8Array(1);
        characterArray[0] = action.payload.characterKey;
        state.janusState.sipHandler.data({ data: characterArray, label: 'RTT', protocol: 't140' });
        messagesJanusState = 
        {
          ...state.janusState,
          sipRegistrar: state.janusState.sipRegistrar,
          sipIdentity: state.janusState.sipIdentity,
          username: state.janusState.username,
          password: state.janusState.password,
          janus: state.janusState.janus,
          sipHandler: state.janusState.sipHandler,
          jsep: state.janusState.jsep,
          server: state.janusState.server,
          storeLocalMessages: state.janusState.storeLocalMessages.concat(action.payload.characterValue),
          storeRemoteMessages: state.janusState.storeRemoteMessages
        }

        newMessagesState = {
          ...state,
          janusState : messagesJanusState
        }

        return state = Object.assign({}, state, newMessagesState)
      }      
    case JANUS_RTT_RECEIVE:
      var enc = new TextEncoder();
      characterArray = new Uint8Array(enc.encode(action.payload.receivedRTT));          
      var decodedMessage = '';
      //Parsing the array
      for(var i = 0; i < characterArray.length; ++i){
        //Backspace was pressed
        if(characterArray[i] === 8){
          decodedMessage = decodeURIComponent(decodedMessage);
          state.janusState.sipHandler.remoteText += decodedMessage;
          decodedMessage = '';
          if(state.janusState.sipHandler.remoteText.length > 0) {
            state.janusState.sipHandler.remoteText = state.janusState.sipHandler.remoteText.slice(0, -1);
          } else {
            if(state.janusState.sipHandler.remoteMessages.length > 0) {
              decodedMessage = state.janusState.sipHandler.remoteMessages.pop().text;
            }
            state.janusState.sipHandler.remoteText = decodedMessage;
          }
          continue;
        } else if(characterArray[i] === 226 && (characterArray.length-i > 2) && characterArray[i+1] === 128 && characterArray[i+2] === 168){
          state.janusState.sipHandler.remoteMessages.push({
            timestamp: new Date(),
            sender: state.janusState.sipHandler.peer,
            text: state.janusState.sipHandler.remoteText
          });
          state.janusState.sipHandler.remoteText = "";
          i=i+2
          continue;
        }
        decodedMessage+= String.fromCharCode(characterArray[i]);
      }
      
      state.janusState.sipHandler.remoteText += decodedMessage

      messagesJanusState = 
      {
        ...state.janusState,
        sipRegistrar: state.janusState.sipRegistrar,
        sipIdentity: state.janusState.sipIdentity,
        username: state.janusState.username,
        password: state.janusState.password,
        janus: state.janusState.janus,
        sipHandler: state.janusState.sipHandler,
        jsep: state.janusState.jsep,
        server: state.janusState.server,
        storeLocalMessages: state.janusState.storeLocalMessages,
        storeRemoteMessages: state.janusState.storeRemoteMessages
      }

      newMessagesState = {
        ...state,
        janusState : messagesJanusState
      }

      return state = Object.assign({}, state, newMessagesState)
  }
}

export default janusReducer
