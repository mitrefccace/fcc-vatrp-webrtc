import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';
import IncomingCallModal from '../components/IncomingCallModal';
import JssipService from '../services/JssipService';
import ActivePanel from '../services/ActivePanelEnum';

describe("Test the Incoming Call modal", () => {
  let wrapper : ShallowWrapper;
  let jssipService : JssipService;
  let hideModal : Function;

  beforeEach(() => {
    //@ts-ignore
    let fakeJssipService : JssipService = {phoneNumber : '1234', setActivePanel : jest.fn(), terminateCall : jest.fn()};
    wrapper = shallow(<IncomingCallModal jssipService={fakeJssipService} hideModal={hideModal} setActivePanel={(ap : ActivePanel) => {}}/>)
    
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test("Phone number display is correct", () => {
    expect(wrapper.exists('#CallerIDNumber')).toBe(true);
    const callerID = wrapper.find('#CallerIDNumber');
    expect(callerID.text()).toBe('1234');
  });

  test("Modal buttons do exist", () => {
    expect(wrapper.exists('#acceptCall')).toBe(true);
    expect(wrapper.exists('#rejectCall')).toBe(true);
  })
});