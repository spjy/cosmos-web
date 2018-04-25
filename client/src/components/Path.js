import React, { Component } from 'react';
import { notification } from 'antd';
import io from 'socket.io-client';

import Navbar from './Global/Navbar';
import GoogleMaps from './Path/GoogleMaps';
import PathInformation from './Path/PathInformation';
import BalloonInformation from './Path/BalloonInformation';
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
    path: [[
      {lat:50, lng:1},
      {lat:50.1, lng:1.1},
      {lat:50.2, lng:1.2}
    ]],
    currentCoord: {
      latitude: 0,
      longitude: 0,
      altitude: 0,
      velocity: 0,
      acceleration: 0,
    },
  };

  componentDidMount() {
    socket.on('balloon path', (data) => { // check if there is a live orbit
      if (this.state.replay.length === 0) { // check if there is replay going
        if (data) { // check if data exists
          this.setState({
            live: true,
            satellite: data.satellite,
            currentCoord: {
              latitude: data.latitude,
              longitude: data.longitude,
              altitude: data.altitude,
              velocity: data.velocity,
              acceleration: data.acceleration,
            }
          });
        }

        this.setState({
          path: [...this.state.path, [{ lat: data.latitude, lng: data.longitude }]],
        })

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
      }).catch(err => {
        notification.error({
          message: 'Error',
          description: 'An error occurred.'
        })
        console.log(err);
      });
    }).catch(err => {
      notification.error({
        message: 'Error',
        description: 'An error occurred.'
      })
      console.log(err);
    });
  }

  onReplayChange(value) {

  }

  render() {
    return (
      <div>
        <Navbar
          current="path"
        />

        <GoogleMaps
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBv6j0uD6J2xfPGI_gR-0aYH7qLhrxCR8s&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `80bh` }} />}
          containerElement={<div style={{ height: `72vh` }} />}
          mapElement={<div style={{ height: `72vh` }} />}
          path={this.state.path}
          position={{latitude: this.state.currentCoord.latitude, longitude: this.state.currentCoord.latitude}}
        />

        <BalloonInformation
          velocity={this.state.currentCoord.velocity}
          acceleration={this.state.currentCoord.acceleration}
          altitude={this.state.currentCoord.altitude}
        />

        <PathInformation
          satellite={"Balloon"}
          latitude={this.state.currentCoord.latitude}
          longitude={this.state.currentCoord.longitude}
        />

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

        <ReplayForm onReplayFormSubmit={this.onReplayFormSubmit.bind(this)} />
      </div>
    );
  }

}

export default Path;
