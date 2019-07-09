import React, { Component } from 'react';
import { notification } from 'antd';
import 'whatwg-fetch';

import Navbar from '../components/Global/Navbar';
import Replay from '../components/Global/Replay';
import Live from '../components/Global/Live';
import ReplayForm from '../components/Global/ReplayForm';
import AttitudeInformation from '../components/Attitude/AttitudeInformation';
import AttitudeThreeD from '../components/Attitude/AttitudeThreeD';
import cosmosInfo from '../components/Cosmos/CosmosInfo';
import '../App.css';

class Attitude extends Component {
  constructor() {
    super();

    this.state = {
      live: false,
      satellite: 'neutron1_exec',
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
    const socket = new WebSocket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:${process.env.REACT_APP_LIVE_WEBSOCKET_PORT}/live/${this.state.satellite}`);

    socket.onmessage = (data) => {
      const json = JSON.parse(data.data);
      if (Object.keys(json).includes('node_loc_att_lvlh')) {
        const { w, d: { x, y, z } } = json.node_loc_att_lvlh.pos;

        this.setState({
          live: true,
          satellite: this.state.satellite,
          currentCoord: {
            w,
            x,
            y,
            z
          }
        });
      }
    };
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
