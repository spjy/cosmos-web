import React, { Component } from 'react';
import { Slider, Icon, DatePicker, Row, Col } from 'antd';
import io from 'socket.io-client';
import ThreeD from './3D';

import './App.css';

const socket = io('http://localhost:3001');

class App extends Component {

  state = {
    disabled: false,
    slider: 0,
  };

  componentDidMount() {
    setInterval(() => {
      this.setState({ slider: this.state.slider + 1 });
    }, 1000)
    console.log(this.state.slider);
  }

  handleDisabledChange = (disabled) => {
    this.setState({ disabled });
  }

  onChange(date, dateString) {
    console.log(date, dateString);
  }

  render() {
    return (
      <div>
        <ThreeD />
        <br />
        <div style={{ padding: '2em' }}>
          <DatePicker.RangePicker onChange={this.onChange} showTime format="YYYY-MM-DD HH:mm:ss" />
          <Row>
            <Col md={1} style={{ paddingTop: '0.5em' }}>
              <Icon type="play-circle-o" /> &nbsp;
              <Icon type="pause-circle-o" /> &nbsp;
              {this.state.slider}
            </Col>
            <Col md={23}>
              <Slider defaultValue={0} value={this.state.slider} min={0} max={500} disabled={this.state.disabled} />
            </Col>
          </Row>
        </div>

      </div>
    );
  }
}

export default App;
