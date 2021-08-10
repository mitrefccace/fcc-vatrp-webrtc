import React, { RefObject } from 'react';
import './CallPage.css';
import ActivePanel from '../services/ActivePanelEnum';
import JssipService from '../services/JssipService';
import CallVideos from './CallPageComponents/CallVideos';
import CallButtons from './CallPageComponents/CallButtons';
import CallChat from './CallPageComponents/CallChat';
import { connect, ConnectedProps } from 'react-redux';
import { IntUpdateSettingsType } from '../store/settings/types';
import { Button, Jumbotron } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const log = require('electron-log');
const mapStateToProps = (state: any) => {
  return {
    settings: state.settingsManager.settings,
    callStatus: state.callStatusManager.callStatus,
    janusState : state.settingsManager.janusState
  };
};
const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch({type: 'UPDATE_SETTING', payload: name})
}); 

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type callPageProps = PropsFromRedux & {
  jssipService       : JssipService,
  setActivePanel     : Function,
  displayUserMessage : Function,
  setExpandedCall    : Function,
  janusRemoteRef     : RefObject<HTMLVideoElement>,
  janusSelfRef       : RefObject<HTMLVideoElement>,
  janusCall          : boolean
  setJanusCall    : Function
};

type callPageState = {
  phoneNumber: string,
  server     : string,
  password   : string,
  expanded   : boolean,
  chatVisible: boolean,
  chatBox    : string,
  fullChat   : string[]
};

class CallPage extends React.Component <callPageProps, callPageState> {
  constructor(props: callPageProps) {
    super(props);
    
    this.state = {
      phoneNumber: "",
      server     : "",
      password   : "",
      expanded   : false,
      chatVisible: false,
      chatBox    : '',
      fullChat   : []
    };

    this.toggleExpandedScreen = this.toggleExpandedScreen.bind(this);
    this.endCall = this.endCall.bind(this);

  }

  componentDidMount(){
    if ((this.props.jssipService.sessions.currentSession && this.props.jssipService.sessions.currentSession.isEstablished())
      || (this.props.jssipService.sessions.currentSession && this.props.jssipService.sessions.currentSession.isInProgress())) {

      if (this.props.jssipService.storedSelfStream) {
        this.props.jssipService.resetStreams();
      }
    }
  }

  toggleExpandedScreen(event: React.MouseEvent<HTMLDivElement, MouseEvent>){
    event.preventDefault();
    if(this.state.expanded === false){
      this.setState({expanded: true});
      log.info("expand video on");
      this.props.setExpandedCall(true);
    }
    else{
      this.setState({expanded: false});
      log.info("expand video off");
      this.props.setExpandedCall(false);
    }
  }

  endCall(){
    this.props.setExpandedCall(false);
    if(this.props.settings.VATRPmode === 'FullJanusCommunication'){
      this.props.setJanusCall(false);
      this.props.janusState.sipHandler.hangup();
    }else{
      this.props.jssipService.terminateCall();
    }
  }

  render() {
    return(
      (this.props.jssipService.sessions.currentSession && this.props.jssipService.sessions.currentSession.isEstablished())
      || (this.props.jssipService.sessions.currentSession && this.props.jssipService.sessions.currentSession.isInProgress()) 
        || (this.props.janusCall) ?

      <div className="call-page">
        <CallVideos jssipService={this.props.jssipService} toggleExpanded={this.props.setExpandedCall}
          janusRemoteRef={this.props.janusRemoteRef} janusSelfRef={this.props.janusSelfRef} />
        <CallButtons 
           jssipService={this.props.jssipService} 
           endCall={this.endCall}
           toggleChatVisible={()=>{this.setState({chatVisible:!this.state.chatVisible})}} 

        />
        { this.state.chatVisible ? <CallChat/> : null } 
      </div> : 
      <Jumbotron style={{ backgroundColor: "#EEEFF4"}}>
      <p>
        To make a call, use the dialpad, your contacts, or history
      </p>
      <p>
      <Button className= "btn-primary"
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.props.setActivePanel(ActivePanel.dialPad)} 
                  name="dialpad"
                  id="DialpadTab"
                  aria-label="Dialpad Page"
                  block>
                  <FontAwesomeIcon icon="phone-square" /> Dialpad
                </Button>

      </p>
      <p>
      <Button className= "btn-primary"
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.props.setActivePanel(ActivePanel.contacts)} 
                  name="Contacts"
                  id="ContactsTab"
                  aria-label="Contacts Page"
                  block>
                    <FontAwesomeIcon icon="address-book" /> Contacts
                  </Button>
      </p>
      <p>
      <Button className= "btn-primary"
                  onClick={(e : React.MouseEvent<HTMLButtonElement, MouseEvent>) => this.props.setActivePanel(ActivePanel.callHistory)} 
                  name="CallHistory"
                  id="CallHistoryTab"
                  aria-label="Call History Page"
                  block>
                    <FontAwesomeIcon icon="list-alt" /> History
                    </Button>
      </p>

    </Jumbotron>
    );
  }
}

export default connector(CallPage)