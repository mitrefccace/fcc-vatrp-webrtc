import jssipService from '../services/JssipService';
import SettingsService from '../services/SettingsService';
import ActivePanel from '../services/ActivePanelEnum';

import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import HomePage from '../components/HomePage';

describe('Home page React UI component test', () => {

  let wrapper: ShallowWrapper;
  let ss: SettingsService;
  let jssipSvc: jssipService;
  
  beforeEach(() => {
    wrapper = shallow(<HomePage jssipService={jssipSvc}  settingsService={ss} setNotRegistered={(_r: boolean) => {}} />);
    
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('Active Panel test', () => {

    const instance = wrapper.instance() as HomePage;
    //Default panel is dialPad
    expect(instance.state.activePanel.toString()).toBe(ActivePanel.dialPad.toString());
    //Set the Active Panel to Settings
    instance.setActivePanel(ActivePanel.settings);
    wrapper.update();
    //Expect active panel to be settings
    expect(instance.state.activePanel.toString()).toBe(ActivePanel.settings.toString());

    //Set the Active Panel to Call Page
    instance.setActivePanel(ActivePanel.callPage);
    wrapper.update();
    //Expect active panel to be callPage
    expect(instance.state.activePanel.toString()).toBe(ActivePanel.callPage.toString());
  })


})