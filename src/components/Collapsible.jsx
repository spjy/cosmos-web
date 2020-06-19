import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

function Collapsible({
  title,
  actions,
  children,
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="w-full">
      <div
        className="flex flex-row bg-gray-100 p-3 border-gray-200 border cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
        role="button"
        tabIndex={0}
        onKeyDown={() => {}}
      >
        <div className="mr-3">
          {
            collapsed ? <RightOutlined /> : <DownOutlined />
          }
        </div>
        <div>
          {title}
        </div>
        <div className="ml-auto">
          { actions }
        </div>
      </div>
      <div
        className={`border-gray-200 border p-5 ${collapsed ? 'hidden' : ''}`}
      >
        { children }
      </div>
    </div>
  );
}

Collapsible.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node,
};

Collapsible.defaultProps = {
  title: '',
  actions: null,
  children: null,
};

export default Collapsible;
