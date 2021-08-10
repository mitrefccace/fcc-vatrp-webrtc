import React from 'react';
import JssipService from '../services/JssipService';
import ActivePanel from '../services/ActivePanelEnum';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect, ConnectedProps } from 'react-redux';
import { janusAccept, janusDecline } from '../store/settings/actions';
import { JanusAcceptType, JanusDeclineType } from '../store/settings/types';

const log = require('electron-log');

const mapStateToProps = (state: any) => {
  return {
    settings: state.settingsManager.settings,
    callStatus: state.callStatusManager.callStatus,
    janusState : state.settingsManager.janusState
  };
};

const mapDispatchToProps = (dispatch: (arg0: JanusAcceptType | JanusDeclineType) => any) => ({
  janusAccept: (config: object) => dispatch(janusAccept(config)),
  janusDecline: (config: object) => dispatch(janusDecline(config))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>

type incomingCallProps = PropsFromRedux & {
  jssipService : JssipService
  hideModal : Function
  setActivePanel : Function
  setIncomingCall : Function
  setJanusCall : Function
  janusRemoteNumber : String
};
type incomingCallState = {
  currentUser : string
};

class IncomingCallModal extends React.Component<incomingCallProps, incomingCallState> {
  constructor(props: incomingCallProps) {
    super(props);

    this.state = {
       currentUser: props.settings.currentUser ? props.settings.currentUser : ''
    };
    this.answerCall = this.answerCall.bind(this);
    this.rejectCall = this.rejectCall.bind(this);
    this.populateCallerIDNumber = this.populateCallerIDNumber.bind(this);
  }

answerCall(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
  log.info("Call has been accepted");
  this.props.hideModal();
  this.props.setActivePanel(ActivePanel.callPage);
  if(this.props.settings.VATRPmode === 'FullJanusCommunication'){
    this.props.setJanusCall(true);
    this.props.janusAccept({});
  }else{
    this.props.jssipService.acceptCall();
  }
}

rejectCall(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
  this.props.hideModal();
  log.info("Call has been rejected");
  if(this.props.settings.VATRPmode === 'FullJanusCommunication'){
    this.props.janusDecline({});
    this.props.setIncomingCall(false);
  }else{
    this.props.jssipService.terminateCall();
  }
}

populateCallerIDNumber(){
  let CallerIDNumberText = '';
  let CallerIDName = this.getCallerIDName();
  if (this.props.settings.VATRPmode === 'FullJanusCommunication'){
    var tempNumber = this.props.janusRemoteNumber.toString();
    //@ts-ignore
    console.log("Caller :" + tempNumber.match(/(?<=sip:)(.*?)(?=@)/));
    CallerIDNumberText = tempNumber;
  } else if (CallerIDName === ''){
    CallerIDNumberText = this.props.jssipService.phoneNumber.toString();
  }
  else {
    CallerIDNumberText = CallerIDName + ': ' + this.props.jssipService.phoneNumber;
  }
  return CallerIDNumberText
}

getCallerIDName(){
  let CallerIDName = ''
    let contacts=this.props.settings.contacts.contactsList
    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i].number === this.props.jssipService.phoneNumber) {
        CallerIDName = contacts[i].name;
        break;
      }
    }
  return CallerIDName
}

  render(){
    return (
        <Modal show={true} size="sm" centered>
          <Modal.Header>
          <Modal.Title aria-label="Incoming Call Popup"><FontAwesomeIcon icon="phone-volume" /> Incoming Call</Modal.Title>
          </Modal.Header>

          <Modal.Body>
          <Modal.Body>Call from <span id="CallerIDNumber">{
              //@ts-ignore
              this.populateCallerIDNumber()
          }</span></Modal.Body>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="success" onClick={this.answerCall} id="acceptCall" aria-label="Accept Incoming Call">Accept</Button>
            <Button variant="danger" onClick={this.rejectCall} id="rejectCall" aria-label="Reject Incoming Call">Reject</Button>
          </Modal.Footer>
        </Modal>
    );
  }
}
export default connector(IncomingCallModal)