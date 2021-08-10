import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';
import CallButtons from '../components/CallPageComponents/CallButtons'
import JssipService from '../services/JssipService';

//Run yarn test CallPageFeature
describe("Test the CallPage component features", () => {
  let wrapper : ShallowWrapper;
  let fakeJssipService: {
    pauseCall: jest.Mock<any,any>,
    unpauseCall: jest.Mock<any,any>
    terminateCall: jest.Mock<any,any>
    muteCall: jest.Mock<any,any>
    unmuteCall: jest.Mock<any,any>
    enableVideoPrivacy: jest.Mock<any,any>
    disableVideoPrivacy: jest.Mock<any,any>
  };

  beforeEach(() => {
    fakeJssipService = {
      pauseCall: jest.fn(),
      unpauseCall: jest.fn(),
      terminateCall: jest.fn(),
      muteCall:  jest.fn(),
      unmuteCall: jest.fn(),
      enableVideoPrivacy: jest.fn(),
      disableVideoPrivacy: jest.fn(),
    };

    wrapper = shallow(
    <CallButtons 
      jssipService={fakeJssipService as unknown as JssipService}
      />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test("Ensure pauseCall() and unpauseCall() are being called on Video privacy", () => {
    // click video privacy once, expect pauseCall to have been called
    wrapper.find('#call-pause-button').simulate('click', () => {
      expect(fakeJssipService.pauseCall).toBeCalled();
    });
    

    // click video privacy again, expect unpauseCall to have been called
    wrapper.find('#call-pause-button').simulate('click', () =>{
      expect(fakeJssipService.unpauseCall).toBeCalled();
    });
  });

  test("Ensure the terminate call button is calling the correct function in jssip service", () => {
    wrapper.find('#terminate-call-button').simulate('click', ()=>{
      expect(fakeJssipService.terminateCall).toBeCalled();
    });
  });

  test("Ensure audio mute button calls jssip mute functions", ()=>{
    wrapper.find('#audio-mute-button').simulate('click', ()=>{
      expect(wrapper.exists(".fa fa-microphone-slash fa-3x")).toBe(true);
      expect(fakeJssipService.muteCall).toBeCalled();
    });

    wrapper.find('#audio-mute-button').simulate('click', ()=>{
      expect(fakeJssipService.unmuteCall).toBeCalled();
    });
  });

  test("Ensure video privacy button calls jssip video privacy functions", ()=>{
    wrapper.find('#video-privacy-button').simulate('click', ()=>{
      expect(fakeJssipService.enableVideoPrivacy).toBeCalled();
      expect(wrapper.exists(".fas fa-video fa-3x")).toBe(true);
    });

    wrapper.find('#video-privacy-button').simulate('click', ()=>{
      expect(fakeJssipService.disableVideoPrivacy).toBeCalled();
    });
  });

  test("Ensure chat visible state", ()=>{
    wrapper.find('#show-chat-button').simulate('click', ()=>{
      //@ts-ignore
      expect(wrapper.state.isChatVisible).toBeTruthy()
    })
  })


});