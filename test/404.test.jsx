import React from 'react';
import { shallow } from 'enzyme';
import FourOhFour from '../src/pages/404';

describe('Home page', () => {
  it('renders', () => {
    shallow(<FourOhFour />);
  });

  it('displays the image', () => {
    const wrapper = shallow(<FourOhFour />);

    expect(wrapper.find('img').getElements()).toHaveLength(1);
  });

  it('displays 404', () => {
    const wrapper = shallow(<FourOhFour />);

    expect(wrapper.contains('404.')).toBe(true);
  });
});
