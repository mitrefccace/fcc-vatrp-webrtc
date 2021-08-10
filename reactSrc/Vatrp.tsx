import { WebSocketInterface} from 'jssip';
import React from 'react';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import JssipService from './services/JssipService';
import SettingsService from './services/SettingsService';
import AudioService from './services/AudioService';
import { ipcRenderer } from 'electron';
import { Toast } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';
import './Vatrp.css';
import { IntUpdateSettingsType } from './store/settings/types';
import { BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";
import { RefObject, createRef } from 'react';


const log = require('electron-log');
const path = require('path');

type vatrpState = {
  jssipService    : JssipService
  settingsService : SettingsService
  audioService    : AudioService
  isRegistered    : Boolean
  toastMessages   : Array<toastAlert>
  logName         : String
  isRTT           : Boolean
  fullJanus       : Boolean
  janusRemoteRef  : RefObject<HTMLVideoElement>;
  janusSelfRef    : RefObject<HTMLVideoElement>;
  sipHandle       : any;
  janusIncoming   : boolean;
  janusCall       : boolean;
  janusRemoteNumber : String;
}

const mapStateToProps = (state: any) => {
  return {
    settings: state.settingsManager.settings,
    jssip: state.jssipManager,
    username: state.username,
    password: state.password,
    sipRegistrar: state.sipRegistrar,
    sipIdentity: state.sipIdentity,
    janusState: state.settingsManager.janusState
  };
};
  
const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch({type: 'UPDATE_SETTING', payload: name})
});

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type vatrpProps = PropsFromRedux

/*
const mapStateToProps = (state : any) => {
  return {
    username: state.username,
    password: state.password,
    sipRegistrar: state.sipRegistrar,
    sipIdentity: state.sipIdentity
  };
};
*/

type toastAlert = {
  logLevel   : "Error" | "Success" | "Info"
  title      : string
  messageBody: string
  id         : number
};

type isRTT = boolean;

class Vatrp extends React.Component <vatrpProps, vatrpState> {
  constructor(props: vatrpProps) { 
    super(props);
    let settingsservice = new SettingsService();
    this.state = {
      // When the VATRP component is created, we intentionally create a phony
      // and bad JsSip interface and make sure not to start it. We have to do
      // this because we never want to have a null JsSip service, because that
      // would mess with TypeScript. TS doesn't like when an object is 
      // potentially null or undefined, so to avoid that, we assign a baloney
      // jssipservice before logging in to register
      settingsService: settingsservice,
      jssipService: new JssipService({
        uri: "sip:intentionally@example.com", 
        sockets: [new WebSocketInterface("ws://example.com")]}),
        //new SettingsService()
      audioService     : new AudioService(),
      isRegistered     : false,
      toastMessages    : [],
      //logName : settingervice.loadSetting("logName") ? settingervice.loadSetting("logName") : "VATRPLogs"
      logName          : this.props.settings.logName ? this.props.settings.logName : "VATRPLogs",
      isRTT            : false,
      fullJanus        : false,
      janusSelfRef     : createRef(),
      janusRemoteRef   : createRef(),
      sipHandle        : {},
      janusIncoming    : false,
      janusCall        : false,
      janusRemoteNumber: ''
    };
    this.setJssipService    = this.setJssipService.bind(this);
    this.setIsRegistered    = this.setIsRegistered.bind(this);
    this.setNotRegistered   = this.setNotRegistered.bind(this);
    this.displayUserMessage = this.displayUserMessage.bind(this);
    this.deleteAlert        = this.deleteAlert.bind(this);
    this.getToasts          = this.getToasts.bind(this);
    this.setLoggingLevel    = this.setLoggingLevel.bind(this);
    this.setLogName         = this.setLogName.bind(this);
    this.setLoggerPath      = this.setLoggerPath.bind(this);
    this.onClosing          = this.onClosing.bind(this);    
    this.setIsRTT           = this.setIsRTT.bind(this);
    this.setIsJanus         = this.setIsJanus.bind(this);
    this.setHandle          = this.setHandle.bind(this);
    this.setIncomingCall    = this.setIncomingCall.bind(this);
    this.setJanusCall       = this.setJanusCall.bind(this);
    this.setJanusNumber     = this.setJanusNumber.bind(this);

    if(this.props.settings.logLevel){
      log.transports.file.level = this.props.settings.logLevel
    }else{
      log.transports.file.level = "debug";
      props.UpdateUserSetting({"name": "logLevel", "value": log.transports.file.level})
    }

    if(props.settings.logPath){
      log.transports.file.file = path.join(this.props.settings.logPath, this.props.settings.logName + ".log");
    }

    log.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} {level} {text}'

    ipcRenderer.on('closing', this.onClosing);
  }

  componentDidMount(){
    this.setLogName("VATRP_" + Date.now().toString() + "_Logs");
  }

  onClosing(event: Electron.IpcRendererEvent) {
    this.state.jssipService.terminateCall();
    log.info("closing vatrp");
  }
  setLoggingLevel(level : String){
    log.transports.file.level = level;
  }

  setLogName(newLogName : String){
    this.setState({logName : newLogName});  
    log.transports.file.fileName = newLogName + ".log";
    //log.transports.file.file = path.join(this.props.settings.logPath, log.fileName + ".log");
    this.props.UpdateUserSetting({name:'logName', value: newLogName})

  }

  setIncomingCall(inCall : boolean){
    this.setState({janusIncoming : inCall});
  }
  //Used for RTT calls specifically for assining to the call modal and RTT chat
  setJanusNumber(number : String){
    this.setState({janusRemoteNumber : number});
  }

  setJanusCall(inCall : boolean){
    this.setState({janusCall : inCall});
  }

  setLoggerPath(filePath : String){
    log.transports.file.file = path.join(filePath, this.state.logName + ".log");
    log.transports.file.streamConfig = { flags: 'w'};

  }

  displayUserMessage(messageType: "Error" | "Success" | "Info", title: string, messageBody: string) {
    let alert: toastAlert = {logLevel: messageType, title: title, messageBody: messageBody, id: Date.now()}
    let newToastMessages = this.state.toastMessages;
    newToastMessages.push(alert);
    this.setState({toastMessages: newToastMessages});
  }

  deleteAlert(id: number) {
    let newToastMessages = this.state.toastMessages.filter((x: toastAlert) => x.id !== id);
    this.setState({toastMessages: newToastMessages});
  }

  getToasts() {
    return this.state.toastMessages.map((alert: toastAlert) => {
      return(<Toast key= {alert.id} onClose={() => {this.deleteAlert(alert.id)}} className="toast-alert" >
            <Toast.Header>
              {alert.logLevel === "Error" && (<span className="mr-2 alert-indicator" role="img" aria-label="Error">⚠</span>)}
              {alert.logLevel === "Success" && (<span className="mr-2 alert-indicator" role="img" aria-label="Success">✔</span>)}
              {alert.logLevel === "Info" && (<span className="mr-2 alert-indicator" role="img" aria-label="Info">💬</span>)}
              <strong className="mr-auto alert-title">{alert.title}</strong> 
              {/* <small className="text-danger">{alert.logLevel}</small>         */}
            </Toast.Header>
            <Toast.Body className="alert-message-body">
              {alert.messageBody}
            </Toast.Body>
          </Toast>)
    })
  }
  
  setJssipService(jssipService: JssipService) {
    this.setState({jssipService});
  }

  setIsRTT(val : boolean){
    this.setState({isRTT : val});
  }

  setIsJanus(val : boolean){
    this.setState({fullJanus : val});
    let newSetting = {
      name: 'VATRPmode',
      value: 'FullJanusCommunication'
    }
    this.props.UpdateUserSetting(newSetting);
  }

  setHandle(val : any){
    this.setState({sipHandle : val});
  }

  setIsRegistered() {
    this.setState({isRegistered: true});
  }

  setNotRegistered(){
    this.setState({isRegistered: false});
  }

  render() {
    let isRegistered = this.state.jssipService.isUARegistered();
    //let isRegistered = true;

    if (this.props.settings.VATRPmode === "JanusDemo") {
      var url = "/janus/test.html?username=" + this.props.settings.rttLogin.username 
                + "&password=" + this.props.settings.rttLogin.password 
                + "&sipRegistrar=" + this.props.settings.rttLogin.sipRegistrar
                + "&sipIdentity=" + this.props.settings.rttLogin.sipIdentity;
      console.log(url)
      return (
        <Router forceRefresh={true}>
          <Switch>
            <Route exact strict path="/" render={({ location }) => {
              if (location.pathname === window.location.pathname) {
                return <Redirect to={url} />;
              }
              return null;
            }} />
          </Switch>
        </Router>)
    }
    else 
    return (
     <div className="App">
        {isRegistered || (this.props.settings.VATRPmode === "FullJanusCommunication") ? 
          <HomePage 
            jssipService={this.state.jssipService} 
            audioService={this.state.audioService}
            settingsService={this.state.settingsService} 
            setNotRegistered={this.setNotRegistered} 
            setLoggingLevel={this.setLoggingLevel}
            setLoggerPath={this.setLoggerPath}
            displayUserMessage={this.displayUserMessage}
            setLogName={this.setLogName}
            janusRemoteRef={this.state.janusRemoteRef}
            janusSelfRef={this.state.janusSelfRef}
            sipHandle={this.state.sipHandle}
            janusIncoming={this.state.janusIncoming}
            janusCall={this.state.janusCall}
            setIncomingCall={this.setIncomingCall}
            setJanusCall={this.setJanusCall}
            janusRemoteNumber={this.state.janusRemoteNumber}
            /> :
          <LoginPage 
            setJssipService={this.setJssipService} 
            setIsRegistered={this.setIsRegistered} 
            settingsService={this.state.settingsService}
            displayUserMessage={this.displayUserMessage}
            setLoggingLevel={this.setLoggingLevel}
            setLoggerPath={this.setLoggerPath}
            setIsRTT={this.setIsRTT}
            setIsJanus={this.setIsJanus}
            janusRemoteRef={this.state.janusRemoteRef}
            janusSelfRef={this.state.janusSelfRef}
            setHandle={this.setHandle}
            setIncomingCall={this.setIncomingCall}
            setJanusCall={this.setJanusCall}
            setJanusNumber={this.setJanusNumber}/>
          }
        
        {this.state.toastMessages.length !== 0 && <div id="toast-holder" style={{zIndex:100}}>
          {this.getToasts()}
        </div>}
        
      </div>
    );
  }
}

export default connector(Vatrp);