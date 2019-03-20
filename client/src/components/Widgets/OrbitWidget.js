import React, { Component } from 'react';
import io from 'socket.io-client';
import moment from 'moment';
import {  Alert , Row, Col , Button ,Slider} from 'antd';
import cosmosInfo from './../Cosmos/CosmosInfo'
import { LineChart, Line ,XAxis, YAxis, Tooltip, ResponsiveContainer, Label} from 'recharts';
import { notification } from 'antd';
import 'whatwg-fetch'
import OrbitInformation from './../Orbit/OrbitInformation';
import OrbitThreeD from './../Orbit/OrbitThreeD';
const socket = io(cosmosInfo.socket);
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]
const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
class OrbitWidget extends Component {

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
          const { satellite, x, y, z } = data;

          this.setState({
            live: true,
            satellite: satellite,
            currentCoord: {
              x: x,
              y: y,
              z: z
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
    const { selected, dateFrom, dateTo } = value;

    fetch(`${cosmosInfo.socket}/api/replay/orbit/${selected}/${dateFrom}/to/${dateTo}`, {
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
    }).catch(err => {
      notification.error({
        message: 'Error',
        description: 'An error occurred.'
      })
      console.log(err)
    });
  }

  render() {

    const { currentCoord, replay, satellite, playable, max, slider, live } = this.state;

    return (
      <div>

        <Row gutter={16}>
            <Col span={16} >
            <OrbitThreeD
              data={currentCoord}
              replay={replay}
            />              </Col>
              <Col span={8} >
              <OrbitInformation
                satellite={satellite}
                x={currentCoord.x}
                y={currentCoord.y}
                z={currentCoord.z}
              />              </Col>
            </Row>

      </div>
    );
  }

}

export default OrbitWidget;
