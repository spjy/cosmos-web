import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { RightOutlined } from '@ant-design/icons';

function Collapsible({
  title,
  actions,
  children,
}) {
  const [collapsed, setCollapsed] = useState(true);

  const contentRef = useRef(null);

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
          <RightOutlined rotate={collapsed ? 0 : 90} />
        </div>
        <div>
          {title}
        </div>
        <div
          className="ml-auto"
          role="button"
          tabIndex={0}
          onKeyDown={() => {}}
        >
          { actions }
        </div>
      </div>
      <div
        className="border-gray-200 border-l border-r border-b transition-all duration-300 ease-in-out overflow-hidden show"
        style={{
          maxHeight: `${contentRef.current && contentRef.current.scrollHeight && !collapsed ? `${contentRef.current.scrollHeight}px` : 0}`,
        }}
        ref={contentRef}
      >
        <div className="p-5">
          { children }
        </div>
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
