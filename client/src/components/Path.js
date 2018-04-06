import React, { Component } from 'react';
import { Card } from 'antd';
import io from 'socket.io-client';

import Navbar from './Global/Navbar';
import GoogleMaps from './Path/GoogleMaps';
import PathInformation from './Path/PathInformation';
import Live from './Global/Live';
import Replay from './Global/Replay';
import ReplayForm from './Global/ReplayForm';

const socket = io('http://localhost:3001');

class Path extends Component {

  state = {
    live: false,
    satellite: '--',
    max: 500,
    slider: 0,
    playable: false,
    replay: [],
    currentCoord: {
      latitude: 0,
      longitude: 0
    },
  };

  componentDidMount() {
    socket.on('satellite path', (data) => { // check if there is a live orbit
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

  onReplayFormSubmit(value) {
    const { selected, dateFrom, dateTo } = value;

    fetch(`http://localhost:3001/api/replay/path/${selected}/${dateFrom}/to/${dateTo}`, {
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

  onReplayChange(value) {

  }

  render() {
    return (
      <div>
        <Navbar current="path" />

        <GoogleMaps
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBv6j0uD6J2xfPGI_gR-0aYH7qLhrxCR8s&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `80bh` }} />}
          containerElement={<div style={{ height: `80vh` }} />}
          mapElement={<div style={{ height: `80vh` }} />}
        />

        <PathInformation
          satellite={"Balloon"}
          latitude={50.4}
          longitude={1.1}
        />

        <div style={{ padding: '1em' }}>
          <div style={{ background: '#ECECEC', padding: '10px' }}>
            <Card title="Path Information" bordered={false} style={{ width: '100%' }}>
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

       <div style={{ padding: '0 1em' }}>
         <div style={{ background: '#ECECEC', padding: '10px' }}>
           <ReplayForm onReplayFormSubmit={this.onReplayFormSubmit.bind(this)} />
         </div>
       </div>
      </div>
    );
  }

}

export default Path;
