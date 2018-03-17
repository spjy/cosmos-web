import React from 'react';
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';
import Live from '../src/components/Global/Live.js';

describe('<Live />', () => {

  const props = {
    type: 'orbit',
    satellite: 'cubesat1',
  }

  it('renders <Live />', () => {
    const wrapper = shallow(<Live {...props} />);
  });

  it('displays the type of live feed correctly');
  it('displays the correct satellite');
});
