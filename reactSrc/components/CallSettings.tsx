import React from 'react';
import JssipService from '../services/JssipService';
import { connect, ConnectedProps } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { UpdateUserSetting } from '../store/settings/actions';
import { IntUpdateSettingsType } from '../store/settings/types';
const log = require('electron-log');

const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};

const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch(UpdateUserSetting(name))
});  

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type configType = {
  "providers" : Array<JSON>
}

type CallSettingProps = PropsFromRedux & {
  jssipService    : JssipService
  displayUserMessage: Function
}

type CallSettingState = {
  anonymousChecked    : boolean;
  dialAroundURI    : string;
}

class CallSettings extends React.Component<CallSettingProps, CallSettingState>{
  constructor(props : CallSettingProps){
    super(props);
    console.dir(props)
    this.state = {
      anonymousChecked    : this.props.settings.anonymous,
      dialAroundURI    : this.props.settings.DialAroundURI ? this.props.settings.DialAroundURI : "", 
    }

    this.checkboxChanged = this.checkboxChanged.bind(this);
    this.inputDialaroundURI = this.inputDialaroundURI.bind(this);
    this.loadDialaroundURL = this.loadDialaroundURL.bind(this);
  }

  checkboxChanged(event : React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const value  = target.checked;
    const name   = target.name;

    if(target.name === 'anonymous')
      this.setState({ anonymousChecked: value });
    //make call to store it in settingsService
    try{
      const newSetting = {
        name: name,
        value: value
      }
      this.props.UpdateUserSetting(newSetting);
    } catch(error){
      //TBD Log error
    }
  }

  inputDialaroundURI(event : React.ChangeEvent<HTMLInputElement>){
    this.props.displayUserMessage("Success", "Network", "Dial Around URI was successfully updated to " +
      this.props.settings.DialAroundURI +
      ".");
    const newSetting = {
        name: 'DialAroundURI',
        value: event.target.value
    }
    this.props.UpdateUserSetting(newSetting);    
  }

  loadDialaroundURL(event : React.ChangeEvent<HTMLInputElement>){
    event.preventDefault();
    var dialaroundURIs : string[] = [];
    if (event.target.files) {
      const file: File = event.target.files[0];

      //@ts-ignore
      // We read the contents of the file as text
      file.text().then((text) => {
        let config: configType;
        try {
          config = JSON.parse(text);// as configType;
          for(var i = 0; i < config.providers.length; i++){
            this.props.displayUserMessage("Success", "Network", "Dial Around URI was successfully updated.");
            //@ts-ignore
            dialaroundURIs.push(config.providers[i].domain);                
          }
          console.dir(dialaroundURIs)
          const newSetting = {
            name: 'DialAroundList',
            value: dialaroundURIs
          }
          this.props.UpdateUserSetting(newSetting);
       }
        catch (e) {
          console.error(e);
          log.error(e);
          this.props.displayUserMessage("Error", "Config File Error", "JSON parsing failed! Is this a valid JSON object?");
          return;
        }
      });
      //We use the line below to reset the value as this allows a file to be uploaded multiple times.
      //@ts-ignore
      event.target.value = null;
    }

  }

  render(){
    return(
      <Form>
        <div className="form-group row justify-content-center">
          <label className="col-sm-4 col-form-label col-form-label-lg">Call Settings</label>
        </div>
        <Form.Group 
              id="anonymousCheckbox" 
              controlId="formBasicCheckbox">
          <Form.Check 
            type="checkbox" 
            label="Make Anonymous Calls" 
            name="anonymous"
            checked={this.state.anonymousChecked}
            onChange={this.checkboxChanged} />
        </Form.Group>
        <Form.Group id="dialAround">
        <Form.Label>Dialaround provider json URI</Form.Label>
          <Form.Control
            type="text"
            defaultValue={this.state.dialAroundURI.toString()}
            onBlur={this.inputDialaroundURI}
            placeholder="Enter URI">
          </Form.Control>
            <div className="row justify-content-center mt-3">
              <div className="col-sm-5">
                <input type="file" className="fileInput" id="config-file-input" onChange={this.loadDialaroundURL} />
                <label className="btn btn-primary btn-block fileInputLabel" htmlFor="config-file-input">
                  Load URI's from JSON
                </label>
              </div>
            </div>
        </Form.Group>
      </Form>
    )
  }
}

export default connector(CallSettings);