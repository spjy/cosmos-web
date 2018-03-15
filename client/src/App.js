import React, { Component } from 'react';
import { Slider, Icon, DatePicker, Row, Col, Card, Form, Select, Button, Alert, Popconfirm, } from 'antd';
import 'whatwg-fetch'
import io from 'socket.io-client';

import Navbar from './components/Navbar';
import OrbitInformation from './components/OrbitInformation';
import LiveOrbit from './components/LiveOrbit';
import ThreeD from './components/ThreeD';

import './App.css';

const socket = io('http://localhost:3001');

class App extends Component {

  state = {
    current: 'home',
    live: false,
    satelliteOrbit: '',
    satellite: '',
    max: 500,
    slider: 0,
    playable: false,
    dateFrom: '',
    dateTo: '',
    replay: [],
    currentCoord: {
      satellite: '--',
      x: 0,
      y: 0,
      z: 0
    },
  };

  // componentDidMount() {
  //   socket.on('satellite orbit', (data) => {
  //     if (data) {
  //       this.setState({ live: true, satellite: data.satellite });
  //       this.setState({
  //         satelliteOrbit: data
  //       });
  //     }
  //   });
  // }

  startSlider() {
    if (this.state.playable) {
      this.setState({ playable: false }); // Prevent users from starting multiple intervals
      this.sliderIncrement();
    }
  }

  sliderIncrement() {
    this.slider = setInterval(() => {
      if (this.state.slider < this.state.max) { // Check if slider reached maximum value
        this.setState({ slider: this.state.slider + 1,
          currentCoord: this.state.replay[this.state.slider]
        }); // If not, keep incrementing
        socket.emit('satellite orbit', this.state.currentCoord)
      } else {
        this.stopSlider(); // If so, clear interval
      }
    }, 1000);
  }

  stopSlider() {
    clearInterval(this.slider);
    this.setState({ playable: true });
  }

  submit(e, poo, cheeks) {
    e.preventDefault();
    // fetch(`http://localhost:3003/api/replay/${this.state.dateFrom}/to/${this.state.dateTo}`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   //credentials: 'same-origin',
    //   "Access-Control-Allow-Origin": "http://localhost:3003",
    // }).then((response) => {
    //   console.log(response);
    // });

    socket.emit("satellite orbit history", {
      dateFrom: this.state.dateFrom,
      dateTo: this.state.dateTo
    });

    socket.on('satellite replay', (orbit) => {
      console.log(orbit[0]);
      if (orbit) {
        this.setState({
          live: false,
          playable: true,
          replay: orbit,
          max: orbit.length,
          currentCoord: orbit[0]
        });
        this.startSlider();
        this.setState({ playable: false });
      }
    });
  }

  datePicker(date, dateString) {
    this.setState({ dateFrom: dateString[0], dateTo: dateString[1] })
  }

  selectSatellite(value, option) {
    this.setState({ satellite: value });
  }

  onSliderChange(value) {
    this.setState({ slider: value });
  }

  componentWillUnmount() {
    this.stopSlider();
  }

  render() {
    return (
      <div>
        <Navbar />
        <ThreeD data={this.state.currentCoord} />
        <div style={{ padding: '2em' }}>
          <div style={{ background: '#ECECEC', padding: '30px' }}>

            <Card title="Orbit Information" bordered={false} style={{ width: '100%' }}>
              {this.state.live === false ?
                <Alert message={
                  <div>
                    Replay
                    <Popconfirm title="Switch to live view?" okText="Yes" cancelText="No">
                      <a><Icon style={{ paddingLeft: "0.5em" }} type="swap" /></a>
                    </Popconfirm>
                  </div>
                } type="warning"
                  description={
                    <div>
                      You are viewing a replay orbit of <strong>{this.state.currentCoord.satellite}</strong>.
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
                            onChange={this.onSliderChange.bind(this)}
                          />
                        </Col>
                      </Row>
                    </div>
                  }
                  showIcon
                />
              :
                <LiveOrbit satellite="cubesat1" />
              }
              <br />
              <OrbitInformation x={this.state.currentCoord.x} y={this.state.currentCoord.y} z={this.state.currentCoord.z} />
            </Card>
          </div>
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
