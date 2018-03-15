import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';

class OrbitInformation extends Component {
  render() {
    return (
      <List
        size="small"
        bordered
        dataSource={[
          `x: ${this.props.x}`,
          `y: ${this.props.y}`,
          `z: ${this.props.z}`
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
