// src/store/calls/actions.ts

import {  UPDATE_CALL_STATUS, CallActionTypes } from './types'

// TypeScript infers that this function is returning SendMessageAction
export default function updateCallStatus(newSetting: Object): CallActionTypes {

  return {
    type: UPDATE_CALL_STATUS,
    payload: newSetting
    }

}

