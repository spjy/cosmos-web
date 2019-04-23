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
import cosmosInfo from './Cosmos/CosmosInfo';

const socket = io(cosmosInfo.socket);

class Path extends Component {
  constructor() {
    super();

    this.state = {
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
        acceleration: [0,0,0],
      },
    };
  }

  componentDidMount() {
    socket.on('balloon path', (data) => { // check if there is a live orbit
      if (this.state.replay.length === 0) { // check if there is replay going
        if (data) { // check if data exists
          console.log(data);

          const { satellite, latitude, longitude, altitude, acceleration } = data;

          this.setState({
            live: true,
            satellite,
            currentCoord: {
              latitude,
              longitude,
              altitude,
              acceleration
            }
          });

          this.setState(prevState => ({
            path: [
              ...this.state.path,
              [
                { lat: prevState.currentCoord.latitude, lng: prevState.currentCoord.longitude },
                { lat: latitude, lng: longitude }
              ]
            ]
          }));
        }
      }
    });
  }

  onReplayFormSubmit(value) {
    const { selected, dateFrom, dateTo } = value;

    fetch(`${cosmosInfo.socket}/api/replay/path/${selected}/${dateFrom}/to/${dateTo}`, {
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
      }).catch((err) => {
        notification.error({
          message: 'Error',
          description: 'An error occurred.'
        });
        console.log(err);
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
  }

  render() {
    const {
      path,
      currentCoord,
      satellite,
      playable,
      max,
      slider,
      replay,
      live
    } = this.state;

    return (
      <div>
        <Navbar
          current="path"
        />

        <GoogleMaps
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBv6j0uD6J2xfPGI_gR-0aYH7qLhrxCR8s&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: '80bh' }} />}
          containerElement={<div style={{ height: '72vh' }} />}
          mapElement={<div style={{ height: '72vh' }} />}
          path={path}
          position={[
            { lat: currentCoord.latitude, lng: currentCoord.longitude }
          ]}
        />

        <BalloonInformation
          acceleration={currentCoord.acceleration}
          altitude={currentCoord.altitude}
        />

        <PathInformation
          satellite="Balloon"
          latitude={currentCoord.latitude}
          longitude={currentCoord.longitude}
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
              onReplayChange={this.onReplayChange.bind(this)}
              ref="replay"
            />
          )
        }

        <br />

        <ReplayForm onReplayFormSubmit={this.onReplayFormSubmit.bind(this)} />
      </div>
    );
  }

}

export default Path;
