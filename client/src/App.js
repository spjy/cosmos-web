import React, { Component } from 'react';
import { Slider, Icon, DatePicker, Row, Col, Card, Form, Select, Button, Alert } from 'antd';
import axios from 'axios';
import io from 'socket.io-client';
import ThreeD from './components/3D';

import './App.css';

const socket = io('http://localhost:3001');

class App extends Component {

  state = {
    disabled: false,
    max: 500,
    slider: 0,
    playable: false,
    dateFrom: '',
    dateTo: '',
    satellite: '',
    replay: [],
  };

  componentDidMount() {
    this.sliderIncrement();
  }

  sliderIncrement() {
    this.slider = setInterval(() => {
      if (this.state.slider < this.state.max) { // Check if slider reached maximum value
        this.setState({ slider: this.state.slider + 1 }); // If not, keep incrementing
      } else {
        this.stopSlider(); // If so, clear interval
      }
    }, 1000);
  }

  datePicker(date, dateString) {
    console.log(date, dateString);
    this.setState({ dateFrom: dateString[0], dateTo: dateString[1] })
  }

  selectSatellite(value, option) {
    console.log(value, option);
    this.setState({ satellite: value });
  }

  handleChange(value) {
    this.setState({ slider: value });
  }

  startSlider() {
    if (this.state.playable) {
      this.setState({ playable: false }); // Prevent users from starting multiple intervals
      this.sliderIncrement();
    }
  }

  stopSlider() {
    clearInterval(this.slider);
    this.setState({ playable: true });
  }

  submit(e, poo, cheeks) {
    e.preventDefault();
    axios.get(`/replay/${this.state.dateFrom}/to/${this.state.dateTo}`).then((res) => {
      console.log(res);
      //this.setState({ replay: res })
    });
  }

  componentWillUnmount() {
    this.stopSlider();
  }

  render() {
    return (
      <div>
        <ThreeD />
        <div style={{ padding: '2em' }}>
          {/* <Alert message="Live" type="success" description="You are viewing the live orbit of cubesat1." showIcon /> */}
          <Alert message="Replay" type="warning"
            description={
              <div>
                You are viewing a replay orbit of cubesat1.
                <Row>
                  <Col sm={2} md={1} style={{ paddingTop: '0.5em' }}>
                    <Icon className="media-buttons"
                      type="play-circle-o"
                      onClick={this.startSlider.bind(this)}
                    />
                    &nbsp;
                    <Icon className="media-buttons"
                      type="pause-circle-o"
                      onClick={this.stopSlider.bind(this)}
                    />
                    &nbsp;
                    {this.state.slider}
                  </Col>
                  <Col sm={22} md={23}>
                    <Slider
                      defaultValue={0}
                      value={this.state.slider}
                      min={0} max={this.state.max}
                      marks={{
                        0: '0',
                        [this.state.max / 2]: this.state.max / 2,
                        [this.state.max]: this.state.max,
                      }}
                      disabled={this.state.disabled}
                      onChange={this.handleChange.bind(this)}
                    />
                  </Col>
                </Row>
              </div>
            }
          showIcon 
          />
        </div>
        <br />

        <div style={{ padding: '0 2em' }}>
          <div style={{ background: '#ECECEC', padding: '30px' }}>
            <Card title="Replay" bordered={false} style={{ width: '100%' }}>
              <Form layout="horizontal" onSubmit={this.submit.bind(this)}>
                <Form.Item label="Satellite">
                  <Select
                    showSearch
                    placeholder="Select satellite"
                    onChange={this.selectSatellite.bind(this)}
                    //optionFilterProp="children"
                    //onChange={handleChange}
                    //filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  >
                    <Select.Option value="cubesat1">cubesat1</Select.Option>
                    <Select.Option value="neutron1">neutron1</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Date range">
                  <DatePicker.RangePicker onChange={this.datePicker.bind(this)} showTime format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  Replay Orbit
                </Button>
              </Form>
            </Card>
          </div>
        </div>

      </div>
    );
  }
}

export default App;
