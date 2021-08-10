import jssipService from '../services/JssipService';
import SettingsService from '../services/SettingsService';

import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import LoginPage from '../components/LoginPage';

describe('Login page React UI component test', () => {

  let wrapper: ShallowWrapper;
  let ss: SettingsService;

  beforeEach(() => {
    wrapper = shallow(<LoginPage setJssipService={(_s: jssipService) => {}} 
    setIsRegistered={(_r: boolean) => {}} settingsService={ss}  />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('Phone number input field test', () => {
    wrapper.find('#phone-number-input').simulate('change', { target: { name: 'phoneNumber', value: '7132451234' } });
    expect(wrapper.state('phoneNumber')).toEqual('7132451234');
  })

  test('Server input field test', () => {
    wrapper.find('[type="text"]').simulate('change', { target: { name: 'customServer', value: '123' } });
    expect(wrapper.state('customServer')).toEqual('123');
  })

  test('Password input field test', () => {
    wrapper.find('#password-input').simulate('change', { target: { name: 'password', value: '123' } });
    expect(wrapper.state('password')).toEqual('123');
  })

  test('Login click test', async () => {

    wrapper.find('#phone-number-input').simulate('change', { target: { name: 'phoneNumber', value: '7032935030' } });
    wrapper.find('[type="text"]').simulate('change', { target: { name: 'customServer', value: 'ntlqasip2.task3acrdemo.com' } });
    wrapper.find('#password-input').simulate('change', { target: { name: 'password', value: '1qaz1qaz' } });

    console.log('PHONE NUMBER: ' + wrapper.state('phoneNumber'));
    console.log('SERVER: ' + wrapper.state('customServer'));
   
    let submitted = false;

    //Confirm that the login form is being submitted. 
    //Mock event handling - sets the 'submitted' variable flag to true
    wrapper.find('#login-form').simulate('submit', {
      preventDefault: () => { 
        submitted = true;
      }
    });
    expect(submitted).toBe( true);

  })

  // test('Config file upload test', () => {

  //   const m = shallow(<LoginPage setJssipService={(_s: jssipService) => {}} 
  //   setIsRegistered={(_r: boolean) => {}} settingsService={ss}  />);

  //   const instance = m.instance() as LoginPage;
  //   instance.handleConfigFile = jest.fn();

  //   const fileContents       = 'file contents';
  //   const file = new Blob([fileContents], {type : 'text/plain'});
    
  //   //const addEventListener   = jest.fn((_, evtHandler) => { evtHandler(); })

  //   // m.find('[type="file"]').at(0).simulate('change', {target: {files: [fileObj]}})    
  //   m.find('#config-file-input').simulate('change', {
  //       preventDefault() { },
  //       target: {files: 'hello'},
        
  //     });        

  //   expect(instance.handleConfigFile).toHaveBeenCalled();
  //   m.unmount();

  // });

})