import React from 'react';
import {InputGroup, FormControl, Form, Col, Button} from 'react-bootstrap';
import {ContactTel} from '../../Contacts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './ContactEditNumberRow.css'
    //<Form.Row>
      //<Col xs={6}>

export default function ContactEditNumberRow(props: {contactTel: ContactTel, index: number, saveContact: Function, editNumberChange: Function, defaultSelected: Function, removeNewContactNumber: Function}) {

  return(
    <Form.Row className="numberRow">
      <Col>
        <InputGroup>
          <InputGroup.Prepend id="NewContactNumber">
            <InputGroup.Text>Number</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl 
            onChange={(e : React.ChangeEvent<HTMLInputElement>) => { 
              props.editNumberChange({number: e.target.value, type: props.contactTel.type, default: props.contactTel.default}, props.index); 
            }}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => { 
              if (e.key === 'Enter' || e.key === 'Returned') {
              e.preventDefault();
              props.saveContact();
              }
            }}
            value={props.contactTel.number}
            aria-label="Enter contact phone number"></FormControl>
        </InputGroup>
      </Col>
      <Col md="auto">
        <Form.Control as="select" value={props.contactTel.type} 
        onChange={(e : React.FormEvent<HTMLSelectElement>) => {
          props.editNumberChange({number: props.contactTel.number, type: e.currentTarget.value,  default: props.contactTel.default}, props.index); 
        }}>
          <option value="Cell">Cell</option>
          <option value="Home">Home</option>
          <option value="Work">Work</option>
        </Form.Control>

      </Col>
      <Col>
        <Button variant="danger" onClick={() => props.removeNewContactNumber(props.contactTel)}><FontAwesomeIcon icon="minus-circle" /></Button>
      </Col>
      <Col md="auto">
        <Form.Check type="radio" name="default" label="Default" className="defaultCheckbox" checked={props.contactTel.default} disabled={props.contactTel.number.length === 0}
          onChange={(e : React.ChangeEvent<HTMLInputElement>) => props.defaultSelected(e, props.index)}>
        </Form.Check>
      </Col>
    </Form.Row>
  )
}