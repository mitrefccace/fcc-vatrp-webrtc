import { LOAD_DEFAULT_USER_SETTINGS,
         SET_CURRENT_USER,
         UPDATE_SETTING,
         RTT_REGISTER,
         REGISTER_USER,
         CALL,
         INCOMING,
         JANUS_ACCEPT,
         JANUS_DECLINE,
         JANUS_REMOTE_ACCEPT,
         JANUS_HANGUP,
         JANUS_CHANNEL_OPEN,
         JANUS_RTT_SEND,
         JANUS_RTT_RECEIVE,
         InitialSettingsType,
         SetCurrentUserType,
         UpdateSettingsType,
         IntRegisterUserType,
         IntCallType,
         JanusAcceptType,
         JanusDeclineType,
         JanusRemoteAcceptType,
         JanusHangupType,
         IntIncomingType,
         JanusChannelOpenType,
         JanusRTTSendType,
         JanusRTTReceiveType,
         RTTRegisterType} from './types';

export function loadDefaultUserSettings(): InitialSettingsType {
  return {
    type: LOAD_DEFAULT_USER_SETTINGS
  }
}
export function UpdateUserSetting(newSetting: Object): UpdateSettingsType {
  return {
    type: UPDATE_SETTING,
    payload: newSetting
  }
}

export function setThisCurrentUser(currentUser:string): SetCurrentUserType {
  return {
    type: SET_CURRENT_USER,
    payload: currentUser
  }
}

export function rttRegister(rttConfig: Object): RTTRegisterType {
  return { 
    type: RTT_REGISTER, 
    payload: rttConfig
  }
};

export function registerUser(config: object): IntRegisterUserType {
  return {
    type: REGISTER_USER,
    payload: config
  }
}

export function call(config: object): IntCallType {
  return {
    type: CALL,
    payload: config
  }
}

export function incoming(config: object): IntIncomingType {
  return {
    type: INCOMING,
    payload: config
  }
}

export function janusAccept(config: object): JanusAcceptType {
  return {
    type: JANUS_ACCEPT,
    payload: config
  }
}

export function janusDecline(config: object): JanusDeclineType {
  return {
    type: JANUS_DECLINE,
    payload: config
  }
}

export function janusRemoteAccept(config: object): JanusRemoteAcceptType {
  return {
    type: JANUS_REMOTE_ACCEPT,
    payload: config
  }
}

export function janusHangup(config: object): JanusHangupType {
  return {
    type: JANUS_HANGUP,
    payload: config
  }
}

export function janusChannelOpen(config : object): JanusChannelOpenType {
  return {
    type: JANUS_CHANNEL_OPEN,
    payload: config
  }
}

export function janusRTTSend(config : object): JanusRTTSendType {
	return {
		type: JANUS_RTT_SEND,
		payload: config
	}
}

export function janusRTTReceive(config : object): JanusRTTReceiveType {
	return {
		type: JANUS_RTT_RECEIVE,
		payload: config
	}
}