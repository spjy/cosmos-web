import React, { Component } from 'react';
import { Card } from 'antd';
import 'whatwg-fetch'
import io from 'socket.io-client';

import Navbar from './Global/Navbar';
import Replay from './Global/Replay';
import Live from './Global/Live';
import ReplayForm from './Global/ReplayForm';
import OrbitInformation from './Orbit/OrbitInformation';
import OrbitThreeD from './Orbit/OrbitThreeD';

import '../App.css';

const socket = io('http://localhost:3001');

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
      }
    });
  }

  onReplayChange(value) {
    this.setState(value); // Set state from changes from replay component
  }

  onReplayFormSubmit(value) {

    const { satelliteSelected, dateFrom, dateTo } = value;

    fetch(`http://localhost:3001/api/replay/orbit/${satelliteSelected}/${dateFrom}/to/${dateTo}`, {
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
    }).catch(err => console.log(err));
  }

  render() {
    return (
      <div>
        <Navbar current="orbit" />
        <OrbitThreeD data={this.state.currentCoord} replay={this.state.replay} />
        <OrbitInformation
          satellite={this.state.satellite}
          x={this.state.currentCoord.x}
          y={this.state.currentCoord.y}
          z={this.state.currentCoord.z}
        />
        <div style={{ padding: '1em' }}>
          <div style={{ background: '#ECECEC', padding: '10px' }}>

            <Card title="Orbit Information" bordered={false} style={{ width: '100%' }}>
              {this.state.live
                ?
                  <Live
                    type="orbit"
                    satellite={this.state.satellite}
                  />
                :
                  <Replay
                    type="orbit"
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
            </Card>
          </div>
        </div>

        <br />

        <div style={{ padding: '0 1em' }}>
          <div style={{ background: '#ECECEC', padding: '10px' }}>
            <ReplayForm onReplayFormSubmit={this.onReplayFormSubmit.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}

export default Orbit;
