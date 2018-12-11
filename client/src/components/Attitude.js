import React, { Component } from 'react';
import { notification } from 'antd';
import 'whatwg-fetch'
import io from 'socket.io-client';

import Navbar from './Global/Navbar';
import Replay from './Global/Replay';
import Live from './Global/Live';
import ReplayForm from './Global/ReplayForm';
import AttitudeInformation from './Attitude/AttitudeInformation';
import AttitudeThreeD from './Attitude/AttitudeThreeD';

import '../App.css';

const socket = io('http://192.168.150.23:3001');

class Attitude extends Component {

  state = {
    live: false,
    satellite: '--',
    max: 500,
    slider: 0,
    playable: false,
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

  onReplayFormSubmit(value) {
    const { selected, dateFrom, dateTo } = value;

    fetch(`http://192.168.150.23:3001/api/replay/attitude/${selected}/${dateFrom}/to/${dateTo}`, {
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
    }).catch(err => {
      notification.error({
        message: 'Error',
        description: 'An error occurred.'
      })
      console.log(err)
    });
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
        <Navbar
          current="attitude"
        />

        <AttitudeThreeD
          data={this.state.currentCoord}
        />

        <AttitudeInformation
          satellite={this.state.satellite}
          w={this.state.currentCoord.w}
          x={this.state.currentCoord.x}
          y={this.state.currentCoord.y}
          z={this.state.currentCoord.z}
        />

        {this.state.live
        ?
          <Live
            type="attitude"
            satellite={this.state.satellite}
          />
        :
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
        }

        <br />

        <ReplayForm
          onReplayFormSubmit={this.onReplayFormSubmit.bind(this)}
        />
      </div>
    );
  }
}

export default Attitude;
