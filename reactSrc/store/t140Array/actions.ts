// src/store/calls/actions.ts

import { ADD_T140_ARRAY, BACKSPACE_T140_ARRAY, T140ActionTypes } from './types'

// TypeScript infers that this function is returning SendMessageAction
// TypeScript infers that this function is returning SendMessageAction
export function addT140Character(action: any) {
  return {
    type: ADD_T140_ARRAY,
    payload: action.payload
  }
}

// TypeScript infers that this function is returning DeleteMessageAction
export function backspaceArray(): T140ActionTypes {
  return {
    type: BACKSPACE_T140_ARRAY,
  }
}
