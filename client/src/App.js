import React, { Component } from 'react';
import { Slider, Icon, DatePicker } from 'antd';
import io from 'socket.io-client';
import ThreeD from './3D';

import './App.css';

const socket = io('http://localhost:3001');

class App extends Component {

  state = {
    disabled: false,
  };

  handleDisabledChange = (disabled) => {
    this.setState({ disabled });
  }

  onChange(date, dateString) {
    console.log(date, dateString);
  }

  render() {
    return (
      <div>
        <DatePicker.RangePicker onChange={this.onChange} showTime format="YYYY-MM-DD HH:mm:ss" />
        <Icon type="play-circle-o" />
        <Icon type="pause-circle-o" />
        <Slider defaultValue={0} min={0} max={500} disabled={this.state.disabled} />
        <ThreeD></ThreeD>
      </div>
    );
  }
}

export default App;
