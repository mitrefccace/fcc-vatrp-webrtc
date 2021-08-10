import React from 'react';
import { mount } from 'enzyme';
import LoginPage from '../components/LoginPage';

describe('Sign In page React UI component test', () => {
  it('renders without crashing', () => {
    mount(<LoginPage />);
  });

})
