//import userpreffile from `${process.env['REACT_APP_USER_PREFERENCES']}`
import { combineReducers } from "redux";
import callsReducer  from './callsReducer'
import t140ArrayReducer  from './t140ArrayReducer'
import settingsReducer from './settingsReducer'

// "Root reducer"
export const rootReducer = combineReducers({
  callStatusManager: callsReducer,
  t140Array: t140ArrayReducer,
  settingsManager: settingsReducer
})
/*
import { RTT_REGISTER } from "../constants/action-types";

const initialState = {
  callEstablished: false,
  chat: '',
  janusArray: [],
  username: '',
  password: '',
  sipRegistrar: '',
  sipIdentity: ''
};
let t140array;

export const rootReducer = (state = initialState, action: { type: any; payload: any;}) => {
  switch (action.type) {
    case CALL_CONNECTED:
      return Object.assign({}, state, {
        callEstablished: action.payload
      })
    case ADD_T140_ARRAY:
      if(action.payload === "ENTER"){
        t140array = new Uint8Array(3);
        t140array[0] = 226;
        t140array[1] = 128;
        t140array[2] = 168;
      //sipcall.data({ data: array });
      } else if(action.payload === "Backspace"){
        t140array = new Uint8Array(1);
        //Tonefourtyarray[0] = "Backspace";
        //sipcall.data({ data: array });
      }
      return {
        ...state,
        janusArray: state.janusArray.concat(action.payload)
      }
    case BACKSPACE_T140_ARRAY:
      return {
        ...state,
        janusArray: state.janusArray.slice(0,-1)
      }
    case RTT_REGISTER:
      console.dir("GOT PAYLOAD " + JSON.stringify(action.payload));
      return {
        ...state,
        sipRegistrar: 'sip:' + action.payload.server,
        sipIdentity: 'sip:' + action.payload.username + '@' + action.payload.server,
        username: action.payload.username,
        password: action.payload.password
      }
    default:
      return state
  }
};
*/

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
