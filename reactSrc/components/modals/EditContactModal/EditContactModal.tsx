import React from 'react';
import {Button, Modal, InputGroup, Form, FormLabel, Col} from 'react-bootstrap';
import ContactEditNumberRow from './ContactEditNumberRow';
import {ContactTel, ContactModel} from '../../Contacts';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UpdateUserSetting } from '../../../store/settings/actions';
import { IntUpdateSettingsType } from '../../../store/settings/types';
const Store = require('electron-store');
const store = new Store();


const mapStateToProps = (state: any) => {
  return {settings: state.settingsManager.settings};
};
const mapDispatchToProps = (dispatch: (arg0: IntUpdateSettingsType) => any) => ({
  UpdateUserSetting: (name: object ) => dispatch(UpdateUserSetting(name))
}); 

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type EditContactModalProps = PropsFromRedux & {
  contact: ContactModel,
  setContactModalVisibility: Function
}

type EditContactModalState = {
  currentUser: string,
  contact: ContactModel,
  editErrorField: string,
  editContactWarning: boolean
}

class EditContactModal extends React.Component<EditContactModalProps, EditContactModalState> {

  constructor(props: EditContactModalProps) {
    super(props);
    
    this.state = {
      contact: props.contact,
      currentUser : this.props.settings.currentUser,
      editErrorField: '',
      editContactWarning : false
    };
    
    this.getContactsList = this.getContactsList.bind(this);
    this.setContactsList = this.setContactsList.bind(this);
    this.saveContact     = this.saveContact.bind(this);
    this.editNumberChange = this.editNumberChange.bind(this);
    this.addNewContactNumber = this.addNewContactNumber.bind(this);
    this.removeNewContactNumber = this.removeNewContactNumber.bind(this);
    this.defaultSelected  = this.defaultSelected.bind(this);
  }

  componentDidMount(){
    //if(!this.state.contact.numbers.find(number => number.number === "")){
    let tempContact = this.state.contact;
    tempContact.numbers.push({number:"", type:"Cell", default: false});
    this.setState({contact: tempContact});
    //}
  }

  getContactsList() : ContactModel[] {
    return this.props.settings.contacts.contactsList;
  }

  setContactsList(contacts : ContactModel[]) {
    store.set(this.state.currentUser + '.contacts.contactsList', contacts);
    this.props.UpdateUserSetting({name: "contacts", value: {"contactsList": contacts, "nextUniqueID": this.props.settings.contacts.nextUniqueID + 1}})
  }

  saveContact(){
    var tempContacts = this.getContactsList();
    if (this.state.contact.name === '')
    {
      this.setState({editContactWarning: true});
      this.setState({editErrorField: 'Name'});
    }
    else if (this.state.contact.numbers.length === 0)
    {
      this.setState({editContactWarning: true});
      this.setState({editErrorField: 'Number'});
    }
    else if (this.isNewContact())       
    {
      let tempContact = this.state.contact;
      tempContact.numbers = tempContact.numbers.filter(number => number.number !== '')

      tempContacts.push(tempContact);
      store.set(this.state.currentUser + '.contacts.nextUniqueID', this.state.contact.uniqueID + 1);
      this.props.UpdateUserSetting({name: "contacts", value: {"contactsList": this.props.settings.contacts.contactsList, "nextUniqueID": this.props.settings.contacts.nextUniqueID + 1}})
      this.setContactsList(tempContacts);
      this.props.setContactModalVisibility(false);
    }
    else
    {
      let tempContact = this.state.contact;
      tempContact.numbers = tempContact.numbers.filter(number => number.number !== '')
      tempContacts = tempContacts.map(contact => contact.uniqueID === tempContact.uniqueID ? tempContact : contact)
      this.setContactsList(tempContacts);
      this.props.setContactModalVisibility(false);
    }
  }

  isNewContact() : boolean {
    let matchingContact = this.getContactsList().find(existingContact => existingContact.uniqueID === this.props.settings.contacts.nextUniqueID);
    return matchingContact === undefined;
  }

  editNameChange(event : React.ChangeEvent<HTMLInputElement>){
    const value  = event.target.value;
    let tempContact = this.state.contact;
    tempContact.name = value;
    this.setState({contact : tempContact});
  }

  editNameKeyPressed(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === 'Returned') {
      event.preventDefault();
      this.saveContact()
    }
  }

  editNumberChange(contactTel: ContactTel, index: number) {
    let tempContact = this.state.contact;
    tempContact.numbers[index] = contactTel;
    this.setState({contact: tempContact});
  }

  addNewContactNumber(){
    let tempContact = this.state.contact;
    tempContact.numbers.push({number:"", type:"Cell", default:false});
    this.setState({contact: tempContact});
  }

  removeNewContactNumber(index : number){
    let tempContact = this.state.contact;
    tempContact.numbers.splice(index, 1);
    this.setState({contact : tempContact});
  }
  
  defaultSelected(event: React.ChangeEvent<HTMLInputElement>, index: number) {
    const checked  = event.target.checked;

    if (checked){
      let tempContact = this.state.contact;
      tempContact.numbers.forEach((numberModel, numberIndex) => {
        if(numberIndex === index) {
          numberModel.default = true;
        }
        else{
          numberModel.default = false;
        }
      });
      this.setState({contact: tempContact});
    }
  }

  render() {
    let modalTitle = this.isNewContact() ? "Create New Contact" : "Edit Contact";
    let contactNumbersWithNewNumber = [...this.state.contact.numbers];

    if(!this.state.contact.numbers.find(number => number.number === "")){
      contactNumbersWithNewNumber.push({number:"", type:"Cell", default: false});
    }
    return (
      <Modal show={true}>
        <Modal.Header>
          <Modal.Title aria-label={modalTitle}>{modalTitle}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Row>
            <Form.Group as={Col}>
              <InputGroup id="EditContactName">
                <InputGroup.Prepend>
                  <InputGroup.Text>Name</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control 
                  onChange={(e : React.ChangeEvent<HTMLInputElement>) => this.editNameChange(e)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => this.editNameKeyPressed(e)}
                  value={this.state.contact.name}
                  aria-label="Enter contact name"></Form.Control>
              </InputGroup>
            </Form.Group>
            </Form.Row>
            {
              contactNumbersWithNewNumber.map((numberModel, index) => {
                return <ContactEditNumberRow 
                  contactTel={numberModel} 
                  index={index} 
                  key={index} 
                  saveContact={this.saveContact} 
                  editNumberChange={this.editNumberChange}
                  removeNewContactNumber={this.removeNewContactNumber}
                  defaultSelected={this.defaultSelected}/>
              })
            }
            <Form.Row>
                <Col>
                  <Button variant="success" onClick={() => this.addNewContactNumber()}><FontAwesomeIcon icon="plus-circle" /></Button> Add Phone
                </Col>
            </Form.Row>
            {this.state.editContactWarning ? <FormLabel style={{color: "red"}}>Missing required fields: {this.state.editErrorField} </FormLabel> : null}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="success" 
          onClick={() => this.saveContact()}
          aria-label="Save new contact"
          id="SaveNewContact">Save</Button>
          <Button variant="danger" 
          onClick={() => this.props.setContactModalVisibility(false)}
          aria-label="Cancel contact creation"
          id="CancelNewContact">Cancel</Button>
        </Modal.Footer>
      </Modal> 
    );
  }
}

export default connector(EditContactModal);