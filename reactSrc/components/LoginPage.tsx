import React, { RefObject } from 'react';
import logo from '../assets/vatrp.png';
import './LoginPage.css';
import jssipService from '../services/JssipService';
import SettingsService from '../services/SettingsService';
import {WebSocketInterface, UserAgentConfiguration} from 'jssip';
import * as serverData from '../assets/serverList.json';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Store from 'electron-store';
import Geolocation from './Geolocation';
import DebugModal from '../components/modals/DebugModal';
import Janus from '../janus/janus';

import { ipcRenderer } from 'electron';
import { connect, ConnectedProps } from 'react-redux';
import { 
  UpdateUserSetting, 
  setThisCurrentUser, 
  rttRegister, 
  registerUser, 
  incoming, 
  janusRemoteAccept, 
  janusHangup,
  janusChannelOpen,
  janusRTTReceive } from '../store/settings/actions';
import _ from 'lodash'
import { 
  IntSetCurrentUserType, 
  IntUpdateSettingsType, 
  IntRTTRegisterType, 
  IntRegisterUserType, 
  IntIncomingType, 
  JanusRemoteAcceptType, 
  JanusHangupType,
  JanusChannelOpenType,
  JanusRTTReceiveType } from '../store/settings/types';

const store = new Store();
const log = require('electron-log');

type credentialsType = {
  "realm": string
  "username": string
  "password": string
}

type configType = {
  //version: Identifies the version of the configuration data format.
  //A new version number SHOULD only be used if the new version is not
  //backwards-compatible with the older version.  A new version number
  //is not needed if new elements are optional and can be ignored by
  //older implementations.
  "version": number
  //lifetime: Specifies how long (in seconds) the RUE MAY cache the
  //configuration values.  Values may not be valid when lifetime
  //expires.  Emergency Calls MUST continue to work.
  "lifetime": number
  //display-name: (OPTIONAL) A user-friendly name to identify the
  //subscriber when originating calls.
  "display-name"?: string
  //phone-number: The telephone number (in E.164 format) assigned to
  //this subscriber.  This becomes the user portion of the SIP URI
  //identifying the subscriber.
  "phone-number": string
  //provider-domain: The DNS domain name of the default Provider
  //servicing this subscriber.
  "provider-domain": string
  //outbound-proxies: (OPTIONAL) A URI of a SIP proxy to be used when
  //sending requests to the Provider.
  "outbound-proxies"?: string
  //mwi: (OPTIONAL) A URI identifying a SIP event server that
  //generates "message-summary" events for this subscriber.
  "mwi"?: string
  //videomail: (OPTIONAL) A SIP URI that can be called to retrieve
  //videomail messages.
  "videomail"?: string
  //contacts: An HTTPS URI that may be used to export (retrieve) the
  //subscriber's complete contact list managed by the Provider.
  "contacts": string
  //carddav: (OPTIONAL) A username and domain name (separated by
  //""@"") identifying a "CardDAV" server and user name that can be
  //used to synchronize the RUE's contact list with the contact list
  //managed by the Provider.
  "carddav"?: string
  //sendLocationWithRegistration: True if the RUE should send a
  //Geolocation Header with REGISTER, false if it should not.
  //Defaults to false if not present.
  "sendLocationWithRegistration": boolean
  //turn-servers: (OPTIONAL) An array of URLs identifying STUN and
  //TURN servers available for use by the RUE for establishing media
  //streams in calls via the Provider.
  "turn-servers"?: Array<string>
  //credentials: (OPTIONAL) TBD
  "credentials": Array<credentialsType>
  //Server for RTT use
  "rttserver": string
};

interface RootState {
  phone : string,
  server : string,
  password : string
}

type loginPageProps = PropsFromRedux & {
  setJssipService   : Function
  setIsRegistered   : Function
  settingsService   : SettingsService
  displayUserMessage: Function
  setLoggingLevel   : Function
  setLoggerPath     : Function
  setIsRTT          : Function 
  setIsJanus        : Function 
  janusRemoteRef    : RefObject<HTMLVideoElement>
  janusSelfRef      : RefObject<HTMLVideoElement>
  setHandle         : Function
  setIncomingCall   : Function
  setJanusCall      : Function
  setJanusNumber    : Function
};

type loginPageState = {
  phoneNumber      : string,
  server           : string,
  password         : string,
  sendLocRegistration : boolean,
  customServerBox  : boolean,
  customServer     : string,
  passwordAlertBox : boolean,
  geolocationModal : boolean,
  debugModal       : boolean,
  loginFileURI     : string,
  serverDefType    : string,
  rttChecked       : boolean;
  sipRegistrar     : string;
  sipIdentity      : string;
  rttUsername      : string;
  secret           : string;
  rttDisplayname   : string;
  VATRPmode        : string;
  sipHandler       : any;
  janus            : any;
  jsep             : any;
  rttServer        : string;
}      
const mapStateToProps = (state: any) => {
  return {
    settings: state.settingsManager.settings,
    phone : state.phone,
    server : state.server,
    password : state.password,
    jssipState: state.settingsManager.jssipState,
    janusState: state.settingsManager.janusState
  };
};

const mapDispatchToProps = (dispatch: (arg0: IntSetCurrentUserType | IntUpdateSettingsType | IntRegisterUserType | IntRTTRegisterType | IntIncomingType | JanusRemoteAcceptType | JanusHangupType | JanusRTTReceiveType | JanusChannelOpenType) => any) => ({
  setThisCurrentUser: (number: string) => dispatch(setThisCurrentUser(number)),
  UpdateUserSetting: (name: object ) => dispatch(UpdateUserSetting(name)),
  rttRegister: (payload: object) => dispatch(rttRegister(payload)),
  registerUser: (config: object) => dispatch(registerUser(config)),
  janusIncoming: (config: object) => dispatch(incoming(config)),
  janusRemoteAccept: (config: object) => dispatch(janusRemoteAccept(config)),
  janusHangup: (config: object) => dispatch(janusHangup(config)),
  janusRTTReceive: (config: object) => dispatch(janusRTTReceive(config)),
  janusChannelOpen: (config: object) => dispatch(janusChannelOpen(config))
});

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

class LoginPage extends React.Component <loginPageProps, loginPageState> {
  constructor(props: loginPageProps) {
    super(props);
    this.state = {
      phoneNumber      : "",
      server           : "",
      password         : "",
      sendLocRegistration : false,
      customServerBox  : false,
      customServer     : "",
      passwordAlertBox : false,
      geolocationModal : false,
      debugModal       : false,
      loginFileURI     : "",
      serverDefType    : "file",
      rttChecked       : false, 
      sipRegistrar     : "",
      sipIdentity      : "",
      rttUsername      : "",
      secret           : "",
      rttDisplayname   : "",
      VATRPmode        : "StandardSIPCalling",
      sipHandler       : null,
      janus            : null,
      jsep             : null,
      rttServer        : ""
    };
    this.processLogin     = this.processLogin.bind(this);
    this.handleChange     = this.handleChange.bind(this);
    this.handleConfigFile = this.handleConfigFile.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleVATRPmodeChange = this.handleVATRPmodeChange.bind(this);
    this.validateLoginForm = this.validateLoginForm.bind(this);
    this.formatRegistrationParameters = this.formatRegistrationParameters.bind(this);
    this.checkRequiredFieldExists     = this.checkRequiredFieldExists.bind(this)
    this.validatePhoneNumberFormat    = this.validatePhoneNumberFormat.bind(this)
    this.establishJssipService        = this.establishJssipService.bind(this)
    this.handleRegistrationEvents     = this.handleRegistrationEvents.bind(this)
    this.hideGeolocationModal         = this.hideGeolocationModal.bind(this);
    this.showGeolocationModal         = this.showGeolocationModal.bind(this);
    this.hideDebugModal               = this.hideDebugModal.bind(this);
    this.showDebugModal               = this.showDebugModal.bind(this);
    this.handleConfigFileFromRemoteServer = this.handleConfigFileFromRemoteServer.bind(this);
    this.checkboxChanged      = this.checkboxChanged.bind(this);
    this.initiateJanus    = this.initiateJanus.bind(this);
    this.attachJanus      = this.attachJanus.bind(this);

    if(!store.has("servers")){
      console.log('retrieving servers list')

      store.set("servers", serverData.servers); 
      // updating the redux settings   
      if (!_.isEqual(serverData.servers, this.props.settings.servers)) 
       this.props.UpdateUserSetting({name: 'servers', value: serverData.servers})
    }
  }

  //Loads in servers from serverList.json to the server dropdown
  loadServerOptions(){
    let servers = store.get("servers");
    let options: any = [];
    //@ts-ignore

    if (servers) {
      servers.forEach((server: any) => {
      //checks for repeat server names and skips them
      for (let i=0; i<options.length; i++){
        if ((options[i].props.value) === server){
          return;
        }
      }
      //adds a React element for each unique server name
      options.push(<option key={server} value={server}> {server} </option>)
    })};
    return options;
  }

  parseLoginConfig(config: configType) {

      // Test whether the config has all the properties accoring to RUE spec 9.2
      // https://tools.ietf.org/html/draft-ietf-rum-rue-01#section-9.2
      const validation = config.hasOwnProperty("version") &&
        config.hasOwnProperty("lifetime") &&
        config.hasOwnProperty("phone-number") &&
        config.hasOwnProperty("provider-domain") &&
        config.hasOwnProperty("contacts") &&
        config.hasOwnProperty("sendLocationWithRegistration") &&
        config.hasOwnProperty("credentials"); //credentials is not technically a required field according to RUE, but we enforce it here

      // Log required properties not implemented yet
      if (config.hasOwnProperty("version")) {
        console.log(`Optional configuration element found: display-name: ${config["version"]}`);
      }
      // required
      if (config.hasOwnProperty("lifetime")) {
        console.log(`Optional configuration element found: lifetime: ${config["lifetime"]}`);
      }
      // required
      if (config.hasOwnProperty("contacts")) {
        console.log(`Optional configuration element found: contacts: ${config["contacts"]}`);
      }
      // required
      if (config.hasOwnProperty("sendLocationWithRegistration")) {
        console.log(`Optional configuration element found: sendLocationWithRegistration: ${config["sendLocationWithRegistration"]}`);
      }
      // Log optional properties not implemented yet
      if (config.hasOwnProperty("display-name")) {
        console.log(`Optional configuration element found: display-name: ${config["display-name"]}`);
      }
      // optional
      if (config.hasOwnProperty("outbound-proxies")) {
        console.log(`Optional configuration element found: outbound-proxies: ${config["outbound-proxies"]}`);
      }
      // optional
      if (config.hasOwnProperty("mwi")) {
        console.log(`Optional configuration element found: mwi: ${config["mwi"]}`);
      }
      // optional
      if (config.hasOwnProperty("videomail")) {
        console.log(`Optional configuration element found: videomail: ${config["videomail"]}`);
      }
      // optional
      if (config.hasOwnProperty("carddav")) {
        console.log(`Optional configuration element found: carddav: ${config["carddav"]}`);
      }
      // optional
      if (config.hasOwnProperty("turn-servers")) {
        console.log(`Optional configuration element found: turn-servers: ${config["turn-servers"]}`);
      }

      // This line pulls the first password in the credentials object where username and realm 
      // match the username and realm given in the config
      let password;
      try {
        password = config['credentials'].filter((x) => x.username === config['phone-number'] && x.realm === config['provider-domain'])[0]['password']
      }
      catch (e) {
        console.log(e);
        this.props.displayUserMessage("Error", "No Password Found!", "Could not find a password in credentials file!");
        return;
      }

      if (validation) {
        this.setState({
          phoneNumber: config["phone-number"],
          server: config["provider-domain"],
          password: password,
          sendLocRegistration: config.sendLocationWithRegistration,
          customServerBox: false,
          rttServer: config["rttserver"]
        });
        if ((serverData.servers).includes(config['provider-domain']) === false) {
          this.changeServer(config['provider-domain']);
        }
      }
      else {
        console.log("Registration failed!");
        this.props.displayUserMessage("Error", "JSON Validation Failed", "JSON object should contain the following properties: phoneNumber, server and password");
      }
  }

  //Handles the onChange for the "Upload Config File" button
  handleConfigFile(event: React.ChangeEvent<HTMLInputElement>) {

    event.preventDefault();
    //@ts-ignore
    if (event.target.files[0] !== null && event.target.files[0] !== undefined) {
      //@ts-ignore
      // We need a lot of ts-ignores in this function because typescript doesn't
      // doesn't like the fact that files can be null, it also doesn't realize 
      // that file implements blob and has the text() function
      const file: File = event.target.files[0];

      //@ts-ignore
      // We read the contents of the file as text
      file.text().then((text) => {
        let config: configType;
        try {
          config = JSON.parse(text) as configType;
        }
        catch (e) {
          console.error(e);
          log.error(e);
          this.props.displayUserMessage("Error", "Config File Error", "JSON parsing failed! Is this a valid JSON object?");
          return;
        }

        this.parseLoginConfig(config);
      });
      //We use the line below to reset the value as this allows a file to be uploaded multiple times.
      //@ts-ignore
      event.target.value = null;
    }
  }

  handleConfigFileFromRemoteServer(event: React.ChangeEvent<HTMLInputElement>) {
    
    log.debug("Get Login Config from HTTP request " + event.target.value);
    ipcRenderer.send('getLoginConfig', event.target.value);

    ipcRenderer.once('obtainedLoginConfig', (event, fetchJson) => {
      let config: configType;
      try {
        config = fetchJson as configType;
      }
      catch (e) {
        console.error(e);
        log.error(e);
        this.props.displayUserMessage("Error", "Config File Error", "JSON parsing failed! Is this a valid JSON object?");
        return;
      }

      this.parseLoginConfig(config);
      log.debug("Parsed Login Config from HTTP request");
    });

    ipcRenderer.once('failedLoginConfigServer', (event, error) => {
      log.error('Error:', error);      
      this.props.displayUserMessage("Error", "Remote Login Server Error", error);
    })

  }

  checkboxChanged(event : React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const value  = target.checked;
    
    if(target.name === 'rtt'){
      this.setState({ rttChecked: value });
    }
    //this.forceUpdate();
  }

  handleChange(event : React.ChangeEvent<HTMLInputElement>) {

    const target = event.target;
    const value  = target.value;
    const name   = target.name;
    // @ts-ignore
    this.setState({[name]: String(value)}); 
  }

  handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>){

    const target = event.target;
    let value = target.value;
    this.changeServer(value)
  }

  changeServer(server: string){

    //if the server uploaded from a config file isn't in the dropdown list, 
    //select "Custom" and load in the server name in the input box
    if ((serverData.servers).includes(server) === false && server !== "Custom" && server !== "Select a server"){
      this.setState({customServerBox: true});
      this.setState({server: "Custom"});
      this.setState({customServer: server})
    }
    else if(server === "Custom"){
      this.setState({customServerBox: true});
      this.setState({server: "Custom"});
    }
    else{
      // @ts-ignore
      this.setState({customServerBox: false});
      this.setState({server: server});
    }
  }

  formatRegistrationParameters(
    server: string,
    phoneNumberText: string
  ) {
    server = server.trim()  
    phoneNumberText = phoneNumberText.trim()
    if (phoneNumberText[0] === '1'){
      phoneNumberText = phoneNumberText.substr(1);
    }

    let serverString = "wss://" + server + "/ws";
    let uri = "sip:" + phoneNumberText + "@" + server;
    console.log(uri);
    return[serverString, phoneNumberText, uri];
  }

  handleVATRPmodeChange(event : React.ChangeEvent<HTMLSelectElement>){
    const target = event.target;
    let value = target.value;
    this.setState({ VATRPmode : value});
    
  }

  processLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let server = (this.state.customServerBox ? this.state.customServer : this.state.server);
    let phoneNumber = this.validatePhoneNumberFormat(this.state.phoneNumber);

    if (phoneNumber && this.validateLoginForm(server, this.state.password)) {
      let [serverString, phoneNumberText, uri] = this.formatRegistrationParameters(server, this.state.phoneNumber);

    if (this.props.settings.logName &&
        this.props.settings.logName.substring(0, 7) !== this.state.phoneNumber) {
          const lognameObject = {
            name: "logName",
            value: phoneNumberText + "_VATRPLogs"
          }
        
            // verifying if the update to state has already been done.  Eliminating a "maximum update depth" exceeded message
        if (!_.isEqual(lognameObject.value, this.props.settings.logName)) 
          this.props.UpdateUserSetting(lognameObject)
      }      
      if(this.state.rttChecked === true){
        this.props.displayUserMessage("Info", "Launch Janus Page!", "Component not implemented!");
      } else if(this.state.VATRPmode === "JanusDemo"){
        console.log("Using janus demo login");
        var promiseDemo = new Promise((resolve, reject) => {
          this.props.UpdateUserSetting({ 'name': 'isRTT', 'value': true });
          resolve('Success');
        });
        promiseDemo
        .then((data : any) => {
          this.props.rttRegister({ 'username': this.state.phoneNumber, 'server': this.state.customServerBox ? this.state.customServer : this.state.server, password: this.state.password });
        })
        .then((data : any) => {
          let newSetting = {
            name: 'VATRPmode',
            value: 'JanusDemo'
          }
          this.props.UpdateUserSetting(newSetting);
        })
      } else if(this.state.VATRPmode === "FullJanusCommunication"){
        var promise = this.initiateJanus();
        promise
        .then((data : any) => {
          this.setState({janus : data});
        })
        .then((data : any) => this.attachJanus(this.state.janus, this.props.janusRemoteRef, this.props.janusSelfRef))
        .then((data : any) => {
          this.setState({sipHandler : data});
        })
        .then((data : any) => {
          this.props.UpdateUserSetting({name: 'VATRPmode', value: this.state.VATRPmode})
        })
        .then((data : any) => {
          var register = {
            "request" : "register", 
            "username" : "sip:" + this.state.phoneNumber + "@" + (this.state.customServerBox ? this.state.customServer : this.state.server), 
            "authuser" : this.state.phoneNumber, 
            "display_name" : this.state.phoneNumber, 
            "secret" : this.state.password,
            "proxy" : "sip:" + (this.state.customServerBox ? this.state.customServer : this.state.server), 
            "sipHandler" : this.state.sipHandler, 
            "janus" : this.state.janus, 
            "server" : this.state.customServerBox ? this.state.customServer : this.state.server,
            "jsep" : this.state.jsep
          };
          this.props.registerUser(register);
        })
        .then((data : any) => {
          this.props.setThisCurrentUser(this.state.phoneNumber);
          this.props.setIsJanus(true);
          this.props.setHandle(this.state.sipHandler);
          return data;
        })
        .catch((error) => {
          console.log("Caught error :" + error);
        })

      } else {
        let jssipService = this.establishJssipService(serverString, uri, this.state.password);
        /*const newConfig = {
          server: serverString,
          uri: uri,
          password: this.state.password
        }*/
       this.performJssipRegistration(phoneNumberText, jssipService);
      }
    }
  }

  validateLoginForm(
    serverText: string,
    passwordText: string
  ) {
    if (
      this.checkRequiredFieldExists(serverText, 'server') &&
      this.checkRequiredFieldExists(passwordText, 'password')
    )
    {
      return true;
    }
    else {
      return false
    }
  }

  checkRequiredFieldExists(
    fieldText: string, 
    errorMessageField: string
  ) {
    if (fieldText.length === 0) {
      this.props.displayUserMessage("Error", "Missing Required Field", `Missing ${errorMessageField}`);
      return false;
    }
    else {
      return true;
    }
  }
  
  validatePhoneNumberFormat(
    phoneNumberText: string
  ) {
    //remove non-numerical characters from the number
    phoneNumberText = phoneNumberText.replace(/[^0-9.]+/g, '');

    //remove leading 1 from the number, if it exists
    if (phoneNumberText[0] === '1') {
      phoneNumberText = phoneNumberText.substr(1);
    }

    //enforce that the phone number must be 10 digit 
    if (phoneNumberText.length !== 10) {
      this.props.displayUserMessage("Error", "Phone Number Error", "Phone number must be a 10-digit number");
      return false;
    }
    else {
      this.setState({ phoneNumber: phoneNumberText });
      return phoneNumberText;
    }
  }

  establishJssipService(
    server: string,
    uri: string,
    password: string
  ) {
    let socket = new WebSocketInterface(server);

    let config: UserAgentConfiguration = {
      sockets: [socket],
      uri,
      password
    };
    //let service = new jssipService(config);

    //return this.props.registerUA(config)
    let service = new jssipService(config);
    return service;
  }

  performJssipRegistration(
    phoneNumberText: string,
    jssipService: jssipService
  ) {
    jssipService.registerConnectingCallback(()=>{this.props.setThisCurrentUser(phoneNumberText)} )
    if(this.state.sendLocRegistration === true){
      //Add geolocation and call-info
      let extraHeader: string[] = new Array(3);
      let geoHeaderValueFromConfigJson: string = '<http://test.org>';
      let callInfoValueFromConfigJson: string = '<http://test.org>';
      console.dir(this.props.settings)
      if (this.props.settings.geolocationURI !== "" &&
          this.props.settings.geolocationURI !== undefined) {
          geoHeaderValueFromConfigJson = this.props.settings.geolocationURI;
      }

      if (this.props.settings.contactURI !== "" &&
          this.props.settings.contactURI !== undefined) {
          callInfoValueFromConfigJson = this.props.settings.contactURI;
      }
      else {
        callInfoValueFromConfigJson = geoHeaderValueFromConfigJson;
      }
      let geoHeader: string = 'Geolocation: ';
      geoHeader = geoHeader.concat(geoHeaderValueFromConfigJson);
      geoHeader = geoHeader.concat(';purpose=geolocation')
      let callinfoHeader: string = 'Call-Info: ';
      callinfoHeader = callinfoHeader.concat(callInfoValueFromConfigJson);
      callinfoHeader = callinfoHeader.concat(';purpose=rue-owner')
      let supportedHeader: string = 'Supported: replaces, outbound, geolocation-http';
      extraHeader[0] = geoHeader;
      extraHeader[1] = callinfoHeader;
      extraHeader[2] = supportedHeader;
      console.log(extraHeader.toString());
      log.info(extraHeader.toString());
      jssipService.uaRegistrator(extraHeader);
    }
    if (this.state.rttChecked === false) {
      jssipService.uaStart({}, () => { });
      this.handleRegistrationEvents(jssipService, phoneNumberText);
      this.props.setJssipService(jssipService);
    } else {
      this.props.rttRegister({ 'username': this.state.phoneNumber, 'server': this.state.customServerBox ? this.state.customServer : this.state.server, password: this.state.password });
      this.props.UpdateUserSetting({ 'name': 'isRTT', 'value': this.state.rttChecked });
    }
  }

  handleRegistrationEvents(
    jssipService: jssipService,
    phoneNumberText: string
  ) {
    jssipService.registerOnRegisteredCallback(this.props.setIsRegistered);
    jssipService.registerOnRegistratonFailedCallback(() => {
      console.log("LoginPage registration failed");
      this.props.displayUserMessage("Error", "Sign-in Error", "Invalid username or password");
    });
    jssipService.registerOnRegistrationTimeoutCallback(() => {
      this.props.displayUserMessage("Error", "Sign-in Error", "Registration timeout");
    });
  }

  initiateJanus(){
    var janus : any;
    var self = this;
    return new Promise(function(resolve, reject) {
      Janus.init({debug: "all", callback: function() {
        janus = new Janus(
          {
            server: self.state.rttServer,
            success: function() {
              resolve(janus);
            },
            error: function(error : any) {
              console.log("Error")
              reject("Failure to create Janus: " + error);
            }
          })
      }})
    })
  }

  attachJanus(janus : any, remoteRef : any, localRef : any){
    var sipHandler : any;
    var opaqueId = "siptest-"+Janus.randomString(12);
    var self = this;
    
    return new Promise(function(resolve, reject) {
      janus.attach(
        {
          plugin: "janus.plugin.sip",
          opaqueId: opaqueId,
          success: function(pluginHandle : any) {
            sipHandler = pluginHandle;
            resolve(sipHandler);
          },
          error: function(error : any) {
            console.log("ERROR ATTACHING JANUS: " + error);
            reject(error);
          },
          consentDialog: function(on : any) {
            
          },
          iceState: function(state : any) {
            console.log("Got ice state event");
          },
          mediaState: function(medium : any, on : any) {
            
          },
          webrtcState: function(on : any) {
            
          },
          onmessage: function(msg : any, jsep : any) {
            var callId = msg["call_id"];
            var result = msg["result"];
            if(result && result["event"]) {
              var event = result["event"];
              if(event === 'registered') {
              } else if(event === 'calling') {
                // TODO Any ringtone?
              } else if(event === 'incomingcall') {
                self.props.janusIncoming({jsep : jsep});
                self.props.setIncomingCall(true);
                self.props.setJanusNumber(result["username"]);
              } else if(event === 'accepting') {
                // Response to an offerless INVITE, let's wait for an 'accepted'
              } else if(event === 'progress') {
                // Call can start already: handle the remote answer
              } else if(event === 'accepted') {
                self.props.janusRemoteAccept({jsep : jsep, callId : callId});
              } else if(event === 'updatingcall') {

              } else if(event === 'message') {
                // We got a MESSAGE
                console.log("GOT MESSAGE");
              } else if(event === 'info') {
                // We got an INFO
              } else if(event === 'notify') {
                // We got a NOTIFY
              } else if(event === 'transfer') {
                // We're being asked to transfer the call, ask the user what to do
              } else if(event === 'hangup') {
                // Reset status
                self.props.setJanusCall(false);
                self.props.janusHangup({});                
              }
            }
          },
          onlocalstream: function(stream : any) {
            //Janus.debug(" ::: Got a local stream :::", stream);
            //@ts-ignore
            Janus.attachMediaStream(localRef.current, stream);
            console.log("Attaching local media stream");
          },
          onremotestream: function(stream : any) {
            //Janus.debug(" ::: Got a remote stream :::", stream);
            //@ts-ignore
            Janus.attachMediaStream(remoteRef.current, stream);
            console.log("Attaching remote media stream");
          },
          ondataopen: function(label : any, protocol : any) {
            //Janus.log("The DataChannel is available! " + label + " (protocol=" + protocol + ")");
            console.log("DATA CHANNEL IS OPEN " + protocol);
            self.props.janusChannelOpen({});
          },
          ondata: function(data : any) {
            //Janus.debug("We got data from the DataChannel!", data);
            self.props.janusRTTReceive({'receivedRTT' : data});
            
          },
          oncleanup: function() {

          }
      });
    })
  }

  hideGeolocationModal(){
    this.setState({geolocationModal : false});
  }

  
  showGeolocationModal(){
    this.setState({geolocationModal: true});
  }

  hideDebugModal(){
    this.setState({debugModal : false});
  }

  showDebugModal(){
    this.setState({debugModal : true});
  }

  componentDidMount(){
  }
  render() {

    let geo = 
      <Geolocation
        displayUserMessage={ this.props.displayUserMessage }
        hideGeolocationModal = {this.hideGeolocationModal}
      />;

    let debug =
      <DebugModal
        settingsService={this.props.settingsService}
        setLoggingLevel={this.props.setLoggingLevel}
        setLoggerPath={this.props.setLoggerPath}
        hideDebugModal={this.hideDebugModal}
      />

    let serverDefUi;
      if (this.state.serverDefType === 'file') {
        serverDefUi= 
          <Form>
            <Form.Group>
              <div className="row justify-content-center mt-3">
                <div className="col-sm-5">
                  <input type="file" className="fileInput" id="config-file-input" onChange={this.handleConfigFile} />
                  <label className="btn btn-primary btn-block fileInputLabel" htmlFor="config-file-input">
                    Open JSON profile
            </label>
                </div>
              </div>
            </Form.Group>
          </Form>;
      }
      else {
        serverDefUi= <Form.Group
              id="serverConfigUpload"
              controlId="formBasicInput">
              <Form.Control
                type="text"
                defaultValue={this.state.loginFileURI}
                onBlur={this.handleConfigFileFromRemoteServer}
                placeholder="Remote server location here e.g. https://providerserver/loginconfg.json">
              </Form.Control>
            </Form.Group>;

      }

      return(
        <div className="login-page row justify-content-center">
          <div className="col-md-10">
            <div className="text-center">
              <Image src={logo} className="img-fluid text-center" id="vatrp-logo" alt="VATRP logo" />
              <Button value="debugModal" onClick={() => this.showDebugModal()} aria-label="Enter Debug Settings">Log Settings</Button>
              <br/>{process.env.npm_package_version || require('electron').remote.app.getVersion()}
            </div>
          {this.state.geolocationModal && geo}
          {this.state.debugModal && debug}
  
            <Form id="login-form" onSubmit={this.processLogin}>
              <Form.Group as={Row}>
                <Form.Label className="text-right" column sm="3">Phone Number</Form.Label>
                <Col sm="7">
                  <Form.Control
                    type="text"
                    id="phone-number-input"
                    value={this.state.phoneNumber}
                    onChange={this.handleChange}
                    name="phoneNumber"
                    aria-label="Enter phone number"
                    aria-required="true">
                  </Form.Control>
                </Col>
              </Form.Group>
  
              <Form.Group as={Row}>
                <Form.Label className="text-right" column sm="3">SIP Server</Form.Label>
                <Col sm="7">
                  <Form.Control 
                    as="select"
                    name="server"
                    aria-label="Select a Server"
                    aria-required="true"
                    value={this.state.server}
                    onChange={this.handleSelectChange}
                  >
                    <option value="default">Select a server</option>
                    {this.loadServerOptions()}
                    <option aria-label="Custom server. Enter server on the next line">Custom</option>
                  </Form.Control>
                </Col>
              </Form.Group>
  
              {this.state.customServerBox ? <Form.Group as={Row}>
              <Form.Label column sm="3"></Form.Label>
              <Col sm="7">
                <Form.Control
                  type="text"
                  name="customServer"
                  placeholder="Type in your custom server"
                  value={this.state.customServer}
                  onChange={this.handleChange}>
                </Form.Control>
              </Col>
              </Form.Group>
              : null}
  
              <Form.Group as={Row}>
                <Form.Label className="text-right" column sm="3">Password</Form.Label>
                <Col sm="7">
                  <Form.Control
                    type="password"
                    id="password-input"
                    name="password"
                    aria-label="Enter your password"
                    aria-required="true"
                    value={this.state.password}
                    onChange={this.handleChange}>
                  </Form.Control>
                </Col>
              </Form.Group>

              {this.state.VATRPmode === "FullJanusCommunication" ? <Form.Group as={Row}>
              <Form.Label className="text-right" column sm="3">Gateway Server</Form.Label>
              <Col sm="7">
                <Form.Control
                  type="text"
                  name="rttServer"
                  placeholder="Enter the URL of your T140 WebRTC Server"
                  value={this.state.rttServer}
                  onChange={this.handleChange}>
                </Form.Control>
              </Col>
              </Form.Group>
              : null}
  
              <Form.Group as={Row}>
                <Col className="text-center" md="12">
                  <Button value="Sign In" onClick={() => this.showGeolocationModal()} aria-label="Enter Geolocation">Enter Geolocation</Button>
                </Col>
              </Form.Group>
  
              <Form.Group as={Row}>
                <Col className="text-center" md="12">
                  <Button type="submit" value="Sign In" aria-label="Sign In">Sign In</Button>
                </Col>
              </Form.Group>
            </Form>
  
            <Form.Group as={Row}>
                <Form.Label className="text-right" column sm="3">Call mode</Form.Label>
                <Col sm="7">
                  <Form.Control 
                    as="select"
                    name="VATRPmode"
                    aria-label="Select a communication mode"
                    aria-required="true"
                    value={this.state.VATRPmode}
                    onChange={this.handleVATRPmodeChange}
                  >
                    <option key="StandardSIPCalling" value="StandardSIPCalling"> Standard SIP</option>
                    {/*<option key="JanusDemo" value="JanusDemo"> Realtime Text Demo </option>*/}
                    <option key="FullJanusCommunication" value="FullJanusCommunication"> Realtime Text via Gateway Server</option>
                  </Form.Control>
                </Col>
              </Form.Group>
            
            <div className='container border border-1'>
              <Form.Group as={Row}>
                <Form.Label className="text-right" column sm="3">Load profile:</Form.Label>
                <Col sm="7">
                  <Form.Control as="select" 
                    value={this.state.serverDefType}
                    onChange={this.handleChange}
                    name="serverDefType">
                    <option value="file" >From File </option>
                    <option value="remote">From Remote Server</option>
                  </Form.Control>
                </Col>
              </Form.Group>
  
              {serverDefUi}
  
              
            </div>
  
          </div>
        </div>
      );
    }
  }
  export default connector(LoginPage);
