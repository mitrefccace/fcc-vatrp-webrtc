import React from 'react';
import './DebugModal.css';
import SettingsService from '../../services/SettingsService';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { connect, ConnectedProps } from 'react-redux';
import { IntUpdateSettingsType } from '../../store/settings/types';

const { dialog } = require('electron').remote;
const log = require('electron-log');

const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};

const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch({type: 'UPDATE_SETTING', payload: name})
});

const connector = connect(mapStateToProps, mapDispatchToProps)


type PropsFromRedux = ConnectedProps<typeof connector>
type DebugModalProps = PropsFromRedux & {
  settingsService : SettingsService
  setLoggingLevel : Function
  setLoggerPath   : Function
  hideDebugModal  : Function
};

type DebugModalState = {
  debugChecked     : boolean;
  logName          : string;
  logNameUpdate    : boolean;
  loggerURL        : string;
  logLevel         : string;
};

class DebugModal extends React.Component<DebugModalProps,DebugModalState>{
  constructor(props : DebugModalProps){
    super(props);
    try{
      this.state = {
        debugChecked        : this.props.settingsService.loadSettingGlobal('debug'),
        logName             : this.props.settingsService.loadSettingGlobal('logName').replace('.log',''),
        loggerURL           : this.props.settingsService.loadSettingGlobal('logPath'),
        logNameUpdate       : false,
        logLevel            : this.props.settingsService.loadSettingGlobal('logLevel'),
      }
    } catch (error) {
      this.state = {
        debugChecked        : this.props.settingsService.loadSettingGlobal('debug'),
        logLevel            : 'debug',
        loggerURL           : "~/Library/Logs/{app name}/{process type}.log",
        logName             : 'logName',
        logNameUpdate       : false,
      }
    }

    this.onClose = this.onClose.bind(this);
    this.checkboxChanged = this.checkboxChanged.bind(this);
    this.logNameChange = this.logNameChange.bind(this);
    this.handleLogFileChange = this.handleLogFileChange.bind(this);
    this.loggingLevelSelected = this.loggingLevelSelected.bind(this);
  }

  onClose(){
    this.props.hideDebugModal();
  }

  checkboxChanged(event : React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    const checked = event.target.checked;
    if(event.target.name === 'debug')
      this.setState({ debugChecked: checked });
    //make call to store it in settingsService
    try{
      this.props.settingsService.updateSettingsGlobal(event.target.name,value);
    } catch(error){
      //TBD Log error
    }
    this.forceUpdate();
  }

  logNameChange(event : React.ChangeEvent<HTMLInputElement>){
    this.setState({logName: event.target.value});
    log.transports.file.fileName = event.target.value + ".log";
    this.props.UpdateUserSetting({name: 'logName', value: event.target.value})
    this.setState({logNameUpdate : true});
  }

  handleLogFileChange(){
    var directoryPath = dialog.showOpenDialogSync({ properties : ['openDirectory']});
    if(directoryPath && directoryPath[0]){
      this.setState({loggerURL : directoryPath[0]});
      this.props.settingsService.updateSettingsGlobal('logPath', directoryPath[0]);
      this.props.setLoggerPath(directoryPath[0].toString());
    }
  }

  loggingLevelSelected(event : React.ChangeEvent<HTMLSelectElement>){
    this.setState({logLevel : event.target.value})
    this.props.settingsService.updateSettingsGlobal("logLevel", event.target.value);
    this.props.setLoggingLevel(event.target.value);
  }

  render(){
    return(
      <Modal show={true}>
        <Modal.Header>
          Debug Settings
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group 
              id="debugCheckbox" 
              controlId="formBasicCheckbox">
              <Form.Check 
                type="checkbox" 
                label="Debug Mode" 
                name="debug"
                checked={this.state.debugChecked}
                onChange={this.checkboxChanged} />
            </Form.Group>
            <Form.Group
              id="LogFileName"
              controlId="formBasicInput">
              <Form.Label>Log File Name</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  defaultValue={this.state.logName === "" ? "renderer.log" : this.state.logName}
                  onBlur={this.logNameChange}>
                </Form.Control>
                <InputGroup.Append>
                  <InputGroup.Text>.log</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>
            <Form.Group>  
            <div className="row justify-content-left mt-3">
              <div className="col-sm-5">
                <Form.Label aria-label="Change Log File Path" tabIndex={4}>
                <div className="modal-body" style={{'wordWrap': 'break-word'}}><p>Current File Location {log.transports.file.file}</p></div>
                  </Form.Label>
                  <Button
                    onClick={this.handleLogFileChange}>Change Log File Location</Button>
              </div>
            </div> 
            </Form.Group>
            <Form.Group
              id="loggingLevel"
              controlId="formBasicInput">
              <Form.Label>Logging Level</Form.Label>
              <Form.Control 
                as="select" 
                onChange={this.loggingLevelSelected} 
                value={this.state.logLevel}>
                <option value="Error">Error</option>
                <option value="Warn">Warn</option>
                <option value="Info">Info</option>
                <option value="Verbose">Verbose</option>
                <option value="Debug">Debug</option>
                <option value="Silly">Silly</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={this.onClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default connector(DebugModal);
