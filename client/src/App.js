import React, { Component } from 'react';
import { Slider, Icon } from 'antd';
import io from 'socket.io-client';

import './App.css';

const socket = io('http://localhost:3001');

class App extends Component {

  state = {
    disabled: false,
  };

  handleDisabledChange = (disabled) => {
    this.setState({ disabled });
  }

  render() {
    return (
      <div>
        <Icon type="play-circle-o" />
        <Icon type="pause-circle-o" />
        <Slider defaultValue={0} min={0} max={500} disabled={this.state.disabled} />
      </div>
    );
  }
}

export default App;
