import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const columns = [
  //   {
  //   title: 'Velocity (kmph)',
  //   dataIndex: 'velocity',
  //   key: 'velocity',
  //   width: '33%'
  // }, 
  {
    title: 'Acceleration (kmph²)',
    dataIndex: 'acceleration',
    key: 'acceleration',
    width: '50%'
  }, {
    title: 'Altitude (m)',
    dataIndex: 'altitude',
    key: 'altitude',
    width: '50%'
  }, {
}];

class BalloonInformation extends Component {
  render() {
    const {
      acceleration,
      altitude 
    } = this.props;

    const data = [
      {
        key: '1',
        acceleration: `${acceleration[0]}, ${acceleration[1]}, ${acceleration[2]}`,
        altitude: altitude,
      }
    ];

    return (
      <div 
        style={{ padding: '1em' }}
      >
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

BalloonInformation.propTypes = {
  acceleration: PropTypes.array,
  altitude: PropTypes.number,
};

export default BalloonInformation;
