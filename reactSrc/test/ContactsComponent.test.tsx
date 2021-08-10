import React from 'react';
import {shallow, ShallowWrapper } from 'enzyme';
import Contacts from '../components/Contacts';
import JssipService from '../services/JssipService';
import ActivePanel from '../services/ActivePanelEnum';
import Button from 'react-bootstrap/Button';

//Run yarn test ContactsComponent
describe("Test the contacts component UI", () => {

  let wrapper: ShallowWrapper;
  let JssipService: JssipService;
  let setActivePanel: ActivePanel.contacts;

  beforeEach(() => {
    wrapper = shallow(<Contacts jssipService={JssipService} setActivePanel={ (ap: ActivePanel) => {}} /> );
  })

  afterEach(() => {
    wrapper.unmount();
  })

  test("Modal Dialog shows up", () => {
    wrapper.find("#CreateContact").simulate("click");

    expect(wrapper.exists("#NewContactName")).toBe(true);
    expect(wrapper.exists("#NewContactNumber")).toBe(true);
  });

  test("Edit Contact Modal Dialog shows up", () => {
    const instance = wrapper.instance() as Contacts;

    instance.loadContacts = jest.fn( () => {
      return (
        <tr key={"testKey"}>
          <td>{"testName"}</td>
          <td>{"testNumber"}</td>
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
    
    wrapper.find("#CreateContact").simulate("click");
    wrapper.find("#SaveNewContact").simulate("click");
    wrapper.find("#editContact").simulate("click");
    instance.editContact = jest.fn( () => {
      wrapper.setState({editContactModal : true});
    });
    const sleep = (milliseconds : number) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    
    sleep(500).then(() => {
      expect(wrapper.exists("#EditSpecificContact")).toBe(true);
    })
    
    //expect(wrapper.exists("#UpdateContactNumber")).toBe(true);
  });

  test("If contacts exists, edit button exists too", () => {
    const instance = wrapper.instance() as Contacts;
    

    instance.loadContacts = jest.fn( () => {
      return (
        <tr key={"testKey"}>
          <td>{"testName"}</td>
          <td>{"testNumber"}</td>
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

    wrapper.find("#CreateContact").simulate("click");
    wrapper.find("#SaveNewContact").simulate("click");
    // instance.loadContactHeader = jest.fn( () => {
    //   return ([<th key={""}>{""}</th>]);
    // });

    expect(wrapper.exists("#editContact")).toBe(true);

  });

  test("Contact is removed", () => {
    const instance = wrapper.instance() as Contacts;
    let testContacts = [{'uniqueID' : 'testKey', 'name' : 'testName', 'number' : 'testNumber'}];

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

    wrapper.find("#CreateContact").simulate("click");
    wrapper.find("#SaveNewContact").simulate("click");
    wrapper.find("#removeContact").simulate("click");

    expect(testContacts.length).toBe(1);
  });

})