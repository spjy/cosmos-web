import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';

class Navbar extends Component {
  static propTypes = {
    /** Currently selected navigation bar item. */
    current: PropTypes.string.isRequired
  };

  // handleClick = (e) => {
  //   this.setState({
  //     current: e.key,
  //   });
  // }

  render() {
    return (
      <Menu
        onClick={this.handleClick}
        selectedKeys={[this.props.current]}
        mode="horizontal"
      >
        <Menu.Item key="home">
          <Link to="/">
            <Icon type="global" />
            COSMOS Web
          </Link>
        </Menu.Item>
        <Menu.SubMenu
          title={(
            <span>
              <Icon type="rocket" />
              Satellite
            </span>
          )}
        >
          <Menu.ItemGroup
            title="Applications"
          >
            <Menu.Item
              key="orbit"
            >
              <Link
                to="/orbit"
              >
                <Icon type="sync" />
                Orbit
              </Link>
            </Menu.Item>
            <Menu.Item
              key="attitude"
            >
              <Link
                to="/attitude"
              >
                <Icon type="swap-right" />
                Attitude
              </Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.SubMenu>
        <Menu.SubMenu
          title={(
            <span>
              <Icon type="rocket" />
              &nbsp;Missions
            </span>
          )}
        >
          <Menu.ItemGroup
            title="Applications"
          >
            <Menu.Item key="neutron1">
              <Link to="/missions/neutron1">
                <Icon type="heat-map" />
                &nbsp;neutron1
              </Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

export default Navbar;
