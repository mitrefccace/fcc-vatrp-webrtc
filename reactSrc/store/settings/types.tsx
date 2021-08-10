//import { JssipStateType } from "../reducers/jssip/types";
import { JanusStateType } from "../reducers/janus/types";

 export interface SettingsState {
  "currentUser": string,
  "servers": Array<string>,
  "VATRPmode": string,
  "name": string,
  "debug": boolean,
  "anonymous": boolean,
  "maxLoginAttempts": number,
  "logName": string,
  "logPath": string,
  "logLevel": string,
  "geolocationURI": string,
  "contactURI": string,
  "postURL": string,
  "DialAroundURI": string,
  "voicemailStatus": string,
  "messageCount": string,
  "JCardImportURI": string,
  "JCardExportURI": string,
  "CardDAV": string,
  "mwiURI": string,
  "callHistory": {
    "callHistoryList": Array<String>
  },
  "contacts" : {
    "nextUniqueID" : number,
    "contactsList": Array<String>
  },
  "isRTT": boolean,
  'rttLogin': Object
}

export interface InitialStateType {
  settings: SettingsState,
  //jssipState: JssipStateType,
  janusState: JanusStateType
}

export const LOAD_SETTING ='LOAD_SETTING'
export const UPDATE_SETTING ='UPDATE_SETTING'
export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const GET_CURRENT_USER = 'GET_CURRENT_USER';
export const LOAD_DEFAULT_USER_SETTINGS = 'LOAD_DEFAULT_USER_SETTINGS';
export const RTT_REGISTER = 'RTT_REGISTER';
export const REGISTER_USER = 'REGISTER_USER';
export const CALL = 'CALL';
export const INCOMING = 'INCOMING';
export const JANUS_ACCEPT = 'JANUS_ACCEPT';
export const JANUS_DECLINE = 'JANUS_DECLINE';
export const JANUS_REMOTE_ACCEPT = 'JANUS_REMOTE_ACCEPT';
export const JANUS_HANGUP = 'JANUS_HANGUP';
export const JANUS_CHANNEL_OPEN = 'JANUS_CHANNEL_OPEN';
export const JANUS_RTT_SEND = 'JANUS_RTT_SEND';
export const JANUS_RTT_RECEIVE = 'JANUS_RTT_RECEIVE';

interface IntInitialLoadSettingsType {
  type: typeof LOAD_DEFAULT_USER_SETTINGS
}

export interface IntUpdateSettingsType {
  type: typeof UPDATE_SETTING
  payload: Object
}

export interface IntSetCurrentUserType {
  type: typeof SET_CURRENT_USER
  payload?: string
}

export interface IntGetCurrentUserType {
  type: typeof GET_CURRENT_USER
  payload?: string
}

export interface IntLoadSettingsType {
  type: typeof LOAD_SETTING
  payload: Object
}

export interface IntRegisterUserType {
  type: typeof REGISTER_USER
  payload: Object
}

export interface IntRTTRegisterType {
  type: typeof RTT_REGISTER
  payload: Object
}

export interface IntCallType {
  type: typeof CALL
  payload: Object
}

export interface IntIncomingType {
  type: typeof INCOMING
  payload: Object
}

export interface JanusAcceptType {
  type: typeof JANUS_ACCEPT
  payload: Object
}

export interface JanusDeclineType {
  type: typeof JANUS_DECLINE
  payload: Object
}

export interface JanusRemoteAcceptType {
  type: typeof JANUS_REMOTE_ACCEPT
  payload: Object
}

export interface JanusHangupType {
  type: typeof JANUS_HANGUP
  payload: Object
}

export interface JanusChannelOpenType {
  type: typeof JANUS_CHANNEL_OPEN
  payload: Object
}

export interface JanusRTTSendType {
	type: typeof JANUS_RTT_SEND
	payload: Object
}

export interface JanusRTTReceiveType {
	type: typeof JANUS_RTT_RECEIVE
	payload: Object
}

type SettingsProperty = {
  [P in keyof SettingsState]?: SettingsState[P];
};

export type InitialSettingsType = IntInitialLoadSettingsType
export type UpdateSettingsType = IntUpdateSettingsType
export type SetCurrentUserType = IntSetCurrentUserType
export type GetCurrentUserType = IntGetCurrentUserType
export type LoadSettingsType = IntLoadSettingsType
export type RTTRegisterType = IntRTTRegisterType
export type RegisterUserType = IntRegisterUserType
export type CallType = IntCallType
export type IncomingType = IntIncomingType
export type JanusAccept = JanusAcceptType
export type JanusDecline = JanusDeclineType
export type JanusRemoteAccept = JanusRemoteAcceptType
export type JanusHangup = JanusHangupType
export type JanusChannelOpen = JanusChannelOpenType
export type JanusRTTSend = JanusRTTSendType
export type JanusRTTReceive = JanusRTTReceiveType