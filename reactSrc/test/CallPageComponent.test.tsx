import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import CallPage from '../components/CallPage';
import JssipService from '../services/JssipService';

//Run yarn test CallPageComponent
describe("Test the CallPage component UI", () => {
  let wrapper : ShallowWrapper;

  beforeEach(() => {
    //@ts-ignore
    let setActivePanel = jest.fn();
    let displayUserMessage = jest.fn();
    let setExpandedCall = jest.fn();

    let fakeJssipService = {
      phoneNumber : '1234', 
      setActivePanel : jest.fn(), 
      terminateCall : jest.fn(),
      registerSessionFailedCallback: jest.fn(() => {setActivePanel()})
    };
    
    wrapper = shallow(
    <CallPage 
      jssipService={fakeJssipService as unknown as JssipService} 
      setActivePanel={setActivePanel}
      displayUserMessage={displayUserMessage}  
      setExpandedCall={setExpandedCall}
    />);
  });

  afterEach(() => {
    wrapper.unmount();
  })

  test('Make sure the mute button works', () => {
    wrapper.find("#muteSelf").simulate("click", () => {
      expect(wrapper.exists(".fa fa-microphone-slash fa-3x")).toBe(true);
    })
  });

  test("Make sure the video privacy works", () => {
    wrapper.find('#videoPrivacy').simulate("click", () => {
      expect(wrapper.exists(".fas fa-video fa-3x")).toBe(true);
    });
  });

  //TODO Functionality is not currently there but will need to be tested when ready
  test("Make sure screen expanding works", () => {

  });

  test("Make sure chat dropdown appears", () => {
    wrapper.find('#showChat').simulate("click", () => {
      expect(wrapper.exists('#chat-send')).toBe(true);
    });
  });
});