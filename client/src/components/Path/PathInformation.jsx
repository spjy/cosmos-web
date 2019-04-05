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
    title: 'Latitude',
    dataIndex: 'latitude',
    key: 'latitude',
    width: '42%'
  },
  {
    title: 'Longitude',
    dataIndex: 'longitude',
    key: 'longitude',
    width: '42%'
  }
];

const OrbitInformation = ({ satellite, latitude, longitude }) => (
  <div style={{ padding: '1em' }}>
    <Table
      columns={columns}
      dataSource={[
        {
          key: '1',
          satellite,
          latitude,
          longitude
        }
      ]}
      size="small"
      pagination={false}
    />
  </div>
);

OrbitInformation.propTypes = {
  satellite: PropTypes.string.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired
};

export default OrbitInformation;
