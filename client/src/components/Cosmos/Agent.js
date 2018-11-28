import React, { Component } from 'react';
import { Select } from 'antd';

import io from 'socket.io-client';

const socket = io('http://localhost:3001');
  class AgentSelect extends Component {
  /* Returns a table element of all agents, which gets updated every five seconds */
      state = {
        selection: '',
        agents:[]

      };

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


      render() {
        const Option = Select.Option;
        var agent_list  = this.state.agents;
        var keys = Object.keys(agent_list);
        var data=[]
        var agent_names=[]
        for(var i =0; i < keys.length; i++){
          agent_names.push(<Option key={String(keys[i])}>{String(keys[i])}</Option>);
        }
        function handleChange(value){
          console.log(`selected ${value}`);
        }
        return (
          <div>

            <Select
              mode="multiple"
              style={{ width: '400px' }}
              placeholder="Please select"
              // defaultValue={['a10', 'c12']}
              onChange={handleChange}
            >
            {agent_names}
            </Select>
          </div>
        );
      }
    }

    export default AgentSelect;
