import React, {useState, RefObject} from 'react';
import logo from '../../assets/vatrp-trim.png';
import JssipService from '../../services/JssipService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import reduxStore from '../../store';

export default function CallVideo(props: {jssipService: JssipService, toggleExpanded: Function, janusRemoteRef: RefObject<HTMLVideoElement>, janusSelfRef: RefObject<HTMLVideoElement>}) {

  const [isExpanded, setIsExpanded] = useState(false);
  var selfVideoRef;
  var remoteVideoRef;

  if(reduxStore.getState().settingsManager.settings.VATRPmode === "FullJanusCommunication"){
    selfVideoRef = props.janusSelfRef;
  }else{
    selfVideoRef   = props.jssipService.selfVideoRef;
  }
  if(reduxStore.getState().settingsManager.settings.VATRPmode === "FullJanusCommunication"){
    remoteVideoRef = props.janusRemoteRef
  }else{
    remoteVideoRef = props.jssipService.remoteVideoRef;
  }
  
  return (
    <div style={{height: "100", position: "relative"}} id="callVideoHolder">
      <video 
        style={{
          maxWidth: "100%",
          height: "100%",
          objectFit: "contain",
          backgroundColor: "#fff"
        }}
        ref={remoteVideoRef}
        id="remoteView" 
        autoPlay 
        poster={logo} 
        aria-label="Remote Video" />

      <video 
        style={{
          width: "25%",
          border: "2px solid #ccc",
          top: 0,
          right: 0,
          position: "absolute",
          zIndex: 9
        }}
        ref={selfVideoRef}
        id="selfView" 
        autoPlay 
        muted 
        aria-label="Self-view Video" />

        <div 
          className="bottom-right" 
          id="expandVideo" 
          onClick={() => {
            props.toggleExpanded(!isExpanded);
            setIsExpanded(!isExpanded);
          }}
          aria-label="Expand Video" >
          <FontAwesomeIcon icon={isExpanded ? "compress" : "expand"} size="2x"/>
        </div>
    </div>
  );

}