import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const columns = [{
  title: 'Velocity (kmph)',
  dataIndex: 'velocity',
  key: 'velocity',
  width: '33%'
}, {
  title: 'Acceleration (kmph²)',
  dataIndex: 'acceleration',
  key: 'acceleration',
  width: '33%'
}, {
  title: 'Altitude (m)',
  dataIndex: 'altitude',
  key: 'altitude',
  width: '33%'
}, {
}];

class BalloonInformation extends Component {
  render() {
    const { velocity,
      acceleration,
      altitude } = this.props;

    const data = [{
      key: '1',
      velocity: velocity,
      acceleration: acceleration,
      altitude: altitude,
    }];

    return (
      <div style={{ padding: '1em' }}>
        <Table columns={columns} dataSource={data} size="small" pagination={false} />
      </div>
    );
  }
}

BalloonInformation.propTypes = {
  velocity: PropTypes.number,
  acceleration: PropTypes.number,
  altitude: PropTypes.number,
}

export default BalloonInformation;
