import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

const Live = ({ type, satellite }) => (
  <div style={{ padding: '1em' }}>
    <Alert
      message="Live"
      type="success"
      description={(
        <div>
          You are viewing the live&nbsp;
          {type}
          &nbsp;of&nbsp;
          <strong>{satellite}</strong>
          .
        </div>
      )}
      showIcon
    />
  </div>
);

Live.propTypes = {
  type: PropTypes.string.isRequired,
  satellite: PropTypes.string.isRequired
};

export default Live;
