import jssipService from '../services/JssipService';
import {WebSocketInterface, UserAgentConfiguration} from 'jssip';

let isRegistered: boolean;
function setIsRegistered(b: boolean){
  isRegistered = b;
}

let phoneNumber = "7032935030";
let server = "ntlqasip2.task3acrdemo.com";
let password = "1qaz1qaz";


let serverString = "wss://" + server + "/ws";
let uri = "sip:" + phoneNumber + "@" + server;
let socket = new WebSocketInterface(serverString);

let config: UserAgentConfiguration;
let service: jssipService;

function initialize(){
  config  = {
    sockets: [socket],
    uri,
    password  
  };
  service = new jssipService(config)
  service.uaStart({}, () =>{}); 
}

beforeEach(done => {
  try {
    initialize();
    service.registerOnRegisteredCallback( () => {
      setIsRegistered(true);
      done();
    });   

  } catch (e) {
    done();
  }
});

afterEach(() => {
  service.unregister();
});

describe('handle registration', () => {

  //Successful registration
    test('register user',  () => {
     expect(service.isUARegistered()).toBe(true);

  });


})


