import React, { Component } from 'react';
import io from 'socket.io-client';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';

import cosmosInfo from './CosmosInfo'
const socket = io(cosmosInfo.socket);


class CosmosPlot extends Component {
/* Returns a select box filled with active agents */
  constructor(props){
    super(props);

      this.state = {
        data:[],
        agent: props.info.agent,
        data_length:100
      };
      var saved_state = this.state;
      var vals_to_track = [];
      var selected = this.props.info.values;
      for(var i=0; i< selected.length; i++){
        vals_to_track.push(this.props.info.structure[selected[i]]);
      }
      console.log("vals_to_track",vals_to_track);
  }

    componentDidMount() {
      socket.on('agent subscribe '+this.props.agent, (data) => { // subscribe to agent
        if (data) {
          // console.log(data)
          var saved_state = this.state;
          var vals_to_track = [];
          var selected = this.props.info.values;
          for(var i=0; i< selected.length; i++){
            vals_to_track.push(selected[i]);
          }
          console.log(vals_to_track);
          // var data_entry = get_data(this.props.data_selected, data, '');
          // console.log(data_entry)
          // saved_state.data.push(data_entry);
          // if(saved_state.data.length > this.state.data_length){
          //   saved_state.data.shift();
          // }
          this.setState(saved_state);
        }
      });
    }
    componentWillUnmount() {
      var prevState = this.props.agent;
      socket.removeAllListeners('agent subscribe '+prevState);
    }


    render() {
      return (
        <div>
        </div>
      );


    }
}

export default CosmosPlot;
