import React, { Component } from 'react';
import { notification } from 'antd';
import 'whatwg-fetch';

import Replay from '../components/Global/Replay';
import Live from '../components/Global/Live';
import ReplayForm from '../components/Global/ReplayForm';
import OrbitInformation from '../components/Orbit/OrbitInformation';
import OrbitThreeD from '../components/Orbit/OrbitThreeD';
import cosmosInfo from '../components/Cosmos/CosmosInfo';
import '../App.css';

class Orbit extends Component {
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
      if (json.node_loc_pos_eci) {
        const [x, y, z] = json.node_loc_pos_eci.pos;

        this.setState({
          live: true,
          satellite: this.state.satellite,
          currentCoord: {
            x: x / 1000,
            y: y / 1000,
            z: z / 1000
          }
        });
      }
    };
  }

  onReplayChange(value) {
    this.setState(value); // Set state from changes from replay component
  }

  onReplayFormSubmit(value) {
    const {
      selected,
      dateFrom,
      dateTo
    } = value;

    fetch(`${cosmosInfo.socket}/api/replay/orbit/${selected}/${dateFrom}/to/${dateTo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
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
          this.setState({ playable: false });
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

  render() {
    const {
      currentCoord,
      replay,
      satellite,
      playable,
      max,
      slider,
      live
    } = this.state;

    return (
      <div>
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
          ? (
            <Live
              type="orbit"
              satellite={satellite}
            />
          )
          : (
            <Replay
              type="orbit"
              playable={playable}
              satellite={satellite}
              max={max}
              slider={slider}
              replay={replay}
              onReplayChange={() => this.onReplayChange.bind(this)}
              ref="replay"
            />
          )
        }

        <br />

        <ReplayForm
          onReplayFormSubmit={() => this.onReplayFormSubmit.bind(this)}
        />
      </div>
    );
  }
}

export default Orbit;
