import React from 'react';
import PropTypes from 'prop-types';

function LayoutCard({
  children
}) {
  return (
    <div className="flex-auto m-2 p-3 shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
      {children}
    </div>
  );
}

LayoutCard.propTypes = {
  children: PropTypes.node.isRequired
};

export default LayoutCard;
