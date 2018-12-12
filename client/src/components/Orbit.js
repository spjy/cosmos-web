import React, { Component } from 'react';
import { notification } from 'antd';
import 'whatwg-fetch'
import io from 'socket.io-client';

import Navbar from './Global/Navbar';
import Replay from './Global/Replay';
import Live from './Global/Live';
import ReplayForm from './Global/ReplayForm';
import OrbitInformation from './Orbit/OrbitInformation';
import OrbitThreeD from './Orbit/OrbitThreeD';

import '../App.css';

import cosmosInfo from './Cosmos/CosmosInfo'
const socket = io(cosmosInfo.socket);

class Orbit extends Component {

  state = {
    live: false,
    satellite: '--',
    max: 500,
    slider: 0,
    playable: false,
    replay: [],
    currentCoord: {
      x: 0,
      y: 0,
      z: 0
    },
  };

  componentDidMount() {
    socket.on('satellite orbit', (data) => { // check if there is a live orbit
      if (this.state.replay.length === 0) { // check if there is replay going
        if (data) { // check if data exists
          const { satellite, x, y, z } = data;

          this.setState({
            live: true,
            satellite: satellite,
            currentCoord: {
              x: x,
              y: y,
              z: z
            }
          });
        }
      }
    });
  }

  onReplayChange(value) {
    this.setState(value); // Set state from changes from replay component
  }

  onReplayFormSubmit(value) {
    const { selected, dateFrom, dateTo } = value;

    fetch(`${cosmosInfo.socket}/api/replay/orbit/${selected}/${dateFrom}/to/${dateTo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
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

  render() {

    const { currentCoord, replay, satellite, playable, max, slider, live } = this.state;

    return (
      <div>
        <Navbar
          current="orbit"
        />

        <OrbitThreeD
          data={currentCoord}
          replay={replay}
        />

        <OrbitInformation
          satellite={satellite}
          x={currentCoord.x}
          y={currentCoord.y}
          z={currentCoord.z}
        />

        {live
          ?
            <Live
              type="orbit"
              satellite={satellite}
            />
          :
            <Replay
              type="orbit"
              playable={playable}
              satellite={satellite}
              max={max}
              slider={slider}
              replay={replay}
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

export default Orbit;
