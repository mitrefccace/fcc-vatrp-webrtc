import React from 'react';
import {shallow, ShallowWrapper } from 'enzyme';
import Dialpad from '../components/DialPad';
import ActivePanel from '../services/ActivePanelEnum';
import Settings from '../services/SettingsService';
import JssipService from '../services/JssipService';

describe("Test the Dialpad component UI", () => {
  let wrapper : ShallowWrapper;
  let JssipService: JssipService;
  let setactivepanel: Function;
  let settings: Settings;

  beforeEach(() => {
    wrapper = shallow(<Dialpad jssipService={JssipService} setActivePanel={setactivepanel} settingsService={settings}/>);
  })
  
  afterEach(() => {
    wrapper.unmount();
  })

  test("Phone number state is updated with button click", () => {
    wrapper.find('#dialpad1').simulate("click", () => {
      expect(wrapper.state('phoneNumber')).toEqual("1");
    })
  });

  test("Phone number state is decreased", () => {
    wrapper.find("#dialpad1").simulate("click");
    wrapper.find('#BackspaceButton').simulate("click", () => {
      expect(wrapper.state).toEqual("");
    })
  });
});