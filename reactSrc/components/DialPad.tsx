import React from 'react';
import './DialPad.scss';
import ActivePanel from '../services/ActivePanelEnum';
import JssipService from '../services/JssipService';
import { Button, InputGroup, FormControl, Form, Row }from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect, ConnectedProps } from 'react-redux';
import { call } from '../store/settings/actions';
import { IntCallType } from '../store/settings/types';
const log = require('electron-log');

const mapStateToProps = (state: any) => {
  return {
    settings: state.settingsManager.settings,
    callStatus: state.callStatusManager.callStatus,
    janusState : state.settingsManager.janusState
  };
};

const mapDispatchToProps = (dispatch: (arg0: IntCallType) => any) => ({
  call: (config: object) => dispatch(call(config))
}); 

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>

type DialPadProps = PropsFromRedux & {
  jssipService  : JssipService,
  setActivePanel: Function,
  displayUserMessage: Function,
  sipHandle: any,
  setJanusCall: Function
};

type DialPadState = {
  phoneNumber : string
  anonymous   : boolean
  dtmfDuration: string
  toggleDialaround : boolean
  dialaroundList : string[]
  selectDialAround : string
};

class DialPad extends React.Component<DialPadProps, DialPadState> {
  constructor(props: DialPadProps) {
    super(props);

    this.state = {
      phoneNumber: "",
      anonymous  : this.props.settings.anonymous,
      dtmfDuration: "100",
      toggleDialaround : false,
      dialaroundList : this.props.settings.DialAroundList ? this.props.settings.DialAroundList : ["N/A"],
      selectDialAround : ""
    };
    if (this.props.callStatus.callEstablished){
      this.props.displayUserMessage("Info", "DTMF", "DTMF Active");
    }

    this.backspace         = this.backspace.bind(this);
    this.numberButtonPress = this.numberButtonPress.bind(this);
    this.handleChange      = this.handleChange.bind(this);
    this.callButtonClicked = this.callButtonClicked.bind(this);
    this.keyPressed        = this.keyPressed.bind(this);
    this.sendDTMF          = this.sendDTMF.bind(this);
    this.checkHandleChange = this.checkHandleChange.bind(this);
  }

  numberButtonPress(buttonValue : string) {
    let newPhoneNumber = String(this.state.phoneNumber).concat(buttonValue);
    this.setState({phoneNumber : newPhoneNumber})
    log.info("Number key pressed: " + buttonValue);
    this.sendDTMF(buttonValue);
  }

  backspace(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
    if(this.state.phoneNumber){
      const subString = this.state.phoneNumber.toString();
      const newString = subString.toString().substring(0, subString.length -1);
      this.setState({phoneNumber: newString})
    }
  }

  callButtonClicked(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
    event.preventDefault();
    if(this.state.phoneNumber){
      log.info("Call placed");
      if(this.props.settings.VATRPmode === "StandardSIPCalling"){
        this.props.jssipService.registerSessionConnectingCallback(() => {this.props.setActivePanel(ActivePanel.callPage);})
        //Check for anonymous call
        let phoneNumber = this.state.phoneNumber
        if(this.state.toggleDialaround && this.state.selectDialAround !== "N/A")
        {
          phoneNumber += "@" + this.state.selectDialAround
        }
        this.props.jssipService.startCall(phoneNumber, this.state.anonymous);
      }else if(this.props.settings.VATRPmode === 'FullJanusCommunication'){
        console.log("Janus calling sip:" + this.state.phoneNumber + "@" + this.props.janusState.server);
        this.props.call({number : "sip:" + this.state.phoneNumber + "@" + this.props.janusState.server, handle : this.props.sipHandle});
        this.props.setActivePanel(ActivePanel.callPage);
        this.props.setJanusCall(true);
      }
    }
    else{
      console.log('Missing phone number: call not started')
    }
  }

  keyPressed(event: React.KeyboardEvent<HTMLInputElement>){
    event.preventDefault();
    if(event.key === 'Enter' || event.key === 'Returned'){
      if(this.props.settings.VATRPmode === "StandardSIPCalling"){
        if(this.state.phoneNumber){
          this.props.jssipService.registerSessionConnectingCallback(() => {this.props.setActivePanel(ActivePanel.callPage);})
          //Check for anonymous call
          this.props.jssipService.startCall(this.state.phoneNumber.toString(), this.state.anonymous);
        }
      }else if(this.props.settings.VATRPmode === 'FullJanusCommunication'){
        console.log("Janus calling sip:" + this.state.phoneNumber + "@" + this.props.janusState.server);
        this.props.call({number : "sip:" + this.state.phoneNumber + "@" + this.props.janusState.server, handle : this.props.sipHandle});
        this.props.setActivePanel(ActivePanel.callPage);
        this.props.setJanusCall(true);
      }
    }
    else{
      this.setState({phoneNumber : this.state.phoneNumber + event.key})
      this.sendDTMF(event.key)
    }
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>){
    const target = event.target;
    const value  = target.value;
    this.setState({phoneNumber: value});
  }

  checkHandleChange(event : React.ChangeEvent<HTMLInputElement>) {
    this.setState({ toggleDialaround : event.target.checked});
  }

  sendDTMF(tone: string){
    let duration = Number.parseInt(this.state.dtmfDuration);
    let isInCall = this.props.callStatus.callEstablished
    if (isInCall) this.props.jssipService.sendDTMF(tone, duration);
  }
//<select value={this.state.selectDialAround} onChange={(e) => this.setState({selectDialAround : e.target.value})}>
  render() {
    return(
      <div>
      <div className="home-page row justify-content-center">
        <form>
        <div className="row justify-content-center pt-3">
          <div className="col-12 align-self-center">
            <Form.Label>
              Use the keypad to type a phone number
            </Form.Label>
            <InputGroup className="mb-3">
              
              <FormControl
                type="tel"
                data-inputmask="'mask':'(999) 999-9999'"
                aria-label="Phone number input"
                aria-required="true"
                aria-live="polite"
                id="NumberInputBox"
                style={{ width: "160px"}}
                value={this.state.phoneNumber}
                onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}
                onKeyPress={(e : React.KeyboardEvent<HTMLInputElement>) => this.keyPressed(e)}
                name="phoneNumber"
              >
              </FormControl>
              <InputGroup.Append>
                <Button bsPrefix="dialpad-danger" className="btn btn-danger"
                onClick={this.backspace} 
                id="BackspaceButton"
                aria-label="Backspace"
                aria-controls="NumberInputBox">
                  <FontAwesomeIcon icon="caret-left" />
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </div>
        </div>

        </form>
      </div>
      <div className="row justify-content-center">
        <form>

          <div className="col-lg-12 mb-2">
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 1"
                id="dialpad1"
                onClick={() => {this.numberButtonPress("1")}}>1
              </Button>
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 2"
                id="dialpad2"
                onClick={() => {this.numberButtonPress("2")}}>2
              </Button>
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 3"
                id="dialpad3"
                onClick={() => {this.numberButtonPress("3")}}>3
              </Button>
          </div>
          <div className="col-lg-12 mb-2">
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 4"
                id="dialpad4"
                onClick={() => {this.numberButtonPress("4")}}>4
              </Button>
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 5"
                id="dialpad5"
                onClick={() => {this.numberButtonPress("5")}}>5
              </Button>
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 6"
                id="dialpad6"
                onClick={() => {this.numberButtonPress("6")}}>6
              </Button>
          </div>
          <div className="col-lg-12 mb-2">
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 7"
                id="dialpad7"
                onClick={() => {this.numberButtonPress("7")}}>7
              </Button>
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 8"
                id="dialpad8"
                onClick={() => {this.numberButtonPress("8")}}>8
              </Button>
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 9"
                id="dialpad9"
                onClick={() => {this.numberButtonPress("9")}}>9
              </Button>
          </div>
          <div className="col-lg-12 mb-2">
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad *"
                id="dialpad*"
                onClick={() => {this.numberButtonPress("*")}}>*
              </Button>
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad 0"
                id="dialpad0"
                onClick={() => {this.numberButtonPress("0")}}>0
              </Button>
              <Button bsPrefix="dialpad-button"
                className="m-1"
                aria-label="Dialpad # symbol"
                id="dialpad#"
                onClick={() => {this.numberButtonPress("#")}}>#
              </Button>
          </div>
          <div className="row justify-content-center mb-2">
            <div className={this.state.toggleDialaround ? "col-4 align-self-center" : "col-4 align-self-center"}>
              <Button bsPrefix="dialpad-button call-button"
                className="btn btn-success" 
                aria-label="place a call" 
                aria-pressed="false"
                id="callButton"
                onClick={this.callButtonClicked}>
                  <FontAwesomeIcon icon="phone" />
              </Button>
            </div>
          </div>


          { this.props.callStatus.callEstablished && 
          <div className="row justify-content">
            <Form.Group as={Row}>
              <Form.Label column sm={3} className="small">DTMF Duration (ms)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                aria-label="Specify DTMF duration milliseconds."
                area-required="true"
                id="dtmfDurationInput"
                //@ts-ignore
                onChange={(e: React.FormEvent<HTMLInputElement>) => {this.setState({dtmfDuration: e.target.value})}}
                value={this.state.dtmfDuration} 
              />
            </Form.Group>
          </div>
          }
        </form>
      </div>
      <div id="dialaroundSwitch" className="row justify-content-center">
        <Form.Check
          type="switch"
          id="dialaround-switch"
          label="Dialaround"
          onChange={this.checkHandleChange}>
        </Form.Check>
      </div>
      <div id="dialaround" className="row justify-content-center">
        { this.state.toggleDialaround ? 
        <div className="row justify-content">
          <Form.Group as={Row}>
            <Form.Label sm={4}>Select a Dialaround</Form.Label>
            <Form.Control 
              as="select" 
              value={this.state.selectDialAround} 
              onChange={(e) => this.setState({selectDialAround : e.currentTarget.value})} 
              custom="true">
            {this.state.dialaroundList.map((dialaround) => <option key={dialaround} value={dialaround}>{dialaround}</option>)}
            </Form.Control>
          </Form.Group>
        </div>
        : ""}
      </div>
    </div>
    );
  }
}
export default connector(DialPad)