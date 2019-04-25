import React from 'react';
import { expect } from 'chai';
import { shallow, mount, render } from 'enzyme';
import Live from '../src/components/Global/Live.js';

describe('<Live />', () => {

  const props = {
    type: 'orbit',
    satellite: 'cubesat1',
  }

  const wrapper = shallow(<Live type="orbit" satellite="cubesat1" />);

  it('renders <Live />', () => {
    expect(wrapper.exists()).to.equal(true);
  });

  it('receives the correct props', () => {    
    expect(wrapper.props().type).to.equal('orbit');
  });

  it('displays the correct satellite');
});
