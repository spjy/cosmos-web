import React, { Component } from 'react';
import { Card } from 'antd';

import Navbar from './Global/Navbar';
import GoogleMaps from './Path/GoogleMaps';
import PathInformation from './Path/PathInformation';
import Live from './Global/Live';
import Replay from './Global/Replay';
import ReplayForm from './Global/ReplayForm';

class Path extends Component {

  onReplayFormSubmit() {

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
