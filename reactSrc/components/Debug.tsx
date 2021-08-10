import React from 'react';
import './Debug.css';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { connect, ConnectedProps } from 'react-redux';
import { IntUpdateSettingsType } from '../store/settings/types';
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

type DebugProps = PropsFromRedux & {
  setLoggingLevel : Function
  setLoggerPath   : Function
  setLogName      : Function
};

type DebugState = {
  debugChecked     : boolean;
  maxLoginAttempts : number;
  logName          : string;
  logNameUpdate    : boolean;
  loggerURL        : string;
  logLevel         : string;
};

class Debug extends React.Component<DebugProps, DebugState>{
  constructor(props : DebugProps){
    super(props);
    try{
      this.state = {
        logNameUpdate       : false,
        debugChecked        : this.props.settings.debug,
        maxLoginAttempts    : this.props.settings.maxLoginAttempts,
        logName             : log.transports.file.fileName.replace('.log',''),
        loggerURL           : this.props.settings.logPath,
        logLevel            : this.props.settings.logLevel,
      }

    } catch (error) {
      this.state = {
        debugChecked        : true,
        maxLoginAttempts    : 10,
        logLevel            : 'debug',
        loggerURL           : "~/Library/Logs/{app name}/{process type}.log",
        logName             : 'logName',
        logNameUpdate       : false,
      }
    }

    this.logNameChange        = this.logNameChange.bind(this);
    this.numberChanged        = this.numberChanged.bind(this);
    this.checkboxChanged      = this.checkboxChanged.bind(this);
    this.handleLogFileChange  = this.handleLogFileChange.bind(this);
    this.loggingLevelSelected = this.loggingLevelSelected.bind(this);
  }

  numberChanged(event : React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const value = target.value;

    if (target.name === 'maxLoginAttempts'){
      if (isNaN(Number(value))===false) {
        this.setState({ maxLoginAttempts: Number(value) })
      }
      this.props.UpdateUserSetting({name: 'maxLoginAttempts', value: target.value})
    }
  }

  checkboxChanged(event : React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const value  = target.checked;
    // const name   = target.name;

    if(target.name === 'debug')
    this.setState({ debugChecked: value });
    //make call to store it in settingsService
    try{
      const newSetting = {
        name: 'debugChecked',
        value: target.checked
      }
      this.props.UpdateUserSetting(newSetting)
    } catch(error){
      //TBD Log error
    }
    this.forceUpdate();
  }

  logNameChange(event : React.ChangeEvent<HTMLInputElement>){
    this.setState({logName: event.target.value});
    const newSetting = {
      name: 'logName',
      value: event.target.value
    }
    this.props.setLogName(this.props.settings.currentUser + "_" + Date.now().toString() + "_" + event.target.value);
    this.props.UpdateUserSetting(newSetting)
    this.setState({logNameUpdate : true});
  }

  handleLogFileChange(){
    var directoryPath = dialog.showOpenDialogSync({ properties : ['openDirectory']});
    if(directoryPath && directoryPath[0]){
      this.setState({loggerURL : directoryPath[0]});
      const newSetting = {
        name: 'logPath',
        value: directoryPath[0]
      }
      this.props.UpdateUserSetting(newSetting)
      this.props.setLoggerPath(directoryPath[0].toString());
    }
  }

  loggingLevelSelected(event : React.ChangeEvent<HTMLSelectElement>){
    this.setState({logLevel : event.target.value})
    const newSetting = {
      name: 'logLevel',
      value: event.target.value
    }
    this.props.UpdateUserSetting(newSetting)
    this.props.setLoggingLevel(event.target.value);
  }

  render(){
    return(
      <Form>
        <div className="form-group row justify-content-center">
          <label className="col-sm-4 col-form-label col-form-label-lg">Debug Settings</label>
        </div>
        <div className="form-group form-check">
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
              id="loginAttemptsInput"
              controlId="formBasicInput">
              <Form.Label>Max login attempts</Form.Label>
              <Form.Control
                style={{width : "70px"}}
                type="number"
                step="1"
                name="maxLoginAttempts"
                defaultValue={String(this.state.maxLoginAttempts)}
                onBlur={this.numberChanged} />
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
                <div id="logName">Current File Location {log.transports.file.file}</div>
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
          </div>
      </Form>
    );
  }
}

export default connector(Debug);