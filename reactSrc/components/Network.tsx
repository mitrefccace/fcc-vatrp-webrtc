import React from 'react';
import JssipService from '../services/JssipService';
import miscServerList from '../services/MiscServers';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import { ipcRenderer } from 'electron';
import { connect, ConnectedProps } from 'react-redux';
import { IntUpdateSettingsType } from '../store/settings/types';

const Store = require('electron-store');
const store = new Store();
const log = require('electron-log');

const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};
const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch({type: 'UPDATE_SETTING', payload: name})
});

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>


interface miscServerType {
  type: string;
  uri: string;  
}

type NetworkProps = PropsFromRedux & {
  jssipService: JssipService
  displayUserMessage: Function
}

type NetworkState = {
  currentUser          : string;
  fetchURL             : string;
  showNewServerModal   : boolean;
  showEditServerModal  : boolean;
  newServerName        : string;
  editServerName       : string;
  orgEditServerName    : string;
  postURL              : string,
  geolocationURI       : string,
  contactURI           : string,
  JCardImportURI       : string,
  JCardExportURI       : string,
  CardDAV              : string,
  mwiURI               : string,
  jssipConfigurationUri: string
}

class Network extends React.Component<NetworkProps, NetworkState>{
  constructor(props: NetworkProps) {
    super(props);
    
    this.state = {
      currentUser        : props.settings.currentUser ? props.settings.currentUser : '',
      fetchURL           : "",
      showNewServerModal : false,
      showEditServerModal: false,
      newServerName      : "",
      editServerName     : "",
      orgEditServerName  : "",
      postURL            : this.props.settings.postURL,
      geolocationURI     : this.props.settings.geolocationURI,
      contactURI         : this.props.settings.contactURI,
      JCardImportURI     : this.props.settings.JCardImportURI,
      JCardExportURI     : this.props.settings.JCardExportURI,
      CardDAV            : this.props.settings.CardDAV,
      mwiURI             : this.props.settings.mwiURI,
      jssipConfigurationUri: ''
    }

    this.serverValueChanged = this.serverValueChanged.bind(this);
    this.addNewServer       = this.addNewServer.bind(this);
    this.editServer         = this.editServer.bind(this);
    this.removeServer       = this.removeServer.bind(this);
    this.loadServerList     = this.loadServerList.bind(this);
    this.setNewHTTPServers  = this.setNewHTTPServers.bind(this);
    this.addNewHTTPServers  = this.addNewHTTPServers.bind(this);
    this.isValidUrl         = this.isValidUrl.bind(this);
  }

  serverValueChanged(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (event.target.name === "newServer") {
      this.setState({ newServerName: value });
    } else if (event.target.name === "editServer") {
      this.setState({ editServerName: value });
    }
  }

  setNewHTTPServers(event : React.ChangeEvent<HTMLInputElement>){
    this.setState({jssipConfigurationUri: event.target.value})
  }

  addNewHTTPServers(){
    if(!this.isValidUrl(this.state.jssipConfigurationUri)){
      this.props.displayUserMessage("Error", "Set Server Error", "URL must be of the form http(s)://example.com");
      return;
    }

    if(this.state.jssipConfigurationUri.length === 0){
      return;
    }
    ipcRenderer.send('addNewServer', this.state.jssipConfigurationUri);

    ipcRenderer.once('obtainedServers', (event, fetchJson) => {
      var serverData = store.get("servers");
      for(var i = 0; i < fetchJson.servers.length; i++){
        if(!serverData.includes(fetchJson.servers[i])){
          serverData.push(fetchJson.servers[i]);
        }
      }
      store.set("servers",serverData);
      this.props.UpdateUserSetting({name: 'servers', value: serverData})
      this.forceUpdate();
      log.debug("Added servers from HTTP request");
    });

    ipcRenderer.once('failedAddServer', (event, error) => {
      log.error('Error:', error);      
      this.props.displayUserMessage("Error", "Add Server(s) Error", error);
    })
  }

  isValidUrl(url: any){
    url = url.toString();
    if(url.length === 0){
      return true
    }
    var urlRegx = new RegExp(/^(http|https):\/\/[^ "]+$/);
    let isFormattedCorrectly = urlRegx.test(url)
    return isFormattedCorrectly
  }

addNewServer(){
  this.setState({showNewServerModal : false});
  //var serverData = store.get("servers");
  let serverData = this.props.settings.servers
  var newName = this.state.newServerName;
  serverData.push(newName);
  store.set("servers",serverData);
  this.props.UpdateUserSetting({name: 'servers', value: serverData})
  log.debug("Added server " + newName);
}

editServer() {
  this.setState({ showEditServerModal: false });
  var newName = this.state.editServerName;
  var orgName = this.state.orgEditServerName;
  const serverData = this.props.settings.servers
  var newData: any = { "servers": [] };
  for (var i = 0; i < serverData.length; i++) {
    if (serverData[i] !== orgName) {
      newData.servers.push(serverData[i]);
    }
  }
  newData.servers.push(newName);
  console.log("Saving new data " + JSON.stringify(newData.servers));
  store.set("servers", newData.servers);
  this.props.UpdateUserSetting({name: 'servers', value: newData.servers})
  log.debug("The server " + orgName + " has been updated to " + newName);
}

  removeServer(remove : string){
    var newData : any = {"servers" : []};
    const serverData = this.props.settings.servers
    for(var i = 0; i < serverData.length; i++){
      if(serverData[i] !== remove){
        newData.servers.push(serverData[i]);
      }
    }
    store.set("servers",newData.servers);
    this.props.UpdateUserSetting({name: 'servers', value: newData.servers})
    log.debug(remove + " has been removed from the server list.");
    this.forceUpdate();
  }

  handleChange=(event : React.ChangeEvent<HTMLInputElement>, uri:any) =>{
    const value = event.target.value; 
    var newState:any = {};
    newState[uri] = value;
    this.setState(newState);
  }  

  updateMiscServer(typeUrl: any) {
    const name: keyof NetworkState  = typeUrl;
    const uri = this.state[name];
    if(!this.isValidUrl(uri)){
      this.props.displayUserMessage("Error", "Set Server Error", "URL must be of the form http(s)://example.com");
      return;
    }
    const newSetting = {
      name: typeUrl,
      value: uri
    }
    console.dir(newSetting)

    if(name === "geolocationURI"){
      store.set("geolocationURI", uri);
    }else if(name === "postURL"){
      store.set("postURL", uri);
    }else if(name === "contactURI"){
      store.set("contactURI", uri);
    }else{
      store.set(this.state.currentUser + ".settings." + name, uri);
    }

    this.props.UpdateUserSetting(newSetting);
    this.props.displayUserMessage("Success", "Network", typeUrl + " was successfully updated.");
    this.forceUpdate();
  }

  renderOtherServers() {
     const miscServers: miscServerType[] = [];
     miscServerList.forEach (i => {
      
      const j = {
        type: i.type,
        uri: this.props.settings[i.type],
      };
      miscServers.push(j);

    });

    return (
      <div>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Server</th>
              <th>URL</th>              
            </tr>
          </thead>
          <tbody>
          {miscServers.map(i=>{
            const uri:any = i.uri;
            return( <tr key={i.type}>
              <td>{i.type}</td>
              <td key={i.type}><InputGroup className="mb-3">
                <FormControl
                  defaultValue={uri}
                  placeholder="URL"
                  aria-label="URL"
                  onChange={(e:any) => this.handleChange(e,  i.type)}
                  isInvalid={!this.isValidUrl(this.state[(i.type as keyof NetworkState)])}
                  aria-describedby="basic-addon2">
                  </FormControl>
                <InputGroup.Append>
                  <Button variant="success"
                  onClick={(e:any) => this.updateMiscServer(i.type)}
                  >                  
                  Save</Button>
                </InputGroup.Append>
                <Form.Control.Feedback type="invalid">
                  URL must be of the form http(s)://example.com
                </Form.Control.Feedback>
              </InputGroup></td>
            </tr>            
          )})}
             
         </tbody>
        </Table>
     </div>)

  }

  loadServerList() {
    //return store.get("servers").map((servers: any, i: number) => {
    return this.props.settings.servers.map((servers: any, i: number) => {
      return (
        <tr key={i}>
          <td>{servers}</td>
          <td><Button
            variant="info"
            aria-label="Edit Server"
            onClick={() => this.setState({ editServerName: servers, showEditServerModal: true, orgEditServerName: servers })}>Edit Server</Button></td>
          <td><Button
            variant="danger"
            aria-label="Remove Server"
            onClick={() => { this.removeServer(servers) }}>Remove Server</Button></td>
        </tr>
      )
    });
  }

  render() {
    return (
      <Form>
        <div className="form-group row justify-content-center">
          <label className="col-sm-4 col-form-label col-form-label-lg">Network Settings</label>
        </div>
        <Form.Group
          id="serverConfigUpload"
          controlId="formBasicInput">
          <Form.Label>Server HTTP Upload</Form.Label>
          <InputGroup className="mb-3">
            <FormControl
              defaultValue={this.state.jssipConfigurationUri}
              placeholder="Type HTTP Server link here"
              isInvalid={!this.isValidUrl(this.state.jssipConfigurationUri)}
              onChange={this.setNewHTTPServers}>
              </FormControl>
            <InputGroup.Append>
              <Button variant="success"
              onClick={() => this.addNewHTTPServers()}>                  
              Save</Button>
            </InputGroup.Append>
            <Form.Control.Feedback type="invalid">
              URL must be of the form http(s)://example.com
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>        
        Server List
        <Table>
          <tbody>{this.loadServerList()}</tbody>
        </Table>
        <Button id="NewServerButton" aria-label="NewServerButton" onClick={() => this.setState({ newServerName: "", showNewServerModal: true })}>Add New Server</Button>
        <Modal show={this.state.showNewServerModal}>
          <Modal.Header>Add new server</Modal.Header>
          <Modal.Body>
            <InputGroup id="ServerName">
              <FormControl onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.serverValueChanged(e)}
                name="newServer"
                value={this.state.newServerName}
                aria-label="Enter new server"
              />
            </InputGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="success"
              onClick={this.addNewServer}>Save</Button>
            <Button
              variant="danger"
              onClick={() => this.setState({ showNewServerModal: false })}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showEditServerModal}>
          <Modal.Header>Edit Server</Modal.Header>
          <Modal.Body>
            <InputGroup id="EditServerName">
              <FormControl onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.serverValueChanged(e)}
                name="editServer"
                value={this.state.editServerName}
                aria-label="Edit Server Name"
              />
            </InputGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="success"
              onClick={this.editServer}>Save</Button>
            <Button
              variant="danger"
              onClick={() => this.setState({ showEditServerModal: false })}>Cancel</Button>
          </Modal.Footer>
        </Modal>
        {this.renderOtherServers()}
      </Form>
    )
  }
}

export default connector(Network);