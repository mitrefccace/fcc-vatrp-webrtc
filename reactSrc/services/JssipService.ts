import * as jssip from 'jssip';
import { RefObject, createRef } from 'react';
import reduxStore from '../store/';
import updateCallStatus from '../store/calls/actions';
import { UpdateUserSetting } from '../store/settings/actions';
import { SettingsState } from '../store/settings/types';
const log = require('electron-log');

const Store = require('electron-store');
const store = new Store();

var CircularBuffer = require("circular-buffer")

//commented out below because typescript whines about it
// const jssip_debug = true; //enables debugging logs from jssip library if true NOTE: may have to refresh a lot to update change
const debug = true;
//let jssipDebug: any = jssip.debug('JsSIP:*');
//jssip.debug('JsSIP:*');
type uaStartParams = {};

export default class JssipService {
  ua                                   : jssip.UA;
  sessions                             : {currentSession: jssip.RTCSession | null, allSessions: jssip.RTCSession[]};
  phoneNumber                          : String;
  jssipconfiguration                   : jssip.UserAgentConfiguration;
  settings                             : SettingsState;
  remoteVideoRef                       : RefObject<HTMLVideoElement>;
  selfVideoRef                         : RefObject<HTMLVideoElement>;
  storedSelfStream                     : MediaStream | undefined;
  storedRemoteStream                   : MediaStream | undefined;
  remoteVideoStreams                   : {[remoteUri: string]: MediaStream}
  currentUser                          : string;
  uaSipEventCallbackStack              : Array<Function>;
  uaConnectedCallbackStack             : Array<Function>;
  uaConnectingCallbackStack            : Array<Function>;
  uaDisconnectedCallbackStack          : Array<Function>;
  uaRegisteredCallbackStack            : Array<Function>;
  uaRegistrationFailedCallbackStack    : Array<Function>;
  uaRegistrationTimeoutCallbackStack   : Array<Function>;
  uaUngresiteredCallbackStack          : Array<Function>;
  uaNewRTCSessionCallbackStack         : Array<Function>;
  sessionAcceptedCallbackStack         : Array<Function>;
  sessionEndedCallbackStack            : Array<Function>;
  sessionFailedCallbackStack           : Array<Function>;
  sessionConfirmedCallbackStack        : Array<Function>;
  sessionConnectingCallbackStack       : Array<Function>;
  peerCreateOfferFailCallbackStack     : Array<Function>;
  peerCreateAnswerFailCallbackStack    : Array<Function>;
  peerSetLocalDescFailCallbackStack    : Array<Function>;
  peerSetRemoteDesFailCallbackStack    : Array<Function>;
  getUserMediaFailedCallBackStack      : Array<Function>;
  currentSessionConnectionCallbackStack: Array<Function>;

  constructor(config: jssip.UserAgentConfiguration) {
    this.ua                 = new jssip.UA(config);
    this.sessions           = {currentSession: null, allSessions: []};
    this.phoneNumber        = "Unknown number";
    this.currentUser        = reduxStore.getState().settingsManager.settings.currentUser ? reduxStore.getState().settingsManager.settings.currentUser : ''
    this.jssipconfiguration = config;
    this.settings           = reduxStore.getState().settingsManager.settings
    this.remoteVideoRef     = createRef();
    this.selfVideoRef       = createRef();
    this.remoteVideoStreams = {}
    //Creating function arrays to store multiple callbacks
    this.uaSipEventCallbackStack = [];
    this.uaOnSipEvent();

    this.uaConnectedCallbackStack = [];
    this.uaOnConnected();

    this.uaConnectingCallbackStack = [];
    this.uaOnConnecting();

    this.uaDisconnectedCallbackStack = [];
    this.uaOnDisconnected();

    this.uaRegisteredCallbackStack = [];
    this.uaOnRegistered();

    this.uaRegistrationFailedCallbackStack = [];
    this.uaOnRegistrationFailed();

    this.uaRegistrationTimeoutCallbackStack = [];

    this.uaUngresiteredCallbackStack = [];
    this.uaOnUnregistered();

    this.uaNewRTCSessionCallbackStack = [];
    this.uaOnNewRTCSession();

    this.sessionAcceptedCallbackStack = [];
    this.sessionEndedCallbackStack = [];
    this.sessionFailedCallbackStack = [];
    this.sessionConfirmedCallbackStack = [];
    this.sessionConnectingCallbackStack = [];
    this.peerCreateOfferFailCallbackStack = [];
    this.peerCreateAnswerFailCallbackStack = [];
    this.peerSetLocalDescFailCallbackStack = [];
    this.peerSetRemoteDesFailCallbackStack = [];
    this.getUserMediaFailedCallBackStack = [];
    this.currentSessionConnectionCallbackStack = [];

    this.uaOnSipEvent                       = this.uaOnSipEvent.bind(this);
    this.uaOnConnected                      = this.uaOnConnected.bind(this);
    this.uaOnConnecting                     = this.uaOnConnecting.bind(this);
    this.uaOnDisconnected                   = this.uaOnDisconnected.bind(this);
    this.uaOnRegistered                     = this.uaOnRegistered.bind(this);
    this.uaOnRegistrationFailed             = this.uaOnRegistrationFailed.bind(this);
    this.uaOnRegistrationTimeout            = this.uaOnRegistrationTimeout.bind(this);
    this.registerOnSipEventCallback         = this.registerOnSipEventCallback.bind(this);
    this.registerOnConnectedCallback        = this.registerOnConnectedCallback.bind(this);
    this.registerOnRegisteredCallback       = this.registerOnRegisteredCallback.bind(this);
    this.registerOnRegistratonFailedCallback= this.registerOnRegistratonFailedCallback.bind(this);
    this.uaOnUnregistered                   = this.uaOnUnregistered.bind(this);
    this.uaOnNewRTCSession                  = this.uaOnNewRTCSession.bind(this);

  }

  uaRegistrator(extraHeaders: string[]){
    this.ua.registrator().setExtraHeaders(
      extraHeaders
    );
  }

  uaStart(params: uaStartParams, next: Function) {
    this.ua.start();
    if(next instanceof Function) {
      next();
    }
  }

  /*********************
   * Utility Functions *
   *********************/

  isUARegistered(): Boolean {
    return this.ua.isRegistered();
  }

  isUAConnected(): Boolean {
    return this.ua.isConnected();
  }

  acceptCall(): void {
    if(debug) console.log("Inside acceptCall() \n");
    let options = {
      'mediaConstraints':{
        'audio':true,
        'video':true
      }
    };
    this.sessions.currentSession !== null && this.sessions.currentSession.answer(options);
    this.sessionConnectedOntrack();
    if (debug) console.log("acceptCall() Answer Event Handled\n");
  }

  startCall(phoneNumber: string, _anonymous: boolean) {
    if ((phoneNumber !== "") && (phoneNumber !== undefined)) {
      //Emergency calls need geolocation info in SIP INVITE header
      if ((phoneNumber !== "911")) {
        //Non-911 call
        var options1 = {
          'anonymous': _anonymous,
          'mediaConstraints': {
            'audio': true,
            'video': true
          }
        };
        this.ua.call(phoneNumber, options1);
      }
      else {
        //Read this value from UI Settings
        //let locationBy = this.settings.loadSetting('EmergencyCallType') ? this.settings.loadSetting('EmergencyCallType') : "Location by Reference";
        let useLocationByValue = false;
        //if(locationBy === "Location by Value"){
        //  useLocationByValue = true;
        //}

        let extraHeader: string[] = new Array(3);
        let geoHeaderValueFromConfigJson: string = '<http://testcall.org>';
        let callInfoValueFromConfigJson: string = '<http://testcallinfo.org>';

       if (reduxStore.getState().settingsManager.settings.geolocationURI) {
        geoHeaderValueFromConfigJson = reduxStore.getState().settingsManager.settings.geolocationURI;
      }
        const geolocationObject = {
          "geolocationURI": geoHeaderValueFromConfigJson
        }
        reduxStore.dispatch(UpdateUserSetting(geolocationObject))

         const contactURIObject = {
           name: "contactURI",
           value : callInfoValueFromConfigJson
         }
        reduxStore.dispatch(UpdateUserSetting(contactURIObject))
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
        extraHeader[3] = useLocationByValue ? 'Content-Type: multipart/mixed; boundary=boundary1' : 'Content-Type: application/sdp'
        //extraHeader[3] = 'To: <urn:service:sos;user=dialstring>';
        console.log(extraHeader.toString());
        var parameters = {
          user: 'dialstring'
        }
        let p: undefined = undefined;

        //let toHeader: jssip.URI = new jssip.URI('sip', 'urn:service:sos', 'ntlqasip2.task3acrdemo.com', 0, parameters);
        //let toHeader: jssip.URI = new jssip.URI('urn:service:sos', '911', 'ntlqasip2.task3acrdemo.com', p,parameters);
        let toHeader: jssip.URI = new jssip.URI('sip', phoneNumber, this.jssipconfiguration.uri.toString().split('@')[1], p,parameters);

        var options = {
          'anonymous': _anonymous,
          'mediaConstraints': {
            'audio': true,
            'video': true
          },
          'extraHeaders': extraHeader,
          'locationBody': ''
        };

        if (useLocationByValue){
          options['locationBody'] = 'location here'
          console.log(options['locationBody']);
        }
        this.ua.call(toHeader, options);
      }
    }
    else
      console.log("Recipient number is empty");

  }

  terminateCall(){
    if(this.sessions.currentSession){
      if(!this.sessions.currentSession.isEnded()){
        this.sessions.currentSession.terminate();
      }
    }
  }

  pauseCall(){
    if(this.sessions.currentSession){
      var options = {
        'useUpdate' : true
      };
      this.sessions.currentSession.hold(options);
    }
  }

  unpauseCall(){
    if(this.sessions.currentSession){
      this.sessions.currentSession.unhold();
    }
  }

  enableVideoPrivacy(){
    if(this.sessions.currentSession){
      this.sessions.currentSession.mute({
        audio: false,
        video: true
      });
    }
  }

  disableVideoPrivacy(){
    if(this.sessions.currentSession){
      this.sessions.currentSession.unmute({
        audio: false,
        video: true
      });
    }
  }

  muteCall(){
    if(this.sessions.currentSession){
      this.sessions.currentSession.mute({
        audio: true,
        video: false
      })
    }
  }

  unmuteCall(){
    if(this.sessions.currentSession){
      this.sessions.currentSession.unmute({
        audio: true,
        video: false
      })
    }
  }

  sendDTMF(tone: string, duration:number){
    if(this.sessions.currentSession){
      this.sessions.currentSession.sendDTMF(tone, {duration: duration, interToneGap: 500});
    }
  }

  unregister(){
    var options = {
      all : true
    }
    this.ua.sendSubscribe(this.jssipconfiguration.uri, "1");
    this.ua.unregister(options);
  }

  resubscribe(){
    this.ua.sendSubscribe(this.jssipconfiguration.uri, "1800");
    if(this.ua.isRegistered()){
      setTimeout(this.resubscribe.bind(this), 1800000);
    }
  }

  resetStreams(){
    //@ts-ignore
    this.selfVideoRef.current.srcObject = this.storedSelfStream;
    //@ts-ignore
    this.remoteVideoRef.current.srcObject = this.storedRemoteStream;
  }

  resetRemoteVideoStream(){
    //@ts-ignore
    this.remoteVideoRef.current.srcObject = this.storedRemoteStream;
  }

  /**********************************
   * Callback Function Registration *
   **********************************/
  registerOnSipEventCallback(f : Function){
    this.uaSipEventCallbackStack.push(f);
  }

  registerOnConnectedCallback(f : Function){
    this.uaConnectedCallbackStack.push(f);
  }

  registerConnectingCallback(f : Function){
    this.uaConnectingCallbackStack.push(f);
  }

  registerDisconnectedCallback(f : Function){
    this.uaDisconnectedCallbackStack.push(f);
  }

  registerOnRegisteredCallback(f: Function){
    this.uaRegisteredCallbackStack.push(f);
  }

  registerOnRegistratonFailedCallback(f : Function){
    this.uaRegistrationFailedCallbackStack.push(f);
  }

  registerOnRegistrationTimeoutCallback(f : Function){
    this.uaRegistrationTimeoutCallbackStack.push(f);
  }

  registerUnregisteredCallback(f : Function){
    this.uaUngresiteredCallbackStack.push(f);
  }

  registerRTCcallback(f : Function){
    this.uaNewRTCSessionCallbackStack.push(f);
  }

  /********************************************
   * Internal Callback Registration functions *
   ********************************************/

  registerSessionAcceptedCallback(f : Function){
    this.sessionAcceptedCallbackStack.push(f);
  }

  registerSessionEndedCallback(f : Function) {
    this.sessionEndedCallbackStack.push(f);
  }

  registerSessionFailedCallback(f : Function){
    this.sessionFailedCallbackStack.push(f);
  }

  registerSessionConfirmedCallback(f : Function){
    this.sessionConfirmedCallbackStack.push(f);
  }

  registerSessionConnectingCallback(f : Function){
    this.sessionConnectingCallbackStack.push(f);
  }

  registerPeerCreateOfferFailedCallback(f : Function){
    this.peerCreateOfferFailCallbackStack.push(f);
  }

  registerPeerCreateAnswerFailedCallback(f : Function){
    this.peerCreateAnswerFailCallbackStack.push(f);
  }

  registerPeerSetLocalDescFailedCallback(f : Function){
    this.peerSetLocalDescFailCallbackStack.push(f);
  }

  registerPeerSetRemoteDescFailedCallback(f : Function){
    this.peerSetRemoteDesFailCallbackStack.push(f);
  }

  registerGetUserMediaFailedCallback(f : Function){
    this.getUserMediaFailedCallBackStack.push(f);
  }
  registerSessionConnectionOnTrack(f: Function) {
    this.currentSessionConnectionCallbackStack.push(f);
  }

   /*************************************
    * RTCSession Callback Registrations *
    *************************************/

   // Get the callback stack functions registered on new RTC session
   registerNewSession(){
    this.sessionAccepted();
    this.sessionEnded();
    this.sessionFailed();
    this.sessionConfirmed();
    this.sessionConnecting();
    this.peerConnectionCreateAnswerFailed();
    this.peerConnectionCreateOfferFailed();
    this.peerConnectionSetLocalDescriptionFailed();
    this.peerConnectionSetRemoteDescriptionFailed();
    this.getUserMediaFailed();
    this.sessionConnectedOntrack();
   }


   sessionConnectedOntrack() {
    if(this.sessions.currentSession !== null &&
       this.sessions.currentSession.connection) {

        let callback = (e : RTCTrackEvent) => {
          console.log("STARTING REMOTE VIDEO\ne.streams: " + e.streams + "\ne.streams[0]: " + e.streams[0]);
          log.info("STARTING REMOTE VIDEO");
          log.debug("e.streams: " + e.streams + "\ne.streams[0]: " + e.streams[0]);


          this.storedRemoteStream = e.streams[0];
          if (this.sessions.currentSession){
            this.remoteVideoStreams[this.sessions.currentSession.remote_identity.uri.toString()] = e.streams[0]
          }
          if (this.remoteVideoRef.current){
          //@ts-ignore
          this.remoteVideoRef.current.srcObject = this.storedRemoteStream;
          }

          //this was the magic line. JsSip already gets the webcam stream, and calling getUserMedia again is redundant
          //@ts-ignore
          this.storedSelfStream = this.sessions.currentSession.connection.getLocalStreams()[0];
          if (this.selfVideoRef.current){
          //@ts-ignore
          this.selfVideoRef.current.srcObject = this.storedSelfStream;
          }
        };

        this.sessions.currentSession.connection.ontrack = callback;
    }
   }

   //'accepted'
   sessionAccepted(){
     let callback = (e : jssip.SessionAcceptedEvent) => {
      console.log('\nCURRENTSESSION -  ACCEPTED: \nRESPONSE: \n' + e.response + "\nORIGINATOR:\n" + e.originator);
      log.info("CURRENTSESSION - ACCEPTED");
      log.debug("RESPONSE: " + e.response + "\nORIGINATOR\n" + e.originator);
      log.info(e.response);
      reduxStore.dispatch(updateCallStatus({name:'callEstablished',value:true}));
      for(let f of this.sessionAcceptedCallbackStack){
        f(e);
      }
     }
     this.sessions.currentSession !== null && this.sessions.currentSession.on('accepted', callback);
   }

  //  'ended'
  sessionEnded(){
    console.log('%c getting history list in sessionEnded ','color:red;font-weight:bold')

    let callback = (e : jssip.SessionEndedEvent) => {
      console.log('\nCURRENTSESSION -  ENDED: \nORIGINATOR: \n' + e.originator + '\nMESSAGE:\n' + e.message + "\nCAUSE:\n" + e.cause);
      log.info("CURRENTSESSION - ENDED");
      log.debug('ORIGINATOR: \n' + e.originator + '\nMESSAGE:\n' + e.message + "\nCAUSE:\n" + e.cause);
      log.info(e.message);
      
      //Need to save call history logic
      if(this.sessions.currentSession && this.sessions.currentSession.start_time && this.sessions.currentSession.end_time){
        var callHistoryBuf = new CircularBuffer(5);
        //var tempCallHistory = store.get(this.currentUser + '.callHistory.callHistoryList')
        const tempCallHistory = reduxStore.getState().settingsManager.settings.callHistory.callHistoryList

        for(let ch of tempCallHistory){
          //stack them back up
          callHistoryBuf.push(ch);
        }
        //add to the queue
        callHistoryBuf.enq({
          //@ts-ignore
          'number': this.sessions.currentSession.remote_identity.toString().match(/:(.*)@/)[1],
          'type': this.sessions.currentSession.direction,
          'duration': Math.round((this.sessions.currentSession.end_time.getTime() / 1000) - (this.sessions.currentSession.start_time.getTime() / 1000)),
          'date': this.sessions.currentSession.start_time.getHours() +
            ":" + (this.sessions.currentSession.start_time.getMinutes() < 10 ? '0' + this.sessions.currentSession.start_time.getMinutes() : this.sessions.currentSession.start_time.getMinutes()) +
            " " + (this.sessions.currentSession.start_time.getMonth() + 1) +
            "/" + this.sessions.currentSession.start_time.getDate() +
            "/" + this.sessions.currentSession.start_time.getFullYear()
        });
        
        store.set(this.currentUser + '.callHistory.callHistoryList', callHistoryBuf.toarray());

        reduxStore.dispatch(UpdateUserSetting({name: 'callHistory', value: {callHistoryList: callHistoryBuf.toarray() }}))
        reduxStore.dispatch(updateCallStatus({name: 'callEstablished', value: false}))
      }

      if(this.sessions.currentSession){
        let curSessionIndex = this.sessions.allSessions.indexOf(this.sessions.currentSession);
        this.sessions.allSessions.splice(curSessionIndex, 1);
      }

      for(let f of this.sessionEndedCallbackStack){
        f(e);
      }
    }
    this.sessions.currentSession !== null && this.sessions.currentSession.on('ended', callback);

    this.sessionEndedCallbackStack.push(() => {
      console.log("Closing streams");
      if(this.remoteVideoRef.current){
        this.remoteVideoRef.current.srcObject = null;
      }
      if(this.selfVideoRef.current){
        this.selfVideoRef.current.srcObject = null;
      }
      
      if(this.sessions.allSessions.length > 0)
      {
        this.sessions.currentSession = this.sessions.allSessions[0];
        let sessionIdentifier = this.sessions.currentSession.remote_identity.uri.toString()
        this.storedRemoteStream = this.remoteVideoStreams[sessionIdentifier];
        //@ts-ignore
        this.storedSelfStream = this.sessions.currentSession.connection.getLocalStreams()[0];
        this.resetStreams();
        this.unpauseCall();
      }
      else
      {
        //For some reason, this insanely useful function isn't disclosed to Typescript
        //@ts-ignore
        jssip.Utils.closeMediaStream(this.storedSelfStream);
        //@ts-ignore
        jssip.Utils.closeMediaStream(this.storedRemoteStream);
        this.selfVideoRef   = createRef();
        this.remoteVideoRef = createRef();
        reduxStore.dispatch(updateCallStatus({name:'callEstablished', value:false}))
        console.log('Active Call: ' + reduxStore.getState().callStatusManager.callStatus.callEstablished);
      }
    });
  }

  // 'failed'
  sessionFailed(){
    let callback = (e : jssip.SessionFailedEvent) => {
      console.log('\nCURRENTSESSION -  FAILED: \nMESSAGE:\n' + e.message + "\nCAUSE:\n" + e.cause + "\nORIGINATOR:\n" + e.originator);
      log.info('CURRENTSESSION -  FAILED');
      log.debug('MESSAGE:\n' + e.message + "\nCAUSE:\n" + e.cause + "\nORIGINATOR:\n" + e.originator);
      log.info(e.message);
      log.info(e.cause);

      if(this.sessions.currentSession){
        let curSessionIndex = this.sessions.allSessions.indexOf(this.sessions.currentSession);
        this.sessions.allSessions.splice(curSessionIndex, 1);
      }
      if(this.sessions.allSessions.length > 0)
      {
        this.sessions.currentSession = this.sessions.allSessions[0];
        let sessionIdentifier = this.sessions.currentSession.remote_identity.uri.toString()
        this.storedRemoteStream = this.remoteVideoStreams[sessionIdentifier];
        //@ts-ignore
        this.storedSelfStream = this.sessions.currentSession.connection.getLocalStreams()[0];
        this.resetStreams();
      }
      else{
        
      }
      for(let f of this.sessionFailedCallbackStack){
        f(e);
      }
    }
    this.sessions.currentSession !== null && this.sessions.currentSession.on('failed', callback);
    reduxStore.dispatch(updateCallStatus({name:'callEstablished', value:false}))
    console.log('Active Call: ' + reduxStore.getState().callStatusManager.callStatus.callEstablished);
  }

  // 'confirmed
  sessionConfirmed(){
    let callback = (e : jssip.SessionConfirmedEvent) => {

      console.log('\nCURRENTSESSION -  CONFIRMED: \nMESSAGE:\n' + e.response );//TODO: e.response only defined for outgoing calls...
      log.info('CURRENTSESSION -  CONFIRMED');
      log.debug('MESSAGE:\n' + e.response)
      log.info(e.response);
      for(let f of this.sessionConfirmedCallbackStack){
        f(e);
      }
    }
    this.sessions.currentSession !== null && this.sessions.currentSession.on('confirmed', callback);
  }

  // 'connecting'
  sessionConnecting(){
    let callback = (e : jssip.SessionConnectingEvent) => {
      console.log('\nCURRENTSESSION -  CONNECTING: \nMESSAGE:\n' + e.request );
      log.info('CURRENTSESSION -  CONNECTING');
      log.debug('MESSAGE:\n' + e.request);
      for(let f of this.sessionConnectingCallbackStack){
        f(e);
      }
    }
    this.sessions.currentSession !== null && this.sessions.currentSession.on('connecting', callback);
  }

  // 'peerconnection:createofferfailed'
  peerConnectionCreateOfferFailed(){
    let callback = (e : DOMError) => {
      console.log('\nCURRENTSESSION -  CREATEOFFERFAILED: \nMESSAGE:\n' + e.name );
      log.info('CURRENTSESSION -  CREATEOFFERFAILED');
      log.debug('MESSAGE:\n' + e.name);
      for(let f of this.peerCreateOfferFailCallbackStack){
        f(e);
      }
    }
    this.sessions.currentSession !== null && this.sessions.currentSession.on('peerconnection:createofferfailed',callback);
  }

  // 'peerconnection:createanswerfailed'
  peerConnectionCreateAnswerFailed(){
    let callback = (e : DOMError) => {
      console.log('\nCURRENTSESSION -  CREATEANSWERFAILED: \nMESSAGE:\n' + e.name );
      log.info('CURRENTSESSION -  CREATEANSWERFAILED');
      log.debug('MESSAGE:\n' + e.name);
      for(let f of this.peerCreateAnswerFailCallbackStack){
        f(e);
      }
    }
    this.sessions.currentSession !== null && this.sessions.currentSession.on('peerconnection:createanswerfailed',callback);
  }

  // 'peerconnection:setlocaldescriptionfailed'
  peerConnectionSetLocalDescriptionFailed(){
    let callback = (e : DOMError) => {
      console.log('\nCURRENTSESSION -  SETLOCALDESCRIPTIONFAILED: \nMESSAGE:\n' + e.name );
      log.info('CURRENTSESSION -  SETLOCALDESCRIPTIONFAILED');
      log.debug('MESSAGE:\n' + e.name);
      for(let f of this.peerSetLocalDescFailCallbackStack){
        f(e);
      }
    }
    this.sessions.currentSession !== null && this.sessions.currentSession.on('peerconnection:setlocaldescriptionfailed',callback);
  }

  // 'peerconnection:setremotedescriptionfailed'
  peerConnectionSetRemoteDescriptionFailed(){
    let callback = (e : DOMError) => {
      console.log('\nCURRENTSESSION -  SETREMOTEDESCRIPTIONFAILED: \nMESSAGE:\n' + e.name );
      log.info('CURRENTSESSION -  SETREMOTEDESCRIPTIONFAILED');
      log.debug('MESSAGE:\n' + e.name);
      for(let f of this.peerSetRemoteDesFailCallbackStack){
        f(e);
      }
    }
    this.sessions.currentSession !== null && this.sessions.currentSession.on('peerconnection:setremotedescriptionfailed',callback);
  }

  // 'getusermediafailed'
  getUserMediaFailed(){
    let callback = (e : jssip.SessionUserMediaFailedEvent) => {
      console.log('\nCURRENTSESSION -  GETUSERMEDIAFILED: \nMESSAGE:\n' + e.name );
      log.info('CURRENTSESSION -  GETUSERMEDIAFILED');
      log.debug('MESSAGE:\n' + e.name);
      for(let f of this.getUserMediaFailedCallBackStack){
        f(e);
      }
    }
    this.sessions.currentSession !== null && this.sessions.currentSession.on('getusermediafailed',callback);
  }

   /*****************************
    * UA Callback Registrations *
    *****************************/

   uaOnNewRTCSession() {
     let callback = (e: jssip.UserAgentNewRtcSessionEvent) => {
      console.log("\nUA - NEWRTCSESSION : \nORIGINATOR:\n" + e.originator + "\nSESSION:\n" + e.session + "\nREQUEST:\n" + e.request);
      log.info('UA - NEWRTCSESSION');
      log.debug("ORIGINATOR:\n" + e.originator + "\nSESSION:\n" + e.session + "\nREQUEST:\n" + e.request);
      var getNumber = e.request.getHeader('From').match('sip:(.*)@');
      if(getNumber != null){
        this.phoneNumber = getNumber[1];
      }
      this.sessions.currentSession = e.session;

      this.registerNewSession()

      for(let f of this.uaNewRTCSessionCallbackStack) {
        f(e);
      }
     }
     this.ua.on('newRTCSession', callback);
   }

  uaOnConnected() {
    let callback = (e: jssip.UserAgentConnectedEvent) => {
      console.log(`JSSIP Connected on socket ${e.socket.url}`);
      log.info(`JSSIP Connected on socket ${e.socket.url}`);
      for(let f of this.uaConnectedCallbackStack){
        f(e);
      }
    }
    this.ua.on('connected', callback);

  }

  uaOnSipEvent() {
    let callback = (e: jssip.UserAgentSipEvent) => {
      console.log(`JSSIP SipEvent ${e.event.event}`);
      var formattedResponse = e.request.toString().replace(/\n/, ' ');
      log.info(`${formattedResponse}`);
      for(let f of this.uaSipEventCallbackStack){
        f(e);
      }
      if(e.event.event === 'message-summary' && e.request.method === 'NOTIFY'){
        var getNumber = e.request.getHeader('To').match('sip:(.*)@');
        if(getNumber != null){
          if(getNumber[0].includes(this.jssipconfiguration.uri.toString().split('@')[0]) &&
            this.jssipconfiguration.uri.toString().split(':')[1].split('@')[0] === getNumber[1]){
            //Show info - indicate the UI
            log.info('JSSIP SipEvent Body' + e.request.body);
            var message = e.request.body;
            //@ts-ignore
            const data = message.split('\r\n');
            const messageStatus = data[0].split(':');
            const messageCount = data[1].split(':');
            const uVoicemailStatusObject = {
              name: 'voicemailStatus',
              value:  messageStatus[1]
            }
            const uMessageCountObject = {
              name: 'messageCount',
              value: messageCount[1].split('/')[0]
            }
            reduxStore.dispatch(UpdateUserSetting(uVoicemailStatusObject))
            reduxStore.dispatch(UpdateUserSetting(uMessageCountObject))

            //this.settings.updateSettings('voicemailStatus', messageStatus[1]);
            //this.settings.updateSettings('messageCount', messageCount[1].split('/')[0]);
          }
        }
      }
    }
    this.ua.on('sipEvent', callback);
  }

  uaOnConnecting() {
    // It seems that the redux store can't be accessed from within a jssip function
    const maxLogins = reduxStore.getState().settingsManager.settings.maxLoginAttempts

    let callback = (e: jssip.UserAgentConnectingEvent) => {
      console.log(`JSSIP Connecting on socket ${e.socket.url}\t attempt ${e.attempts}`);
      log.info(`JSSIP Connecting on socket ${e.socket.url}\t attempt ${e.attempts}`);
      //if (e.attempts >= this.settings.loadSetting('maxLoginAttempts')) {
        
        if (e.attempts >= maxLogins) {
        this.uaOnRegistrationTimeout(e)
      }
      for(let f of this.uaConnectingCallbackStack){
        f(e);
      }
    }
    this.ua.on('connecting', callback);
  }

  uaOnRegistrationTimeout(e: jssip.UserAgentConnectingEvent){
    this.ua.stop();
    console.log(`JSSIP Stopping registration request: failure to connect on socket ${e.socket.url}`);
    for(let f of this.uaRegistrationTimeoutCallbackStack){
      f(e);
    }

  }

  uaOnDisconnected() {
    let callback = (e: jssip.UserAgentDisconnectedEvent) => {
      console.log(`JSSIP Disconnected from ${e.socket.url}`);
      for(let f of this.uaDisconnectedCallbackStack){
        f(e);
      }
    }
    this.ua.on('disconnected', callback);
  }

  uaOnRegistered() {
    let callback = (e: jssip.UserAgentRegisteredEvent) => {
      console.log(`JSSIP Registered!\tStatus ${e.response.status_code}\t${e.response.reason_phrase}`);
      log.info(`${e.response.toString().replace(/\n/, ' ')}`);
      log.info(`SIP/2.0 ${e.response.status_code}\t${e.response.reason_phrase}`);
      //SIP/2.0 200 Ok
      for(let f of this.uaRegisteredCallbackStack){
        f(e);
      }
      this.ua.sendSubscribe(this.jssipconfiguration.uri, "1800");
      this.resubscribe();
    }
    this.ua.on('registered', callback);
  }

  uaOnRegistrationFailed() {
    let callback = (e: jssip.UserAgentRegistrationFailedEvent) => {
      console.log(`JSSIP Registration Failed:\tStatus ${e.cause}`);
      log.info(`SIP/2.0 ${e.response.status_code}\t${e.response.reason_phrase}`);
      for(let f of this.uaRegistrationFailedCallbackStack){
        f(e);
      }
    }
    this.ua.on('registrationFailed', callback);
  }

  uaOnUnregistered() {
    let callback = (e: jssip.UserAgentUnregisteredEvent) => {
      console.log(`JSSIP Unregistered \t ${e.response.status_code}\t${e.response.reason_phrase}`);
      log.info(`SIP/2.0 ${e.response.status_code}\t${e.response.reason_phrase}`);
      for(let f of this.uaUngresiteredCallbackStack){
        f(e);
      }
    }
    this.ua.on('unregistered', callback);
  }
}
