import React, { Component } from 'react';
import { Slider, Icon, DatePicker, Row, Col, Card, Form, Select, Button, Alert, Popconfirm, } from 'antd';
import 'whatwg-fetch'
import io from 'socket.io-client';

import Navbar from './Global/Navbar';
import OrbitInformation from './Orbit/OrbitInformation';
import LiveOrbit from './Orbit/LiveOrbit';
import ReplayOrbit from './Orbit/ReplayOrbit';
import OrbitThreeD from './Orbit/OrbitThreeD';

import '../App.css';

const socket = io('http://localhost:3001');

class Orbit extends Component {

  state = {
    live: false,
    satellite: '',
    max: 500,
    slider: 0,
    playable: false,
    dateFrom: '',
    dateTo: '',
    replay: [],
    currentCoord: {
      x: 0,
      y: 0,
      z: 0
    },
  };

  componentDidMount() {
    socket.on('satellite orbit', (data) => {
      if (data) {
        this.setState({
          live: true,
          satellite: data.satellite,
          currentCoord: {
            x: data.x,
            y: data.y,
            z: data.z
          }
        });
      }
    });
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
      if (orbit) {
        this.setState({
          live: false,
          playable: true,
          replay: orbit,
          max: orbit.length,
          currentCoord: orbit[0],
          satellite: orbit[0].satellite,
        });
        this.refs.replayOrbit.startSlider(); // initialize function from replay component
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

  onReplayOrbitChange(value) {
    this.setState(value); // Set state from changes from replay component
  }

  render() {
    return (
      <div>
        <Navbar />
        <OrbitThreeD data={this.state.currentCoord} />
        <div style={{ padding: '1em' }}>
          <div style={{ background: '#ECECEC', padding: '10px' }}>

            <Card title="Orbit Information" bordered={false} style={{ width: '100%' }}>
              {this.state.live === false ?
                <ReplayOrbit
                  type="orbit"
                  playable={this.state.playable}
                  satellite={this.state.satellite}
                  max={this.state.max}
                  slider={this.state.slider}
                  replay={this.state.replay}
                  onReplayOrbitChange={this.onReplayOrbitChange.bind(this)}
                  ref="replayOrbit"
                />
              :
              <LiveOrbit
                satellite={this.state.satellite}
              />
              }
              <br />
              <OrbitInformation x={this.state.currentCoord.x} y={this.state.currentCoord.y} z={this.state.currentCoord.z} />
            </Card>
          </div>
        </div>
        <br />

        <div style={{ padding: '0 1em' }}>
          <div style={{ background: '#ECECEC', padding: '10px' }}>
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

export default Orbit;
