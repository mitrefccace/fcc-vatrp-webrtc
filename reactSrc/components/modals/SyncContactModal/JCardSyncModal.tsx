import React from 'react';
import {Modal, Button, Card,  FormControl, InputGroup, FormLabel} from 'react-bootstrap';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect, ConnectedProps } from 'react-redux';
import { UpdateUserSetting } from '../../../store/settings/actions';
import { IntUpdateSettingsType } from '../../../store/settings/types';

const Store = require('electron-store');
const store = new Store();
//const log = require('electron-log');
var vCard = require('vcf');

const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};
const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch({type: 'UPDATE_SETTING', payload: name})
});

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type JCardSyncContactModalProps = PropsFromRedux & {
  displayUserMessage: Function,
  setJCardModalVisibility: Function,
};

type JCardSyncContactModalState = {
  currentUser: string,
  JcardServer        : string,
  JcardSyncError   : boolean,
  errorMsg           : string,
  editedContact      : ContactModel  
};

export type ContactTel = {
  number    : string
  type      : string
};

export type ContactModel = {
  uniqueID : number
  name     : string
  numbers  : ContactTel[]
};

class JCardSyncContactModal extends React.Component<JCardSyncContactModalProps, JCardSyncContactModalState> {
  constructor(props: JCardSyncContactModalProps) {
    super(props);
      
    this.state = {
      currentUser : this.props.settings.currentUser,      
      JcardServer         : this.props.settings.JCardImportURI,
      JcardSyncError    : false,
      errorMsg            : '',
      editedContact       : { uniqueID: 0, name: '', numbers: [{number: '', type: ''}]}
    };

    this.setJcardServer            = this.setJcardServer.bind(this);
    this.jcardImport               = this.jcardImport.bind(this);
    this.jcardExport               = this.jcardExport.bind(this);

    if(!store.has('currentUser')){
      store.set('currentUser','');
      this.props.UpdateUserSetting({name: 'currentUser', value: ''})
    }
    if (!store.has(this.state.currentUser + '.contacts.nextUniqueID')) {
      store.set(this.state.currentUser + '.contacts.nextUniqueID', 0);
      this.props.UpdateUserSetting({name: 'contacts', value: {"contactsList": [], "nextUniqueID": 0}})
    }
    if (!store.has(this.state.currentUser + '.contacts.contactsList')) {
      store.set(this.state.currentUser + '.contacts.contactsList', []);
    }
    
  }

  setJcardServer(event: React.ChangeEvent<HTMLInputElement>){
    const target = event.target;
    const value  = target.value;
    this.setState({JcardServer: value});
  }

  /**
   * Grabs next ID for creating a new contact
   */
  getNextUniqueID() : number{
    let nextID = this.props.settings.contacts.nextUniqueID + 1
    return nextID;
  }

  jcardImport(){
    ipcRenderer.send('jcardImport', this.state.JcardServer);

    ipcRenderer.once('obtainedJcard', (event, fetchJson) =>{
      var tempContacts = this.props.settings.contacts.contactsList
      let newContact = {
        numbers: [] as any,
        name: "",
        uniqueID: this.getNextUniqueID()
      }
      newContact.name = fetchJson[1][1][3];
      for(var i = 0; i < fetchJson[1].length; i++){
        if(fetchJson[1][i][0] === "tel"){
          for(var j = 0; j < fetchJson[1][i][1].type.length; j++){
            if(fetchJson[1][i][1].type[j] === "home"){
              newContact.numbers.push({'number' : fetchJson[1][i][3].replace(/[^0-9]/g,''), 'type' : 'Home'});
            }else if(fetchJson[1][i][1].type[j] === "work"){
              newContact.numbers.push({'number' : fetchJson[1][i][3].replace(/[^0-9]/g,''), 'type' : 'Work'});
            }else if(fetchJson[1][i][1].type[j] === "cell"){
              newContact.numbers.push({'number' : fetchJson[1][i][3].replace(/[^0-9]/g,''), 'type' : 'Cell'});
            }
          }
        }
      }
      this.setState({editedContact : newContact});
      tempContacts.push(newContact);
      store.set(this.state.currentUser + '.contacts.nextUniqueID', newContact.uniqueID);
      //Need another loop here
      store.set(this.state.currentUser + '.contacts.contactsList', tempContacts);
      UpdateUserSetting({name: "contacts", value: {"contactsList": tempContacts, "nextUniqueID": newContact.uniqueID}})
      this.forceUpdate();
      this.props.displayUserMessage("Success", "Jcard Imported", "Jcard successfully downloaded");      
      this.props.setJCardModalVisibility(false);
    });

    ipcRenderer.once('failedJcardimport', (event, error) => {
      //this.props.displayUserMessage("Error", "Jcard Import Error", "Error: " + error);
      this.setState({JcardSyncError: true});
      this.setState({errorMsg: 'Incorrect server URL entered.'});      
    })
  }

  jcardExport(){
    var contacts = this.props.settings.contacts.contactsList
    var vcardArray = [];
    var vcard = new vCard();
    for(var i = 0; i < contacts.length; i++){
      //Get all contacts numbers
      vcard.add('fn',contacts[i].name);
      for(var j = 0; j < contacts[i].numbers.length; j++){
        vcard.add('tel','',{'type' : [contacts[i].numbers[j].type], value : 'uri:tel:' + contacts[i].numbers[j].number})
      }
      var jcard = vcard.toJCard('4.0');
      vcardArray.push(jcard);
      vcard = new vCard();

    }
    ipcRenderer.send('jcardExport' ,this.state.JcardServer ,vcardArray);

    ipcRenderer.once('sentJcard', (event) => {
      this.props.displayUserMessage("Success", "Jcard sent", "Jcard successfully uploaded");
      this.props.setJCardModalVisibility(false);
    });

    ipcRenderer.once('failedJcardexport', (event, error) => {
      //this.props.displayUserMessage("Error", "Failed to Export", "Error: " + error);
      this.setState({JcardSyncError: true});
      this.setState({errorMsg: 'Incorrect server URL entered.'});      

    });
  }


 render() {
    let modalTitle = 'jCard Import/Export'
    return (
      <Modal show={true}>
        <Modal.Header>
          <Modal.Title aria-label={modalTitle}>{modalTitle}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Card bg='light' className='mb-2' >
            <Card.Body>
              <InputGroup className='mb-1'>
                <InputGroup.Prepend>
                  <InputGroup.Text>Server URL</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  id="jcardInput"
                  defaultValue={this.state.JcardServer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setJcardServer(e)}
                  placeholder="Enter the URL of your jCard Server"
                  aria-label="Server URL Input"
                  aria-required="true"
                  aria-live="assertive">
                </FormControl>
              </InputGroup>
            </Card.Body>
          </Card>
          {this.state.JcardSyncError ? <FormLabel style={{color: "red"}}>{this.state.errorMsg} </FormLabel> : null}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="info" className='mr-1' onClick={this.jcardImport}> <FontAwesomeIcon icon="file-import" /> Download Contacts</Button>
            <Button variant="info" className='mr-1'onClick={this.jcardExport}><FontAwesomeIcon icon="file-export" /> Upload Contacts</Button>
            <Button variant="danger" onClick={() => this.props.setJCardModalVisibility(false)} aria-label="Cancel jCard sync" id="CanceljCardSync">Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connector(JCardSyncContactModal);