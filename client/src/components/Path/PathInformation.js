import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const columns = [{
  title: 'Satellite',
  dataIndex: 'satellite',
  key: 'satellite',
  width: '16%'
}, {
  title: 'Latitude',
  dataIndex: 'latitude',
  key: 'latitude',
  width: '42%'
}, {
  title: 'Longitude',
  dataIndex: 'longitude',
  key: 'longitude',
  width: '42%'
}, {
}];

class OrbitInformation extends Component {
  render() {
    const { satellite, latitude, longitude } = this.props;

    const data = [{
      key: '1',
      satellite: satellite,
      latitude: latitude,
      longitude: longitude,
    }];

    return (
      <div style={{ padding: '1em' }}>
        <Table columns={columns} dataSource={data} size="small" pagination={false} />
      </div>
    );
  }
}

OrbitInformation.propTypes = {
  satellite: PropTypes.string,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  z: PropTypes.number
}

export default OrbitInformation;
