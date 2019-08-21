import React from 'react';
import { shallow } from 'enzyme';
import Home from '../src/pages/Home';

describe('Home page', () => {
  it('renders', () => {
    shallow(<Home />);
  });

  it('displays the logo', () => {
    const wrapper = shallow(<Home />);

    expect(wrapper.find('img').getElements()).toHaveLength(1);
  });

  it('displays COSMOS Web', () => {
    const wrapper = shallow(<Home />);

    expect(wrapper.contains('COSMOS Web')).toBe(true);
  });

  it('has three information cards', () => {
    const wrapper = shallow(<Home />);

    expect(wrapper.find('Card').getElements()).toHaveLength(3);
  });
});
