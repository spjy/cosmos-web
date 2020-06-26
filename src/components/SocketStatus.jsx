import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';

function SocketStatus({
  status,
}) {
  return (
    <Typography.Text type="secondary">
      {
        status === 'success'
          ? (
            <span>
              <CheckCircleTwoTone twoToneColor="#52c41a" />
              &nbsp;Connected.
            </span>
          )
          : (
            <span>
              <CloseCircleTwoTone twoToneColor="#d80000" />
              &nbsp;&nbsp;Not connected. Attempting to reconnect.
            </span>
          )
      }
    </Typography.Text>
  );
}

SocketStatus.propTypes = {
  status: PropTypes.string.isRequired,
};

export default SocketStatus;
