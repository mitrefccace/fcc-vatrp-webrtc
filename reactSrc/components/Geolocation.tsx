import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { ipcRenderer } from 'electron';

import { connect, ConnectedProps } from 'react-redux';
import { IntUpdateSettingsType } from '../store/settings/types';
const Store = require('electron-store');
const store = new Store();

const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};
const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch({type: 'UPDATE_SETTING', payload: name})
});

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type GeolocationProps = PropsFromRedux & {
  displayUserMessage: Function
  hideGeolocationModal: Function
};

type GeolocationState = {
  postURL          : string,
  geolocationURI   : string,
  contactURI       : string,
  longitude        : Number,
  latitude         : Number,
  ESPG             : Number,
  streetName       : string,
  streetNumber     : string,
  streetType       : string,
  city             : string,
  streetState      : string,
  postalCode       : string
};

class Geolocation extends React.Component<GeolocationProps, GeolocationState> {
  constructor(props: GeolocationProps){
    super(props);
    this.state = {
      postURL          : this.props.settings.postURL !== "" ? this.props.settings.postURL : store.get('postURL'),
      geolocationURI   : this.props.settings.geolocationURI !== "" ? this.props.settings.geolocationURI : store.get('geolocationURI'),
      contactURI       : this.props.settings.contactURI !== "" ? this.props.settings.contactURI : store.get('contactURI'),
      longitude        : 0,
      latitude         : 0,
      ESPG             : 0,
      streetName       : "",
      streetNumber     : "",
      streetType       : "",
      city             : "",
      streetState      : "",
      postalCode       : ""
    };

    this.handleChange                 = this.handleChange.bind(this);
    this.submitGPS                    = this.submitGPS.bind(this);
    this.submitCivicAddress           = this.submitCivicAddress.bind(this);
    this.onCancel                     = this.onCancel.bind(this);
  }

  handleChange(event : React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const value  = target.value;
    const name   = target.name;
    // @ts-ignore
    this.setState({[name]: String(value)}); 
  }

  submitGPS(){
    if(this.state.longitude && this.state.latitude && this.state.ESPG){
      this.updateSettingsStore("geolocationURI", this.state.geolocationURI)
      this.updateSettingsStore("contactURI", this.state.contactURI)
      this.updateSettingsStore("postURL", this.state.postURL)

      ipcRenderer.send('gpsgeo',this.state.postURL, this.state.longitude, this.state.latitude, this.state.ESPG);
       
      ipcRenderer.once('successgps', (event)=>{
        this.props.displayUserMessage("Success", "Geolocation", "Geolocation was successfully submitted.");
      }) 
      ipcRenderer.once('failedgps', (event)=>{
        this.props.displayUserMessage("Error", "Geolocation", "Geolocation was NOT successfully submitted.");
      })
      
    }
    else{
      this.props.displayUserMessage("Error", "Location Error", "All fields must be filled to register location.");
    }
    this.props.hideGeolocationModal();
  }
 
  submitCivicAddress(){
    if(this.state.streetName !== "" && this.state.streetNumber !== "" && this.state.streetState !== "" && this.state.streetType !== "" && this.state.postalCode !== "" && this.state.city !== ""){
      this.updateSettingsStore("geolocationURI", this.state.geolocationURI);
      this.updateSettingsStore("contactURI", this.state.contactURI);
      this.updateSettingsStore("postURL", this.state.postURL)
      ipcRenderer.send('civicgeo', this.state.postURL, this.state.streetState, this.state.city, this.state.streetName, this.state.streetType, this.state.postalCode);
      
      ipcRenderer.once('successca', (event)=>{
        this.props.displayUserMessage("Success", "CivicAddress", "Civic Address was successfully submitted.");
      }) 
      ipcRenderer.once('failedca', (event)=>{
        this.props.displayUserMessage("Error", "CivicAddress", "Civic Address was NOT successfully submitted.");
      })
    }
    else{
      this.props.displayUserMessage("Error", "Location Error", "All fields must be filled to register location.");
    }
    this.props.hideGeolocationModal();
  }

  onCancel(){
    this.props.hideGeolocationModal();
  }

  updateSettingsStore(name: string, value: any) {
    let newSetting = {
      name: name,
      value: value
    }
    this.props.UpdateUserSetting(newSetting)
  }
  render(){
    return(
      <Modal show={true}>
            <Modal.Header>
              User Location
            </Modal.Header>
            <Modal.Body>
            <Form id="postInfo" className="mb-2">
                <Form.Label>POST URL</Form.Label>
                <Form.Control type="text" name="postURL" value={this.state.postURL} onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}></Form.Control>
                <Form.Label>
                  Geolocation URI
                </Form.Label>
                <Form.Control type="text" name="geolocationURI" value={this.state.geolocationURI} onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}></Form.Control>
                <Form.Label>
                  Contacts URI
                </Form.Label>
                <Form.Control  type="text" name="contactURI" value={this.state.contactURI} onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}></Form.Control>
              </Form>
              <Tabs id="GeolocationTabs" className="mt-1">
                <Tab eventKey="GPS" title="GPS" className="mt-4">
                  <Form id="GPSform">
                    <Form.Group as={Row}>
                      <Form.Label className="text-right" column sm="3">X Coordinate/ Longitude</Form.Label>
                      <Col sm="7">
                        <Form.Control 
                          type="text" 
                          id="Longitude" 
                          aria-label="Enter longitude" 
                          value={this.state.longitude.toString()}
                          name="longitude"
                          onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}>
                        </Form.Control>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                      <Form.Label className="text-right" column sm="3">Y Coordinate/ Latitude</Form.Label>
                      <Col sm="7">
                        <Form.Control 
                          type="text" 
                          id="Latitude" 
                          aria-label="Enter latitude" 
                          value={this.state.latitude.toString()}
                          name="latitude"
                          onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}>
                        </Form.Control>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                      <Form.Label className="text-right" column sm="3">ESPG</Form.Label>
                      <Col sm="7">
                        <Form.Control 
                          type="text" 
                          id="ESPG" 
                          aria-label="Enter ESPG" 
                          value={this.state.ESPG.toString()}
                          name="ESPG"
                          onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}>
                        </Form.Control>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                      <Col className="text-center" md="12">
                        <Button variant="success" onClick={this.submitGPS}>Submit</Button>
                      </Col>
                    </Form.Group>
                  </Form>
                </Tab>

                <Tab eventKey="civiclocation" title="Civic Location" className="mt-4">
                  <Form id="CivicForm">
                    <Form.Group as={Row}>
                      <Form.Label className="text-right" column sm="3">Street Number</Form.Label>
                      <Col sm="7">
                        <Form.Control 
                          type="text" 
                          id="streetNumber" 
                          aria-label="Enter Street Number"
                          value={this.state.streetNumber.toString()}
                          name="streetNumber"
                          onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}>
                        </Form.Control>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                      <Form.Label className="text-right" column sm="3">Street Name</Form.Label>
                      <Col sm="7">
                        <Form.Control 
                          type="text" 
                          id="streetName" 
                          aria-label="Enter Street Name"
                          value={this.state.streetName.toString()}
                          name="streetName"
                          onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}>
                        </Form.Control>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                      <Form.Label className="text-right" column sm="3">Type (ave, rd, etc)</Form.Label>
                      <Col sm="7">
                        <Form.Control 
                          type="text" 
                          id="addressType" 
                          aria-label="Enter street type"
                          value={this.state.streetType.toString()}
                          name="streetType"
                          onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}>
                        </Form.Control>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                      <Form.Label className="text-right" column sm="3">City</Form.Label>
                      <Col sm="7">
                        <Form.Control 
                          type="text" 
                          id="city" 
                          aria-label="Enter city"
                          value={this.state.city.toString()}
                          name="city"
                          onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}>
                        </Form.Control>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                      <Form.Label className="text-right" column sm="3">State</Form.Label>
                      <Col sm="7">
                        <Form.Control 
                          type="text" 
                          id="state" 
                          aria-label="Enter state"
                          value={this.state.streetState.toString()}
                          name="streetState"
                          onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}>
                        </Form.Control>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                      <Form.Label className="text-right" column sm="3">ZIP/Postal Code</Form.Label>
                      <Col sm="7">
                        <Form.Control 
                          type="text" 
                          id="postalCode" 
                          aria-label="Enter Postal Code"
                          value={this.state.postalCode.toString()}
                          name="postalCode"
                          onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.handleChange(e)}>
                        </Form.Control>
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                      <Col className="text-center" md="12">
                        <Button variant="success" onClick={this.submitCivicAddress}>Submit</Button>
                      </Col>
                    </Form.Group>
                  </Form>

                </Tab>
                <Tab eventKey="fromfile" title="From File" className="mt-4">
                  <Form id="fileGeolocation">
                    <Form.Group as={Row}>
                    <input  type="file"  className="fileInput" id="config-file-input" />
                    <label className="btn btn-primary btn-block fileInputLabel" htmlFor="config-file-input">
                      Select Geolocation File
                    </label>
                    </Form.Group>
                  </Form>
                </Tab>
              </Tabs>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={ this.onCancel}>Cancel</Button>
            </Modal.Footer>
          </Modal>
    );
  }
}

export default connector(Geolocation);