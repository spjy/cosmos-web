import React, { useState } from 'react';
import { Link } from '@reach/router';
import { Menu, Icon } from 'antd';

import routes from '../../routes';

function Navbar() {
  const [currentRoute] = useState('home');
  return (
    <Menu
      mode="horizontal"
      selectedKeys={[currentRoute]}
    >
      {
        routes.map((route) => {
          if (route.children) {
            return (
              <Menu.SubMenu
                title={(
                  <span>
                    {
                      route.icon ? <Icon type={route.icon} /> : null
                    }
                    {route.name}
                  </span>
                )}
                key={route.name}
                className={route.rightAlign ? 'float-right' : null}
              >
                <Menu.ItemGroup
                  title="Routes"
                >
                  {
                    route.children.map(child => (
                      <Menu.Item
                        key={child.name}
                      >
                        <Link
                          to={`/${route.path.split('/')[1]}${child.path}`}
                        >
                          {
                            child.icon ? <Icon type={child.icon} /> : null
                          }
                          {child.name}
                        </Link>
                      </Menu.Item>
                    ))
                  }
                </Menu.ItemGroup>
              </Menu.SubMenu>
            );
          }

          return (
            <Menu.Item
              key={route.name}
              className={route.rightAlign ? 'float-right' : null}
            >
              <Link to={route.path}>
                <Icon type={route.icon} />
                {route.name}
              </Link>
            </Menu.Item>
          );
        })
      }
      {/* <Menu.SubMenu
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
      </Menu.SubMenu> */}
    </Menu>
  );
}

export default Navbar;
