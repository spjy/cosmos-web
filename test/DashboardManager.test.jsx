import React from 'react';
import { mount } from 'enzyme';
import DashboardManager from '../src/pages/DashboardManager';

describe('Dashboard page', () => {
  it('renders', () => {
    mount(<DashboardManager />);
  });
});
