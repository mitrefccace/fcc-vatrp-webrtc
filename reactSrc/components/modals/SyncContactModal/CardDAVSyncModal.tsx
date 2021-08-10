import React from 'react';
import { Modal, Button, Card, FormControl, InputGroup, FormLabel, ProgressBar } from 'react-bootstrap';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect, ConnectedProps } from 'react-redux';
import { UpdateUserSetting } from '../../../store/settings/actions'
import { IntUpdateSettingsType } from '../../../store/settings/types';

const Store = require('electron-store');
const store = new Store();
//const log = require('electron-log');

const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};
const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch(UpdateUserSetting(name))
});  

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type CardDAVSyncContactModalProps = PropsFromRedux & {
  displayUserMessage: Function,
  setCardDAVModalVisibility: Function
};

type CardDAVSyncContactModalState = {
  currentUser: string,
  carddavServer: string,
  carddavUsername: string,
  carddavePassword: string,
  cardDAVSyncError: boolean,
  cardDAVSyncProgress: boolean,
  errorMsg: string,
  progressMsg: string,
  editedContact: ContactModel
};

export type ContactTel = {
  number: string
  type: string
};

export type ContactModel = {
  uniqueID: number
  name: string
  numbers: ContactTel[]
};

let min = 0;
let max = 100;
let now = 60;

class CardDAVSyncContactModal extends React.Component<CardDAVSyncContactModalProps, CardDAVSyncContactModalState> {
  constructor(props: CardDAVSyncContactModalProps) {
    super(props);

    this.state = {
      currentUser: this.props.settings.currentUser,
      carddavServer: this.props.settings.CardDAV,
      carddavUsername: '',
      carddavePassword: '',
      cardDAVSyncError: false,
      cardDAVSyncProgress: false,
      errorMsg: '',
      progressMsg: '',
      editedContact: { uniqueID: 0, name: '', numbers: [{ number: '', type: '' }] }
    };

    this.setCarddavServer = this.setCarddavServer.bind(this);
    this.clearCarddav = this.clearCarddav.bind(this);
    this.syncCarddav = this.syncCarddav.bind(this);

    if(!store.has('currentUser')){
      store.set('currentUser','');
      this.props.UpdateUserSetting({name: 'currentUser', value: ''})
    }
    if (!store.has(this.state.currentUser + '.contacts.nextUniqueID')) {
      store.set(this.state.currentUser + '.contacts.nextUniqueID', 0);
    }
    if (!store.has(this.state.currentUser + '.contacts.contactsList')) {
      store.set(this.state.currentUser + '.contacts.contactsList', []);
    }

  }

  setCarddavServer(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const value = target.value;
    this.setState({ carddavServer: value });
  }

  setCarddavUsername(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const value = target.value;
    this.setState({ carddavUsername: value });
  }

  setCarddavPassword(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;
    const value = target.value;
    this.setState({ carddavePassword: value });
  }


  /**
   * Grabs next ID for creating a new contact
   */
  getNextUniqueID(): number {
    let nextID = (this.props.settings.contacts.nextUniqueID) + 1;
    return nextID;
  }

  clearCarddav() {
    ipcRenderer.send('CarddavClear', this.state.carddavServer, this.state.carddavUsername, this.state.carddavePassword);

    ipcRenderer.once('clearAccount', (event) => {
      this.props.displayUserMessage("Success", "Success", "Carddav cleared");
    })
    ipcRenderer.once('FailedDavClear', (event, error) => {
      this.props.displayUserMessage("Error", "Failed to clear Carddav", error);
    });    
  }

  syncCarddav() {
    var contacts = this.props.settings.contacts.contactsList

    ipcRenderer.send('CarddavSync', this.state.carddavServer, this.state.carddavUsername, this.state.carddavePassword, contacts, this.getNextUniqueID());

    ipcRenderer.once('syncedContacts', (event, uniqueID, updatedContacts) => {
      store.set(this.state.currentUser + '.contacts.nextUniqueID', uniqueID);
      store.set(this.state.currentUser + '.contacts.contactsList', updatedContacts);
      this.props.UpdateUserSetting({name: 'contacts', 
       value: {"contactsList": updatedContacts, "nextUniqueID": this.props.settings.contacts.nextUniqueID}})
    });

    ipcRenderer.once('SuccessSync', (event, successMsg) => {
      this.props.displayUserMessage("Success", "Success", successMsg);
      this.props.setCardDAVModalVisibility(false);      
    });

    ipcRenderer.once('noSync', (event) => {
      this.props.displayUserMessage("Success", "Success", "No contacts to be sync-ed");
      this.props.setCardDAVModalVisibility(false);            
    });

    ipcRenderer.on('SyncProgress', (event, situation, current, total) => {
      max = total;
      now = current;
      if(max !== now){
        this.setState({cardDAVSyncProgress: true});
        this.setState({progressMsg: 'Syncing ' + situation + ' card(s) ' + current + ' of ' + total});         
      }             
    });


    ipcRenderer.once('FailedSync', (event, error) => {
      //this.props.displayUserMessage("Error", "Sync Error", error);
      this.setState({cardDAVSyncError: true});
      this.setState({errorMsg: 'Incorrect server URL entered.'});      

    });
  }

  componentWillUnmount(){
    this.setState({cardDAVSyncProgress: false});
    this.forceUpdate();
  }  
render() {
  let modalTitle = 'CardDAV Sync'
  return (
    <Modal show={true}>
      <Modal.Header>
        <Modal.Title aria-label={modalTitle}>{modalTitle}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
          <Card bg='light' className='mb-1'>
            <Card.Body>

              <InputGroup id="carddavInput" className='mb-1'>
                <InputGroup.Prepend>
                  <InputGroup.Text>Server URL</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl 
                  id="carddavServer"
                  defaultValue={this.state.carddavServer} 
                  placeholder="Enter the URL of your cardDAV Server"
                  aria-label="Server URL Input"
                  aria-required="true"
                  aria-live="assertive"
                  onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.setCarddavServer(e)}>
                </FormControl>
              </InputGroup>
              <InputGroup id="carddavUsername" className='mb-1'>
                <InputGroup.Prepend>
                  <InputGroup.Text>Server Username</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  defaultValue={this.state.carddavUsername}
                  placeholder="Enter the username for your cardDAV Server"
                  aria-label="Username Input"
                  aria-required="true"
                  aria-live="polite"
                  onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.setCarddavUsername(e)}>  
                </FormControl>
              </InputGroup>
              <InputGroup id="carddavPassword" className='mb-1'>
                <InputGroup.Prepend>
                  <InputGroup.Text>Server Password</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  type="password"
                  placeholder="Enter the password for your cardDAV Server"
                  aria-label="Password Input"
                  aria-required="true"
                  aria-live="polite"
                  defaultValue={this.state.carddavePassword}
                  onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.setCarddavPassword(e)}>
                </FormControl>
              </InputGroup>
            </Card.Body>
          </Card>
          {this.state.cardDAVSyncError ? <FormLabel style={{color: "red"}}>{this.state.errorMsg} </FormLabel> : null}          
          {this.state.cardDAVSyncProgress ? <div><FormLabel style={{color: "green"}}>{this.state.progressMsg} </FormLabel> <ProgressBar min={min} max={max} now={now} /></div> : null}                    
        </Modal.Body>
      <Modal.Footer>
          <Button variant="info" className='mr-1' onClick={this.syncCarddav}><FontAwesomeIcon icon="sync" /> Sync Contacts</Button>
          <Button variant="danger" onClick={() => this.props.setCardDAVModalVisibility(false)} aria-label="Cancel CardDAV sync" id="CancelCardDAVSync">Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}
}

export default connector(CardDAVSyncContactModal);