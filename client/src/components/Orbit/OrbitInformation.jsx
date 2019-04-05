import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const columns = [
  {
    title: 'Satellite',
    dataIndex: 'satellite',
    key: 'satellite',
    width: '16%'
  },
  {
    title: 'x',
    dataIndex: 'x',
    key: 'x',
    width: '28%'
  },
  {
    title: 'y',
    dataIndex: 'y',
    key: 'y',
    width: '28%'
  },
  {
    title: 'z',
    dataIndex: 'z',
    key: 'z'
  }
];

const OrbitInformation = ({
  satellite, x, y, z
}) => (
  <div style={{ padding: '1em' }}>
    <Table
      columns={columns}
      dataSource={[
        {
          key: '1',
          satellite,
          x,
          y,
          z
        }
      ]}
      size="small"
      pagination={false}
    />
  </div>
);

OrbitInformation.propTypes = {
  satellite: PropTypes.string.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  z: PropTypes.number.isRequired
};

export default OrbitInformation;
