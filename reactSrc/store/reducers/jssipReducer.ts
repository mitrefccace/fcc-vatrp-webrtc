/* eslint-disable @typescript-eslint/no-unused-vars */
import { JssipState } from './jssip/types'
import { useRef, RefObject, createRef } from 'react';
import * as jssip from 'jssip'
import _ from 'lodash'
import { WebSocketInterface } from 'jssip';

let config = {
    sockets: [new WebSocketInterface("ws://example.com")],
    uri: "sip:intentionally@example.com",
    password: ''
}
let initialState: JssipState  = {
  "ua"                 : new jssip.UA(config),
  "sessions"          :{
    currentSession: null
  },
  "phoneNumber"        : "Unknown number", 
  "server"             : '', 
  "jssipconfiguration" : config,
  "isRegistered"       : false,
  "remoteVideoRef"     : createRef(),
  "selfVideoRef"       : createRef(),
  //"storedSelfStream"   : {},
  //"storedRemoteStream" : {},
  "uaSipEventCallbackStack" : [],
  "uaConnectedCallbackStack" : [],
  "uaConnectingCallbackStack" : [],
  "uaDisconnectedCallbackStack" : [],
  "uaRegisteredCallbackStack" : [],
  "uaRegistrationFailedCallbackStack" : [],
  "uaRegistrationTimeoutCallbackStack" : [],
  "uaUngresiteredCallbackStack" : [],
  "uaNewRTCSessionCallbackStack" : [],
  "sessionAcceptedCallbackStack" : [],
  "sessionEndedCallbackStack" : [],
  "sessionFailedCallbackStack" : [],
  "sessionConfirmedCallbackStack" : [],
  "sessionConnectingCallbackStack" : [],
  "peerCreateOfferFailCallbackStack" : [],
  "peerCreateAnswerFailCallbackStack" : [],
  "peerSetLocalDescFailCallbackStack" : [],
  "peerSetRemoteDesFailCallbackStack" : [],
  "getUserMediaFailedCallBackStack" : [],
  "currentSessionConnectionCallbackStack" : [],
}

function jssipReducer(state=initialState, action: { type: any, payload?: any, }) {
  switch (action.type) {
    case 'REGISTER_UA':
      return (state.ua = new jssip.UA(action.payload))
    case 'UA_REGISTRATOR':
      return state.ua.registrator().setExtraHeaders(
        action.payload
      );
    case 'TERMINATE_CALL':
      if(state.sessions.currentSession){
        if(!state.sessions.currentSession.isEnded()){
          state.sessions.currentSession.terminate();
        }
      }
      return null
    default:
      return state
  }
}

export default jssipReducer