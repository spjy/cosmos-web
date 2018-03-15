import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';

class OrbitInformation extends Component {
  render() {
    const { x, y, z } = this.props;
    return (
      <List
        size="small"
        bordered
        dataSource={[
          `x: ${x}`,
          `y: ${y}`,
          `z: ${z}`
        ]}
        renderItem={item => (<List.Item>{item}</List.Item>)}
      />
    );
  }
}

OrbitInformation.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  z: PropTypes.number
}

export default OrbitInformation;
