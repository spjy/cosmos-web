import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';

class Navbar extends Component {
  static propTypes = {
    /** Currently selected navigation bar item. */
    current: PropTypes.string.isRequired,
  };

  // handleClick = (e) => {
  //   this.setState({
  //     current: e.key,
  //   });
  // }

  /**
   * Ground Stations -> MASDIR
   * Move Missions nuetron1 to satellite
   * have modules
   * masdir gs 
   */

  render() {
    const { current } = this.props;

    return (
      <Menu
        onClick={this.handleClick}
        selectedKeys={[current]}
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
              <Icon type="box-plot" />
              Modules
            </span>
          )}
        >
          <Menu.ItemGroup>
            <Menu.Item
              key="Globe"
            >
              <Link
                to="/satellite/globe"
              >
                <Icon type="picture" />
                Globe
              </Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.SubMenu>
        <Menu.SubMenu
          title={(
            <span>
              <Icon type="rocket" />
              Satellites
            </span>
          )}
        >
          <Menu.ItemGroup
            title="Applications"
          >
            <Menu.Item
              key="neutron1"
            >
              <Link
                to="/satellite/neutron1"
              >
                <Icon type="heat-map" />
                neutron1
              </Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.SubMenu>
        <Menu.SubMenu
          title={(
            <span>
              <Icon type="wifi" />
              Ground Stations
            </span>
          )}
        >
          <Menu.ItemGroup
            title="Applications"
          >
            <Menu.Item key="MASDIR">
              <Link to="/gs/masdir">
                <Icon type="cloud" />
                MASDR
              </Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

export default Navbar;
