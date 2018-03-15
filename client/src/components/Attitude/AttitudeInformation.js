import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';

class AttitudeInformation extends Component {
  render() {
    const { w, x, y, z } = this.props;
    return (
      <List
        size="small"
        bordered
        dataSource={[
          `w: ${w}`,
          `x: ${x}`,
          `y: ${y}`,
          `z: ${z}`
        ]}
        renderItem={item => (<List.Item>{item}</List.Item>)}
      />
    );
  }
}

AttitudeInformation.propTypes = {
  w: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  z: PropTypes.number
}

export default AttitudeInformation;
