import React from 'react';
import PropTypes from 'prop-types';

/**
 * A wrapper for each component.
 */
function LayoutCard({
  flex,
  children,
}) {
  return (
    <div className={`${flex} p-3 shadow overflow-x-auto component-color`}>
      {children}
    </div>
  );
}

LayoutCard.propTypes = {
  /** Specify if using flexbox */
  flex: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default LayoutCard;
