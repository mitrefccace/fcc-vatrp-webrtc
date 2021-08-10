import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import VATRP from '../Vatrp';

describe("User alert tests", () => {
  let wrapper: ShallowWrapper;

  beforeEach(() => {
    wrapper = shallow(<VATRP></VATRP>)
  });

  afterEach(()=>{
    wrapper.unmount();
  })

  test('No toast alerts displayed at the beginning of the application', ()=>{
    // toast-holder should not be rendered at the beginning of the application
    expect(wrapper.find("#toast-holder").length).toBe(0);

    //There also shouldn't be any toast-alerts
    expect(wrapper.find(".toast-alert").length).toBe(0);
  })

  test('A display alert is created and displayed', ()=>{
    const instance = wrapper.instance() as VATRP;

    // add a toast alert
    instance.displayUserMessage("Error", "title", "message body");

    // ensure toast-holder appears
    expect(wrapper.find("#toast-holder").length).toBe(1);

    // ensure there's also a toast-alert in it
    expect(wrapper.find(".toast-alert").length).toBe(1);

    // ensure the text of the alert is present and what we wanted it to be
    expect(wrapper.find(".alert-indicator").text()).toBe("❌");
    expect(wrapper.find(".alert-title").text()).toBe("title");
    expect(wrapper.find(".alert-message-body").text()).toBe("message body");
  });

  // test('A display alerts can be deleted', () =>{
  //   const instance = wrapper.instance() as VATRP;

  //   // add a toast alert
  //   instance.displayUserMessage("Error", "title", "message body");

  //   // ensure toast-holder appears
  //   expect(wrapper.find("#toast-holder").length).toBe(1);

  //   // ensure there's also a toast-alert in it
  //   expect(wrapper.find(".toast-alert").length).toBe(1);

  //   // simulate clicking on the close button
  //   wrapper.find(".close").simulate("click");

  //   // ensure toast-holder appears
  //   expect(wrapper.find("#toast-holder").length).toBe(0);

  //   // ensure there's also a toast-alert in it
  //   expect(wrapper.find(".toast-alert").length).toBe(0);

  // });

  
})