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
    path: [[]],
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
          console.log(data);
          
          const { satellite, latitude, longitude, altitude, velocity, acceleration } = data;

          this.setState({
            live: true,
            satellite: satellite,
            currentCoord: {
              latitude: latitude,
              longitude: longitude,
              altitude: altitude,
              velocity: velocity,
              acceleration: acceleration,
            }
          });

          this.setState(prevState => ({
            path: [
              ...this.state.path, 
              [
                { lat: prevState.currentCoord.latitude, lng: prevState.currentCoord.longitude }, 
                { lat: latitude, lng: longitude }
              ]
            ],
          }));
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
          position={[
            {lat: this.state.currentCoord.latitude, lng: this.state.currentCoord.longitude}
          ]}
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
