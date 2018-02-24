import React, { Component } from 'react';
import io from 'socket.io-client';
import satWorldView from './scenes/satWorldView';
//import satRotView from './scenes/satRotView';

import './App.css';

const socket = io('http://localhost:3001');

class App extends Component {

  componentDidMount() {
    satWorldView();
    //satRotView();
  }

  render() {
    return (
      <div>
        <canvas id="satWorldView"></canvas>
        {/* <canvas id="satRotView"></canvas> */}
      </div>
    );
  }
}

export default App;
