import { CallState } from '../calls/types'

const initialState: CallState = {
  callStatus: {
     callEstablished: false
  }
}

// call update
function updateCallStatus(state:CallState, name:string, value:any) {
  const newSetting = {
    ...state.callStatus,
    [name]: value
  }
  const newState = {
    ...state,
    callStatus: newSetting
  }
  return Object.assign({}, state, newState)
}

function callsReducer(state=initialState, action: { type: any; payload?: any; }) {
  switch (action.type) {
    case 'UPDATE_CALL_STATUS':
      return updateCallStatus(state, action.payload.name, action.payload.value)
    default:
      return state
  }
}

export default callsReducer
