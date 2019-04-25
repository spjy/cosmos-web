import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const columns = [
  {
    title: 'Acceleration (kmph²)',
    dataIndex: 'acceleration',
    key: 'acceleration',
    width: '50%'
  },
  {
    title: 'Altitude (m)',
    dataIndex: 'altitude',
    key: 'altitude',
    width: '50%'
  }
];

const BalloonInformation = ({ acceleration, altitude }) => (
  <div
    style={{ padding: '1em' }}
  >
    <Table
      columns={columns}
      dataSource={[
        {
          key: '1',
          acceleration: `${acceleration[0]}, ${acceleration[1]}, ${acceleration[2]}`,
          altitude
        }
      ]}
      size="small"
      pagination={false}
    />
  </div>
);

BalloonInformation.propTypes = {
  acceleration: PropTypes.arrayOf.isRequired,
  altitude: PropTypes.number.isRequired
};

export default BalloonInformation;
