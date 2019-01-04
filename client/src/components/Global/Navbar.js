import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types';

import { Menu, Icon } from 'antd';

class Navbar extends Component {
  state = {
    current: this.props.current
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
            <Icon type="global" />COSMOS Web
          </Link>
        </Menu.Item>
        <Menu.SubMenu title={<span><Icon type="rocket" />Satellite</span>}>
          <Menu.ItemGroup title="Applications">
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
          </Menu.ItemGroup>
        </Menu.SubMenu>
        <Menu.SubMenu title={<span><Icon type="cloud" />Balloon</span>}>
          <Menu.ItemGroup title="Applications">
            <Menu.Item key="path">
              <Link to="/path">
                <Icon type="rollback" />Path
              </Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.SubMenu>
        <Menu.SubMenu title={<span><Icon type="tool" />Tools</span>}>
          <Menu.Item key="dataplot">
            <Link to="/dataplot">
              <Icon type="line-chart" />Data Plot
            </Link>
          </Menu.Item>
          <Menu.Item key="COSMOS Agents">
            <Link to="/agentlist">
              <Icon type="bars" />Agent List
            </Link>
          </Menu.Item>
          <Menu.Item key="COSMOS Commands">
            <Link to="/commands">
              <Icon type="code" />COSMOS Commands
            </Link>
          </Menu.Item>
        </Menu.SubMenu>

      </Menu>
    );
  }
}

Navbar.propTypes = {
  current: PropTypes.string
}

export default Navbar;
