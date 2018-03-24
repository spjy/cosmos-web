import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const columns = [{
  title: 'Satellite',
  dataIndex: 'satellite',
  key: 'satellite',
  width: '15em'
}, {
  title: 'x',
  dataIndex: 'x',
  key: 'x',
  width: '15em'
}, {
  title: 'y',
  dataIndex: 'y',
  key: 'y',
  width: '15em'
}, {
  title: 'z',
  dataIndex: 'z',
  key: 'z',
}];

class OrbitInformation extends Component {
  render() {
    const { satellite, x, y, z } = this.props;

    const data = [{
      key: '1',
      satellite: satellite,
      x: x,
      y: y,
      z: z,
    }];
    
    return (
      <div style={{ padding: '0 20em' }}>
        <Table columns={columns} dataSource={data} size="small" pagination={false} />
      </div>
    );
  }
}

OrbitInformation.propTypes = {
  satellite: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  z: PropTypes.number
}

export default OrbitInformation;
