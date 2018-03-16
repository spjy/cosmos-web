import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types';

import { Menu, Icon } from 'antd';

class Navbar extends Component {
  state = {
    current: ''
  }

  // handleClick = (e) => {
  //   this.setState({
  //     current: e.key,
  //   });
  // }

  render() {
    return (
      <Menu
        onClick={this.handleClick}
        selectedKeys={[this.state.current]}
        mode="horizontal"
      >
        <Menu.Item key="home">
          <Link to="/">
            <Icon type="home" />COSMOS Web
          </Link>
        </Menu.Item>
        <Menu.Item key="orbit">
          <Link to="/orbit">
            <Icon type="sync" />Orbit
          </Link>
        </Menu.Item>
        <Menu.Item key="attitude">
          <Link to="/attitude">
            <Icon type="swap-right" />Attitude
          </Link>
        </Menu.Item>
        <Menu.Item key="plot">
          <Link to="/plot">
            <Icon type="line-chart" />Plot
          </Link>
        </Menu.Item>
      </Menu>
    );
  }
}

Navbar.propTypes = {
  satellite: PropTypes.string
}

export default Navbar;
