import React, { Component } from 'react';
import { Select } from 'antd';

import io from 'socket.io-client';

const socket = io('http://localhost:3001');
  class CosmosAgent extends Component {
  /* Returns a select box filled with active agents */
  constructor(){
    super();
      this.state = {
        selection: '',
        agents:[]

      };
    }

      componentDidMount() {

        socket.on('agent update list', (data) => { // check if there is a live orbit
          var saved_state = this.state.selection;
          var agent_list = this.state.agents;
            if (data) { // check if data exists
              var keys = Object.keys(data);
              for (var k = 0; k < keys.length; k++){
                  agent_list[keys[k]] = data[keys[k]];
              }
            }
            this.setState({
              selection: saved_state,
              agents:agent_list
            });
        });

      }

      onReplayChange(value) {
        this.setState(value); // Set state from changes from replay component
      }

      handleChange(value){
        let prev_selection = 'agent subscribe '+this.state.selection;
        let agent_list = this.state.agents;
        this.setState({selection: String(value), agents:agent_list});

        socket.removeAllListeners(prev_selection);
        socket.on('agent subscribe '+String(value), (data) => {
          // console.log(data);
        });
      }
      render() {
        const Option = Select.Option;
        var agent_list  = this.state.agents;
        var keys = Object.keys(agent_list);
        var agent_names=[]
        for(var i =0; i < keys.length; i++){
          agent_names.push(<Option key={String(keys[i])}>{String(keys[i])}</Option>);
        }

        return (
          <div>

            <Select
              mode="single"
              style={{ width: '400px' }}
              placeholder="Please select"
              // defaultValue={['a10', 'c12']}
              onChange={this.handleChange.bind(this)}
            >
            {agent_names}
            </Select>
          </div>
        );
      }
    }

    export default CosmosAgent;
