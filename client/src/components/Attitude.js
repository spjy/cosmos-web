import React, { Component } from 'react';
import { DatePicker, Card, Form, Select, Button } from 'antd';
import 'whatwg-fetch'
import io from 'socket.io-client';

import Navbar from './Global/Navbar';
import Replay from './Global/Replay';
import AttitudeInformation from './Attitude/AttitudeInformation';
import Live from './Global/Live';
import AttitudeThreeD from './Attitude/AttitudeThreeD';

import '../App.css';

const socket = io('http://localhost:3001');

class Attitude extends Component {

  state = {
    live: false,
    satelliteSelected: '',
    satellite: '--',
    max: 500,
    slider: 0,
    playable: false,
    dateFrom: '',
    dateTo: '',
    replay: [],
    currentCoord: {
      w: 0,
      x: 0,
      y: 0,
      z: 0
    },
  };

  componentDidMount() {
    socket.on('satellite attitude', (data) => {
      if (this.state.replay.length === 0) {
        if (data) {
          this.setState({
            live: true,
            satellite: data.satellite,
            currentCoord: {
              w: data.w,
              x: data.x,
              y: data.y,
              z: data.z
            }
          });
        }
      }
    });
  }

  submit(e) {
    e.preventDefault();
    fetch(`http://localhost:3001/api/replay/attitude/${this.state.satelliteSelected}/${this.state.dateFrom}/to/${this.state.dateTo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      //credentials: 'same-origin',
    }).then((response) => {
      response.json().then((data) => {
        console.log(data);
        if (data && data.length > 0) {
          this.setState({
            live: false,
            playable: true,
            replay: data,
            max: data.length,
            currentCoord: data[0],
            satellite: data[0].satellite,
          });
          this.refs.replay.startSlider(); // initialize function from replay component
          this.setState({ playable: false });
        }
      });
    }).catch(err => console.log(err));
  }

  datePicker(date, dateString) {
    this.setState({ dateFrom: dateString[0], dateTo: dateString[1] })
  }

  selectSatellite(value, option) {
    this.setState({ satelliteSelected: value });
  }

  onReplayChange(value) {
    this.setState(value); // Set state from changes from replay component
  }

  render() {
    return (
      <div>
        <Navbar />
        <AttitudeThreeD data={this.state.currentCoord} />
        <div style={{ padding: '1em' }}>
          <div style={{ background: '#ECECEC', padding: '10px' }}>

            <Card title="Attitude Information" bordered={false} style={{ width: '100%' }}>
              {this.state.live === false ?
                <Replay
                  type="attitude"
                  playable={this.state.playable}
                  satellite={this.state.satellite}
                  max={this.state.max}
                  slider={this.state.slider}
                  replay={this.state.replay}
                  onReplayChange={this.onReplayChange.bind(this)}
                  ref="replay"
                />
              :
              <Live
                type="attitude"
                satellite={this.state.satellite}
              />
              }
              <br />
              <AttitudeInformation
                w={this.state.currentCoord.w}
                x={this.state.currentCoord.x}
                y={this.state.currentCoord.y}
                z={this.state.currentCoord.z}
              />
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
                  Replay Attitude
                </Button>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default Attitude;
