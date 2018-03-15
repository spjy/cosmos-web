import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';

class LiveOrbit extends Component {
  state = {
    current: 'home'
  }

  handleClick = (e) => {
    this.setState({
      current: e.key,
    });
  }

  render() {
    return (
      <Menu
        onClick={this.handleClick}
        selectedKeys={[this.state.current]}
        mode="horizontal"
      >
        <Menu.Item key="home">
          <Icon type="home" />COSMOS Web
        </Menu.Item>
        <Menu.Item key="orbit">
          <Icon type="sync" />Orbit
        </Menu.Item>
        <Menu.Item key="attitude">
          <Icon type="swap-right" />Attitude
        </Menu.Item>
        <Menu.Item key="plot">
          <Icon type="line-chart" />Plot
        </Menu.Item>
      </Menu>
    );
  }
}

LiveOrbit.propTypes = {
  satellite: PropTypes.string
}

export default LiveOrbit;
