import { T140ArrayState} from '../t140Array/types.js'

const initialState: T140ArrayState = {
  chat: '',
  t140Array: []
};

// janus array updates
function addT140Array (state:T140ArrayState,  action: { type?: any; payload?: any; }) { 
  if(action.payload === "ENTER"){
    let t140array = new Uint8Array(3);
    t140array[0] = 226;
    t140array[1] = 128;
    t140array[2] = 168;
  //sipcall.data({ data: array });
  } else if(action.payload === "Backspace"){
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let t140array = new Uint8Array(1);
    //Tonefourtyarray[0] = "Backspace";
    //sipcall.data({ data: array });
  }
  console.dir(state.t140Array)
  return {
    ...state,
    t140Array: state.t140Array.concat(action.payload)
  }
}

function updateBackspaceT140Array(state:T140ArrayState,) {
  return {
    ...state,
    t140Array: state.t140Array.slice(0,-1)
  }
}

function t140ArrayReducer(state=initialState, action: { type?: any; payload?: any; }) {
  switch (action.type) {
    case 'ADD_T140_ARRAY':
      return addT140Array(state, action)
    case 'BACKSPACE_T140_ARRAY':
      return updateBackspaceT140Array(state)
    default:
      return state
  }
}

export default t140ArrayReducer
