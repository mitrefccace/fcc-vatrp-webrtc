import React from 'react';
import {register_jssip} from '../services/vatrp_jssip';
import {shallow, ShallowWrapper} from 'enzyme';
import SideBar from '../components/SideBar';
import JssipService from '../services/JssipService';
import Settings from '../services/SettingsService';
import ActivePanel from '../services/ActivePanelEnum';
let session: JsSIP.RTCSession;
let ua: JsSIP.UA;
function setUa(p: JsSIP.UA) {
  ua = p;
}

describe("Test the CallPage component UI", () => {
  let wrapper : ShallowWrapper;
  let JssipService: JssipService;
  let setActivePanel: Function;
  let setNotRegistered : Function;
  let activePanel : ActivePanel.callPage;

  beforeEach(() => {
    wrapper = shallow(<SideBar jssipService={JssipService} setNotRegistered={setNotRegistered} setActivePanel={setActivePanel} activePanel={activePanel}/>)
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test("Make sure user is signed out from signout button", () => {
    const instance = wrapper.instance() as SideBar;
    instance.signOut = jest.fn(() => {

    })

    wrapper.find('#Signout').simulate('click', () => {
      expect(instance.signOut).toBeCalled;
    })
  });

});