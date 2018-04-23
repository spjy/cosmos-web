import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

const Live = ({ type, satellite }) => {
  return (
    <div  style={{ padding: '1em' }}>
      <Alert
        message="Live"
        type="success"
        description={
          <div>
            You are viewing the live {type} of <strong>{satellite}</strong>.
          </div>
        }
        showIcon
      />
    </div>
  );
};

Live.propTypes = {
  type: PropTypes.string,
  satellite: PropTypes.string
};

export default Live;
