import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import JssipService from '../../services/JssipService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
const log = require('electron-log');

export default function CallButtons(props: {jssipService: JssipService, toggleChatVisible: Function, endCall : Function}) {
  
  const [isAudioMuted, setAudioMute]    = useState(false);
  const [isVideoMuted, setVideoMute]    = useState(false);
  const [isCallPaused, setCallPaused]   = useState(false);

  return (
    <div className="row justify-content-center">
      <Button 
        id="audio-mute-button"
        className="btn btn-primary m-1" 
        onClick={() => {
          /**************
           * Mute Audio *
           **************/
          log.info("Audio mute button pressed");
          if(isAudioMuted)props.jssipService.unmuteCall();
            else props.jssipService.muteCall();
          setAudioMute(!isAudioMuted);
        }} 
        aria-label="Mute Microphone" 
        aria-pressed={isAudioMuted}>
        <FontAwesomeIcon icon={isAudioMuted ? "microphone-slash" : "microphone"} size="2x"/>
        <br/> 
        <b>Self Mute</b>
      </Button>

      <Button 
        id="video-privacy-button"
        className="btn btn-primary m-1" 
        onClick={() => {
          /***********************
           * Video Privacy Function *
           ***********************/
          log.info("Video Privacy clicked");
          if(isVideoMuted) props.jssipService.disableVideoPrivacy();
            else props.jssipService.enableVideoPrivacy();
          setVideoMute(!isVideoMuted);
        }} 
        aria-label="Hide My Video" 
        aria-pressed={isVideoMuted}>
        <FontAwesomeIcon icon={isVideoMuted? "video-slash" : "video"} size="2x"/>
        <br/>
        <b>Video Privacy</b>
      </Button>

      <Button 
        id="call-pause-button"
        className="btn btn-primary m-1" 
        onClick={() => {
          /***********************
           * Pause Call Function *
           ***********************/
          log.info("Call pause button pressed");
          if(isCallPaused) props.jssipService.unpauseCall();
            else props.jssipService.pauseCall();
          setCallPaused(!isCallPaused);
        }} 
        aria-label="Pause Call" 
        aria-pressed={isCallPaused}>
      <FontAwesomeIcon icon={isCallPaused ? "play" : "pause"} size="2x"/>
        <br/>
        <b>Pause Call</b>
      </Button>
      
      <Button 
        id="show-chat-button"
        className="btn btn-primary m-1" 
        onClick={() => props.toggleChatVisible()} 
        aria-label="Show Chat" >
        <FontAwesomeIcon icon="keyboard" size="2x"/>
        <br/>
        <b>Text Chat</b>
      </Button>

      <Button 
        id="terminate-call-button"
        type="button" 
        className="btn btn-primary m-1" 
        onClick={() => {
          /***********************
           * Pause Call Function *
           ***********************/
          log.info("Terminate Call button clicked");
          props.endCall();
        }} 
        aria-label="Hang Up">
        <FontAwesomeIcon icon="phone-slash" size="2x"/>
        <br/>
        <b>Hangup</b>
      </Button>
    </div>
    );
  }