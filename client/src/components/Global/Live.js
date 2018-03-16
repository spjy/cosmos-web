import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'antd';

class LiveOrbit extends Component {
  render() {
    return (
      <Alert message="Live" type="success" description={
        <div>
          You are viewing the live {this.props.type} of <strong>{this.props.satellite}</strong>.
        </div>
      } showIcon />
    );
  }
}

LiveOrbit.propTypes = {
  type: PropTypes.string,
  satellite: PropTypes.string
}

export default LiveOrbit;
