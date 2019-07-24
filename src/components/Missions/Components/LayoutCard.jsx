import React from 'react';
import PropTypes from 'prop-types';

function LayoutCard({
  flex,
  children
}) {
  return (
    <div className={`${flex} p-3 shadow overflow-x-auto`} style={{ backgroundColor: '#fbfbfb' }}>
      {children}
    </div>
  );
}

LayoutCard.propTypes = {
  flex: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};

export default LayoutCard;
