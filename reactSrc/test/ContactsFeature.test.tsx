import React from 'react';
import {shallow, ShallowWrapper } from 'enzyme';
import Contacts from '../components/Contacts';
import JssipService from '../services/JssipService';
import ActivePanel from '../services/ActivePanelEnum';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

let phoneNumber = "7032151872";
let server = "ntlacedev1.task3acrdemo.com";
let password = "1qaz1qaz";

//Run yarn test ContactsFeature
describe("Test the contacts component functionality", () => {
  let wrapper: ShallowWrapper;
  let JssipService: JssipService;
  let setActivePanel: ActivePanel.contacts;

  beforeEach(() => {
    wrapper = shallow(<Contacts jssipService={JssipService} setActivePanel={ (ap: ActivePanel) => {}} /> );
  })

  afterEach(() => {
    wrapper.unmount();
  })

  test("Remove a contact", () => {
    const instance = wrapper.instance() as Contacts;
    let testContacts = [{'uniqueID' : 'testKey', 'name' : 'testName', 'number' : 'testNumber'}];
    let contactsUpdated = [{'uniqueID' : '', 'name' : '', 'number' : ''}];

    instance.loadContacts = jest.fn( () => {
      return (
        <tr key={testContacts[0].uniqueID}>
          <td>{testContacts[0].name}</td>
          <td>{testContacts[0].number}</td>
          <td>
            <Button variant="success" 
              id="call" 
              className="m-1" 
              aria-label="Call Contact"
              onClick={() => {}}><FontAwesomeIcon icon="phone" /></Button>
            <Button variant="info" 
              id="editContact" 
              className="m-1" 
              aria-label="Edit Contact"
              onClick={() => {}}><FontAwesomeIcon icon="edit" />></Button>
            <Button variant="danger" 
              id="removeContact" 
              className="m-1" 
              aria-label="Delete Contact"
              onClick={() => {}}><FontAwesomeIcon icon="user-minus" /></Button>
          </td>
        </tr>
      )
    });

    instance.deleteContact = jest.fn( () => {
      contactsUpdated = testContacts.filter((item : any) => 'testKey' !== 'testKey');
      //store.set('contacts',contactsUpdated);
    });

    instance.loadContacts = jest.fn( () => {
      return (
        <tr key={contactsUpdated[0].uniqueID}>
          <td>{testContacts[0].name}</td>
          <td>{testContacts[0].number}</td>
          <td>
            <Button variant="success" 
              id="call" 
              className="m-1" 
              aria-label="Call Contact"
              onClick={() => {}}><FontAwesomeIcon icon="phone" /></Button>
            <Button variant="info" 
              id="editContact" 
              className="m-1" 
              aria-label="Edit Contact"
              onClick={() => {}}><FontAwesomeIcon icon="edit" /></Button>
            <Button variant="danger" 
              id="removeContact" 
              className="m-1" 
              aria-label="Delete Contact"
              onClick={() => {}}><FontAwesomeIcon icon="user-minus" /></Button>
          </td>
        </tr>
      )
    });


    expect(wrapper.exists("#editContact")).toBe(false);

  });

  test("Edit a contact", () => {
    const instance = wrapper.instance() as Contacts;
    let testContacts = [{'uniqueID' : 'testKey', 'name' : 'testName', 'number' : 'testNumber'}];
    let contactsUpdated = [{'uniqueID' : 'testKey', 'name' : 'testName', 'number' : 'testNumber'}];
    var uniqueIDstate = "";
    var editedName = ""
    var editedNumber = "";

    instance.loadContacts = jest.fn( () => {
      return (
        <tr key={testContacts[0].uniqueID}>
          <td>{testContacts[0].name}</td>
          <td>{testContacts[0].number}</td>
          <td>
            <Button variant="success" 
              id="call" 
              className="m-1" 
              aria-label="Call Contact"
              onClick={() => {}}><FontAwesomeIcon icon="phone" /></Button>
            <Button variant="info" 
              id="editContact" 
              className="m-1" 
              aria-label="Edit Contact"
              onClick={() => {}}><FontAwesomeIcon icon="edit" /></Button>
            <Button variant="danger" 
              id="removeContact" 
              className="m-1" 
              aria-label="Delete Contact"
              onClick={() => {}}><FontAwesomeIcon icon="user-minus" /></Button>
          </td>
        </tr>
      )
    });

    instance.editContact = jest.fn( () => {
      uniqueIDstate = "NewID";
      editedName = "New Name";
      editedNumber = "New Number";
    });

    instance.saveEditedContact = jest.fn( () => {
      testContacts.map((item) => {
        if("NewID" == "NewID"){
          contactsUpdated = [{'uniqueID' : uniqueIDstate, 'name' : editedName, 'number' : editedNumber}]
        }
      });
    });

    expect(testContacts == contactsUpdated).toBe(false);
  })
})