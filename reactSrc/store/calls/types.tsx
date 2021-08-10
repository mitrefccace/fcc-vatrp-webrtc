export interface CallState {
  callStatus: {
    callEstablished: false
  }
}

export const UPDATE_CALL_STATUS = 'UPDATE_CALL_STATUS'

interface CallStateConnected {
  type: typeof UPDATE_CALL_STATUS
  payload: Object
}

export type CallActionTypes = CallStateConnected