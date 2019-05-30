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
  /** The type of live view, e.g. orbit or attitude. */
  type: PropTypes.string.isRequired,
  /** The satellite that is being viewed. */
  satellite: PropTypes.string.isRequired
};

export default Live;
