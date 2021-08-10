import React from 'react';
import {shallow, ShallowWrapper } from 'enzyme';
import Dialpad from '../components/DialPad';
import ActivePanel from '../services/ActivePanelEnum';
import Settings from '../services/SettingsService';
import JssipService from '../services/JssipService';

//Run yarn test DialpadComponent
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

  test("Input filled with number clicked", () => {
    const instance = wrapper.instance() as Dialpad;
    let tempLength = wrapper.find('#NumberInputBox').length;
    wrapper.find('#dialpad1').simulate("click", () => {
      expect(wrapper.find("#NumberInputBox").length).toEqual(tempLength + 1);
    })
  });

  test("Back button edits input", () => {
    let tempLength = wrapper.find('#NumberInputBox').length;
    wrapper.find('#BackspaceButton').simulate("click", () => {
      expect(wrapper.find("#NumberInputBox").length).toEqual(tempLength - 1);
    })
  })
});