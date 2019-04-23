import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';

class Navbar extends Component {
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
<<<<<<< HEAD:client/src/components/Global/Navbar.jsx
          title={(
            <span>
              <Icon type="rocket" />
              Satellite
            </span>
          )}
=======
          title={<span><Icon type="rocket" />Satellite</span>}
>>>>>>> master:client/src/components/Global/Navbar.js
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
            <Menu.Item
              key="plot"
            >
              <Link
                to="/plot"
              >
                <Icon type="line-chart" />
                Plot
              </Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.SubMenu>
        <Menu.SubMenu
<<<<<<< HEAD:client/src/components/Global/Navbar.jsx
          title={(
            <span>
              <Icon type="cloud" />
              Balloon
            </span>
          )}
        >
=======
          title={<span><Icon type="cloud" />Balloon</span>}>
>>>>>>> master:client/src/components/Global/Navbar.js
          <Menu.ItemGroup
            title="Applications"
          >
            <Menu.Item
              key="path"
            >
              <Link
                to="/path"
              >
                <Icon type="rollback" />
                Path
              </Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.SubMenu>
<<<<<<< HEAD:client/src/components/Global/Navbar.jsx
        <Menu.Item key="tools">
          <Link to="/cosmostools">
            <Icon type="tool" />
            Tools
          </Link>
        </Menu.Item>

=======
        <Menu.SubMenu
          title={<span><Icon type="tool" />Cosmos Tools</span>}>
          <Menu.ItemGroup
            title="Applications">
            <Menu.Item key="cosmostools">
                <Link to="/cosmostools">
                  <Icon type="tool" />Tools
                </Link>
            </Menu.Item>
            <Menu.Item key="cosmostoolspage">
                <Link to="/cosmostoolspage">
                  <Icon type="tool" />New Widgets
                </Link>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu.SubMenu>
>>>>>>> master:client/src/components/Global/Navbar.js
      </Menu>
    );
  }
}

Navbar.propTypes = {
  current: PropTypes.string
};

export default Navbar;
