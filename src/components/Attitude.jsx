import React, { Component } from 'react';
import { notification } from 'antd';
import 'whatwg-fetch';
import io from 'socket.io-client';

import Navbar from './Global/Navbar';
import Replay from './Global/Replay';
import Live from './Global/Live';
import ReplayForm from './Global/ReplayForm';
import AttitudeInformation from './Attitude/AttitudeInformation';
import AttitudeThreeD from './Attitude/AttitudeThreeD';
import cosmosInfo from './Cosmos/CosmosInfo';
import '../App.css';

const socket = io(cosmosInfo.socket);

class Attitude extends Component {
  constructor() {
    super();

    this.state = {
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
      }
    };
  }

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

    fetch(`${cosmosInfo.socket}/api/replay/attitude/${selected}/${dateFrom}/to/${dateTo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
      // credentials: 'same-origin',
    }).then((response) => {
      response.json().then((data) => {
        if (data && data.length > 0) {
          this.setState({
            live: false,
            playable: true,
            replay: data,
            max: data.length,
            currentCoord: data[0],
            satellite: data[0].satellite
          });

          this.refs.replay.startSlider(); // initialize function from replay component

          this.setState({
            playable: false
          });
        }
      });
    }).catch((err) => {
      notification.error({
        message: 'Error',
        description: 'An error occurred.'
      });

      console.log(err);
    });
  }

  onReplayChange(value) {
    this.setState(value); // Set state from changes from replay component
  }

  selectSatellite(value, option) {
    this.setState({
      satelliteSelected: value
    });
  }

  datePicker(date, dateString) {
    this.setState({
      dateFrom: dateString[0],
      dateTo: dateString[1]
    });
  }

  render() {
    const {
      currentCoord, satellite, playable, max, slider, replay, live
    } = this.state;

    return (
      <div>
        <Navbar
          current="attitude"
        />

        <AttitudeThreeD
          data={currentCoord}
        />

        <AttitudeInformation
          satellite={satellite}
          w={currentCoord.w}
          x={currentCoord.x}
          y={currentCoord.y}
          z={currentCoord.z}
        />

        {
          live
            ? (
              <Live
                type="attitude"
                satellite={satellite}
              />
            )
            : (
              <Replay
                type="attitude"
                playable={playable}
                satellite={satellite}
                max={max}
                slider={slider}
                replay={replay}
                onReplayChange={value => this.onReplayChange(value)}
                ref="replay"
              />
            )
        }

        <br />

        <ReplayForm
          onReplayFormSubmit={value => this.onReplayFormSubmit(value)}
        />
      </div>
    );
  }
}

export default Attitude;
