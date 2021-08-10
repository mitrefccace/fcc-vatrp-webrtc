import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';
import CallVideos from '../components/CallPageComponents/CallVideos'
import JssipService from '../services/JssipService';


describe("", ()=>{

  let wrapper: ShallowWrapper;
  let fakeJssipService;

  beforeEach(()=>{

    fakeJssipService = {
      selfVideoRef: {current: {srcObject: "whaddup"}},
      remoteVideoRef: {current: {srcObject: "yo yo yo"}}
    };
    
    wrapper = shallow(<CallVideos 
      jssipService={fakeJssipService as unknown as JssipService}
      toggleExpanded={jest.fn()}/>)
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test("test that expand button calls jssip functionality", () => {
    wrapper.find("#expandVideo").simulate("click", ()=>{
      //@ts-ignore
      expect(wrapper.props.toggleExpanded).toBeCalled();
    })
  });

});