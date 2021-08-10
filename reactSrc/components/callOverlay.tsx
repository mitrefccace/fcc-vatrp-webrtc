import React from 'react';
import JssipService from '../services/JssipService';
import Draggable from 'react-draggable';
import './callOverlay.css'

type callOverlayProps = {
  jssipService      : JssipService,
  setActivePanel    : Function
};

type callOverlayState = {
};

class callOverlay extends React.Component <callOverlayProps, callOverlayState> {
  componentDidMount(){
    if(this.props.jssipService.storedSelfStream){
      this.props.jssipService.resetRemoteVideoStream();
    }
  }

  render() {
    return(
      <Draggable>
        <div id="videoModal">
          <video id="remoteView" autoPlay ref={this.props.jssipService.remoteVideoRef} aria-label="Remote Video">Remote View video</video>
        </div>
      </Draggable>
    )
  }
}



export default callOverlay;