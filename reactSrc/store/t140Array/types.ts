export interface T140ArrayState {
  chat: '',
  t140Array: [],
}


export const ADD_T140_ARRAY = 'ADD_T140_ARRAY'
export const BACKSPACE_T140_ARRAY = 'BACKSPACE_T140_ARRAY'

interface addT140Action {
  type: typeof ADD_T140_ARRAY
  payload: any
}

interface Backspace_T140Action {
  type: typeof BACKSPACE_T140_ARRAY
}

export type T140ActionTypes = addT140Action | Backspace_T140Action