import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const columns = [{
  title: 'Satellite',
  dataIndex: 'satellite',
  key: 'satellite',
  width: '12%',
}, {
  title: 'w',
  dataIndex: 'w',
  key: 'w',
  width: '22%',
}, {
  title: 'x',
  dataIndex: 'x',
  key: 'x',
  width: '22%',
}, {
  title: 'y',
  dataIndex: 'y',
  key: 'y',
  width: '22%',
}, {
  title: 'z',
  dataIndex: 'z',
  key: 'z',
}];

class AttitudeInformation extends Component {
  render() {
    const {
      satellite, w, x, y, z
    } = this.props;

    const data = [{
      key: '1',
      satellite: satellite,
      w: w,
      x: x,
      y: y,
      z: z,
    }];

    return (
      <div style={{ padding: '1em' }}>
        <Table
          columns={columns}
          dataSource={data}
          size="small"
          pagination={false}
        />
      </div>
    );
  }
}

AttitudeInformation.propTypes = {
  satellite: PropTypes.string,
  w: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  z: PropTypes.number
};

export default AttitudeInformation;
