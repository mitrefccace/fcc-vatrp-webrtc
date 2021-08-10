import React from 'react';
import DialPad from './DialPad';
import CallPage from './CallPage';
import CallHistory from './CallHistory';
import SideBar from './SideBar';
import Contacts from './Contacts';
import Videomail from './Videomail';
import ActivePanel from '../services/ActivePanelEnum';
import settings from '../services/SettingsOptions';
import JssipService from '../services/JssipService';
import IncomingCallModal from './IncomingCallModal';
import SettingsService from '../services/SettingsService';
import Settings from './Settings';
import AudioService from '../services/AudioService';
import { Alert } from 'react-bootstrap';
import CallOverlay from './callOverlay';
import { connect, ConnectedProps } from 'react-redux';
import { IntUpdateSettingsType } from '../store/settings/types';
import { RefObject } from 'react';

const mapStateToProps = (state: any) => {
  return {
    settings: state.settingsManager.settings,
    callStatus: state.callStatusManager.callStatus
  };
};

const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch({type: 'UPDATE_SETTING', payload: name})
});

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type homePageProps = PropsFromRedux & {
  jssipService      : JssipService
  audioService      : AudioService
  setNotRegistered  : Function
  displayUserMessage: Function
  settingsService   : SettingsService
  setLoggingLevel   : Function
  setLoggerPath     : Function
  setLogName        : Function
  janusRemoteRef    : RefObject<HTMLVideoElement>
  janusSelfRef      : RefObject<HTMLVideoElement>
  sipHandle         : any
  janusCall         : boolean
  janusIncoming     : boolean
  setIncomingCall   : Function
  setJanusCall      : Function
  janusRemoteNumber : String
};
type homePageState = { 
  activePanel    : ActivePanel
  isIncomingCall : boolean
  isExpandedCall : boolean
};

class HomePage extends React.Component <homePageProps, homePageState> {
  constructor(props: homePageProps) {
    super(props);
    this.state = {
      activePanel : ActivePanel.dialPad,
      isIncomingCall : false,
      isExpandedCall: false,
    };

    //bindings
    //this.setActivePanel = this.setActivePanel.bind(this);
    //this.showModal      = this.showModal.bind(this);
    //this.hideModal      = this.hideModal.bind(this);
    //this.setExpandedCall = this.setExpandedCall.bind(this);

    try {
      this.props.jssipService.registerRTCcallback(this.showModal);
    } catch (error) {
      //log error TBD 
    }

    this.props.jssipService.registerSessionEndedCallback(() => {
      if (this.props.jssipService.sessions.allSessions.length === 0){
        this.setActivePanel(ActivePanel.dialPad);
      }
      this.setState({isExpandedCall : false})
    });
    
    this.props.jssipService.registerSessionFailedCallback(() => {
      if(!this.props.callStatus.callEstablished){
        this.props.displayUserMessage("Error", "Call Error", "Call Failed");
      }

      if (this.props.jssipService.sessions.allSessions.length === 0){
        this.setActivePanel(ActivePanel.dialPad);
      }
      this.setState({isExpandedCall : false})
    });

  }

  setActivePanel=( panelValue : ActivePanel)=>{
    this.setState({activePanel: panelValue});
  }

  showModal=(event : JsSIP.UserAgentNewRtcSessionEvent)=>{
    if(event.originator === 'remote'){
      this.setState({isIncomingCall: true})
      this.props.audioService.play('ringing');
    }
  }

  hideModal=()=>{
    this.setState({isIncomingCall : false})
    this.props.audioService.stop();
    this.props.setIncomingCall(false);
  }

  setExpandedCall=(fullscreen : boolean)=>{
    this.setState({isExpandedCall : fullscreen})
  }

  render() {
    // The active panel of the main page might be populated with a number of 
    // different components. This is the logic which switches the contents

    let panel;
    if (Object.values(settings).includes(this.state.activePanel)) {
        panel = <Settings displayUserMessage={this.props.displayUserMessage} jssipService={this.props.jssipService} 
        activePanel={this.state.activePanel} setLogName={this.props.setLogName}
        setLoggerPath={this.props.setLoggerPath} setLoggingLevel={this.props.setLoggingLevel}/>   
    } else {
    switch (this.state.activePanel) {
      case ActivePanel.callPage:
        let callPageProps = {
          jssipService       : this.props.jssipService,
          displayUserMessage : this.props.displayUserMessage,
          setActivePanel     : this.setActivePanel,
          setExpandedCall    : this.setExpandedCall,
          janusRemoteRef     : this.props.janusRemoteRef,
          janusSelfRef       : this.props.janusSelfRef,
          janusCall          : this.props.janusCall,
          setJanusCall       : this.props.setJanusCall
        }
      panel = <CallPage {...callPageProps} />;
        break;
      case ActivePanel.dialPad:
        panel = <DialPad jssipService={this.props.jssipService} setActivePanel={this.setActivePanel} 
        displayUserMessage={this.props.displayUserMessage} sipHandle={this.props.sipHandle} setJanusCall={this.props.setJanusCall}/>
        break;
      case ActivePanel.callHistory:
        panel = <CallHistory jssipService={this.props.jssipService} 
        setActivePanel={this.setActivePanel}/>
        break;
      case ActivePanel.contacts:
        panel = <Contacts jssipService={this.props.jssipService}
        setActivePanel={this.setActivePanel} displayUserMessage={this.props.displayUserMessage}/>
        break;
      case ActivePanel.videoMail:
        panel = <Videomail jssipService={this.props.jssipService}
        displayUserMessage={this.props.displayUserMessage}/>
        break; 
      default:
        panel = <DialPad jssipService={this.props.jssipService} setActivePanel={this.setActivePanel} 
         displayUserMessage={this.props.displayUserMessage} sipHandle={this.props.sipHandle} setJanusCall={this.props.setJanusCall}/>
        break;
    }
  }

    return(
      <div>
        <audio id="audioPlayer" ref={this.props.audioService.audioRef}></audio>
        {((this.state.isIncomingCall && !this.props.callStatus.callEstablished) || (this.props.janusIncoming)) && 
            <IncomingCallModal 
                jssipService={this.props.jssipService} 
                hideModal={this.hideModal} 
                setActivePanel={this.setActivePanel}
                setIncomingCall={this.props.setIncomingCall}
                setJanusCall={this.props.setJanusCall}
                janusRemoteNumber={this.props.janusRemoteNumber}/>}
        <div className="row">
        {!this.state.isExpandedCall && 
          <SideBar setActivePanel={this.setActivePanel} setNotRegistered={this.props.setNotRegistered} jssipService={this.props.jssipService} activePanel={this.state.activePanel}></SideBar>}
          <div className="col">
          { this.props.settings.anonymous && this.state.activePanel !== ActivePanel.callPage ? 
          <div className="row justify-content-center">
            <div className="align-self-center">
              <Alert variant="warning"><p>Currently you have anonymous calls settings enabled. 
                Any call you make will be anonymous. If this is not intended you may disable this in the settings tab.</p></Alert> 
            </div>
          </div> : ""}
          <div id="content">{ panel }</div>

          {this.props.callStatus.callEstablished && !(this.state.activePanel === ActivePanel.callPage) &&
            <CallOverlay jssipService={this.props.jssipService} setActivePanel={this.setActivePanel}></CallOverlay>}
          </div>
        </div>
      </div>
   
    );
  }
}

export default connector(HomePage);