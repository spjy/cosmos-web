import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

const Live = ({ type, satellite }) => {
  return (
    <Alert message="Live" type="success" description={
      <div>
        You are viewing the live {type} of <strong>{satellite}</strong>.
      </div>
    } showIcon />
  );
};

Live.propTypes = {
  type: PropTypes.string,
  satellite: PropTypes.string
};

export default Live;