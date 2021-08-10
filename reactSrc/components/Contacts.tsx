import React from 'react';
import JssipService from '../services/JssipService';
import ActivePanel from '../services/ActivePanelEnum';
import ContactRow from './ContactRow';
import {Button, ButtonGroup, Dropdown, DropdownButton, Table} from 'react-bootstrap';
import EditContactModal from './modals/EditContactModal/EditContactModal';
import JCardSyncModal from './modals/SyncContactModal/JCardSyncModal';
import CardDAVSyncModal from './modals/SyncContactModal/CardDAVSyncModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect, ConnectedProps } from 'react-redux';
import { UpdateUserSetting } from '../store/settings/actions';
import _ from 'lodash';
import { IntUpdateSettingsType } from '../store/settings/types';
import reduxStore from '../store';

const Store = require('electron-store');
const store = new Store();
const log = require('electron-log');

const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};
const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch(UpdateUserSetting(name))
});  

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type ContactsProps = PropsFromRedux & {
  jssipService : JssipService,
  setActivePanel : Function,
  displayUserMessage: Function
};

type ContactsState = {
  newContactWarning  : boolean,
  currentUser        : string,
  showContactModal   : boolean,
  editedContact      : ContactModel,
  showJCardModal     : boolean,
  showCardDAVModal   : boolean,
};

export type ContactTel = {
  number    : string
  type      : string
  default   : boolean
};

export type ContactModel = {
  uniqueID : number
  name     : string
  numbers  : ContactTel[]
};

class Contacts extends React.Component<ContactsProps, ContactsState> {
  constructor(props: ContactsProps) {
    super(props);
      
    this.state = {
      newContactWarning   : false,
      currentUser         : this.props.settings.currentUser ? this.props.settings.currentUser : '',
      showContactModal    : false,
      editedContact       : { uniqueID: 0, name: '', numbers: [{number: '', type: '', default: false}]},
      showJCardModal      : false,
      showCardDAVModal    : false,    
    };

    this.createContact             = this.createContact.bind(this);
    this.deleteContact             = this.deleteContact.bind(this);
    this.loadContactHeader         = this.loadContactHeader.bind(this);
    this.loadContacts              = this.loadContacts.bind(this);
    this.callContact               = this.callContact.bind(this);
    this.editContact               = this.editContact.bind(this);
    this.setContactModalVisibility = this.setContactModalVisibility.bind(this);
    this.setJCardModalVisibility = this.setJCardModalVisibility.bind(this);
    this.openJCardModal             = this.openJCardModal.bind(this);    
    this.setCardDAVModalVisibility = this.setCardDAVModalVisibility.bind(this);    
    this.openCardDAVModal             = this.openCardDAVModal.bind(this);  
  }

  getContactsList() : ContactModel[] {  
    return this.props.settings.contacts.contactsList
  }

  setContactsList(contacts : ContactModel[]) {

    store.set(this.state.currentUser + '.contacts.contactsList', contacts);
    if (!_.isEqual(contacts, this.props.settings.contacts.contactsList)) 
       this.props.UpdateUserSetting({name: 'contacts', 
       value: {"contactsList": contacts, "nextUniqueID": this.props.settings.contacts.nextUniqueID}})
  }

  /**
   * Grabs next ID for creating a new contact
   */
  getNextUniqueID() : number{
    let nextUniqueID = this.props.settings.contacts.nextUniqueID;
    return nextUniqueID;
  }

  openCardDAVModal(){
    this.setState({ showCardDAVModal: true})
  }

  openJCardModal(){
    this.setState({ showJCardModal: true })
  }

  createContact(){
    let newContact = {
      numbers: [],
      name: "",
      uniqueID: this.getNextUniqueID()
    }
    this.setState({showContactModal : true, editedContact : newContact});
  }

  //Used for sorting the displayed contacts alphabetically
  dynamicSort(property : string) {
  var sortOrder = 1;

  if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }
    //@ts-ignore
    return function (a,b) {
        if(sortOrder === -1){
            return b[property].localeCompare(a[property]);
        }else{
            return a[property].localeCompare(b[property]);
        }        
    }
  }

  loadContactHeader(){
    let header = ["Name","Number", "Actions"];
    //@ts-ignore
    return header.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>
    });
  }

  loadContacts(){
    //var contacts = this.props.settings.contacts.contactsList;
    var contacts = reduxStore.getState().settingsManager.settings.contacts.contactsList;

    contacts.sort(this.dynamicSort('name'));
    return contacts.map((contact: ContactModel, index: any) => {
      let contactRowProps = {
        contact: contact,
        deleteContact: this.deleteContact,
        callContact: this.callContact,
        editContact: this.editContact
      }
      return(<ContactRow key={contact.uniqueID} {...contactRowProps} />)
    })
  }

  callContact(phoneNumber : string){
    this.props.jssipService.registerSessionConnectingCallback(() => this.props.setActivePanel(ActivePanel.callPage));
    this.props.jssipService.startCall(phoneNumber, this.props.settings.anonymous);
  }

  editContact(uniqueID : number){
    let contact = this.getContactsList().find(contact => contact.uniqueID === uniqueID);
    if(contact)
    {
      this.setState({showContactModal : true, editedContact: contact});
    }
  }

  deleteContact(uniqueID : number){
    //Using map we add all ID's except the ID of the contact to remove
    //let contactsUpdated = store.get(this.state.currentUser +'.contacts.contactsList').filter((item : any) => item.uniqueID !== uniqueID);
    let contactsUpdated = this.props.settings.contacts.contactsList.filter((item : any) => item.uniqueID !== uniqueID);
    store.set(this.state.currentUser +'.contacts.contactsList',contactsUpdated);
    this.props.UpdateUserSetting({name: "contacts", value: {contactsList: contactsUpdated, "nextUniqueID": this.props.settings.contacts.nextUniqueID}})
    log.debug("A contact has been removed");
    this.forceUpdate();
  }

  setContactModalVisibility(visible: boolean) {
    this.setState({showContactModal: visible});
  }

  setJCardModalVisibility(visible: boolean) {
    this.setState({showJCardModal: visible});
  }

  setCardDAVModalVisibility(visible: boolean) {
    this.setState({showCardDAVModal: visible});
  }

 render() {
    return(
      <div className='col'>
        <div className="row justify-content-center pt-3">
            <Button variant="success"
              className="mr-3"
              onClick={() => this.createContact()}
              aria-label="Create new contact"
              id="CreateContact"><FontAwesomeIcon icon="user-plus" /> New Contact
            </Button>
          
            <DropdownButton
              variant='info'
              alignRight
              as={ButtonGroup}
              id='contactsSync'
              title={<span><FontAwesomeIcon icon="upload" /> Contacts Sync</span>}
            >
              <Dropdown.Item eventKey='jcard' onClick={() => this.openJCardModal()}> via jCard </Dropdown.Item>
              <Dropdown.Item eventKey='carddav' onClick={() => this.openCardDAVModal()}> CardDAV Server</Dropdown.Item>
            </DropdownButton>
          
        </div>
        <div className="row justify-content-center pt-1">
          <Table id="ContactTable" aria-label="Contacts Table">
            <thead>
              <tr>
              {this.loadContactHeader()}
              </tr>
            </thead>
            <tbody>
              {this.loadContacts()}
            </tbody>
          </Table>
        </div>
        {this.state.showContactModal ? <EditContactModal contact={this.state.editedContact} setContactModalVisibility={this.setContactModalVisibility}/> : null}
        {(this.state.showJCardModal) ? <JCardSyncModal displayUserMessage={this.props.displayUserMessage} setJCardModalVisibility={this.setJCardModalVisibility} /> : null}                  
        {(this.state.showCardDAVModal) ? <CardDAVSyncModal displayUserMessage={this.props.displayUserMessage} setCardDAVModalVisibility={this.setCardDAVModalVisibility}/> : null}                  
      </div>    
    );
  }
}

export default connector(Contacts);