import jssipService from '../services/JssipService';
import SettingsService from '../services/SettingsService';

import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import Settings from '../components/Settings';


describe('Settings page React UI component test', () => {

  let wrapper: ShallowWrapper;
  let ss: SettingsService;
  let jssipSvc: jssipService;
  
  beforeEach(() => {
    wrapper = shallow(<Settings jssipService={jssipSvc}  settingsService={ss} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test('Debug flag checkbox test', () => {
    wrapper.find('[type="checkbox"]').at(0).simulate('change', {target:{name: 'debug', checked:true}})
    console.log('debugchecked state: ' + wrapper.state('debugChecked'));
    wrapper.update();
    expect(wrapper.state('debugChecked')).toBe(true);    
  })

  test('Anonymous call setting checkbox test', () => {
    wrapper.find('[type="checkbox"]').at(1).simulate('change', {target:{name: 'anonymous', checked:true}})
    console.log('anonymouschecked state: ' + wrapper.state('anonymousChecked'));
    wrapper.update();
    expect(wrapper.state('anonymousChecked')).toBe(true);    
  })

})