import React from 'react';
import {Button, Form, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {ContactModel} from './Contacts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type ContactRowProps = {
  contact: ContactModel,
  callContact: Function,
  editContact: Function,
  deleteContact: Function
}

type ContactRowState = {
  selectedIndex: string
}


class ContactRow extends React.Component<ContactRowProps, ContactRowState> {
  constructor(props: ContactRowProps ) {
    super(props);
    let defaultIndex = 0;
    for(let i = 0; i < props.contact.numbers.length; i++){
      if(props.contact.numbers[i].default){
        defaultIndex = i;
        break;
      }
    }
    this.state = {
      selectedIndex: String(defaultIndex)
    };

    this.onSelectedNumberChange = this.onSelectedNumberChange.bind(this);
    this.getSelectedNumber = this.getSelectedNumber.bind(this);
  }

  onSelectedNumberChange(event: React.FormEvent<HTMLSelectElement>) {
    this.setState({selectedIndex: event.currentTarget.value})
  }

  getSelectedNumber(): string {
    let index = parseInt(this.state.selectedIndex);
    return this.props.contact.numbers[index].number;
  }

  render() {
    return(
      <tr key={this.props.contact.uniqueID}>
        <td>{this.props.contact.name}</td>
        <td>
          <Form.Control as="select" value={this.state.selectedIndex} onChange={this.onSelectedNumberChange}>
              {
              this.props.contact.numbers.map((numberInfo, index) => {
                  return (<option key={index} value={index}>{numberInfo.number} ({numberInfo.type})</option>)
              })
            }
          </Form.Control>
        </td>
        <td>
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip id={'calltooltip' + this.props.contact.uniqueID}>
                Call Contact
              </Tooltip>
            }>
            <Button variant="success" 
              id="callContact" 
              className="m-1" 
              aria-label="Call Contact"
              onClick={() => this.props.callContact(this.getSelectedNumber())}><FontAwesomeIcon icon="phone" /> 
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip id={'edittooltip' + this.props.contact.uniqueID}>
                Edit Contact
              </Tooltip>
            }>
            <Button variant="info" 
              id="editContact" 
              className="m-1" 
              aria-label="Edit Contact"
              onClick={() => this.props.editContact(this.props.contact.uniqueID, this.props.contact.name, this.getSelectedNumber())}><FontAwesomeIcon icon="edit" /> 
            </Button> 
          </OverlayTrigger>
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip id={'deletetooltip' + this.props.contact.uniqueID}>
                Delete Contact
              </Tooltip>
            }>
            <Button variant="danger" 
              id="removeContact" 
              className="m-1" 
              aria-label="Delete Contact"
              onClick={() => this.props.deleteContact(this.props.contact.uniqueID)}><FontAwesomeIcon icon="user-minus" /> </Button>
          </OverlayTrigger>
        </td>
      </tr>
    )
  }
}

export default ContactRow;