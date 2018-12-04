import React, { Component } from 'react';
import { Table } from 'antd';
import Navbar from './../Global/Navbar';


import io from 'socket.io-client';

const socket = io('http://localhost:3001');
const columns = [{
  title: 'Agent',
  dataIndex: 'agent_proc',
  key: 'agent_proc',
  width: '16%'
}, {
  title: 'Node',
  dataIndex: 'agent_node',
  key: 'agent_node',
  width: '16%'
}, {
  title: 'Address',
  dataIndex: 'agent_addr',
  key: 'agent_addr',
  width: '16%'
},{
  title: 'Port',
  dataIndex: 'agent_port',
  key: 'agent_port',
  width: '16%'
}, {
  title: 'UTC',
  dataIndex: 'agent_utc',
  key: 'agent_utc',
  width: '16%'
}, {
}];

class AgentList extends Component {
/* Returns a table element of all agents, which gets updated every five seconds */
    state = {

      agents:[]

    };

    componentDidMount() {
      socket.on('agent update list', (data) => { // check if there is a live orbit
        var agent_list = this.state.agents;
          if (data) { // check if data exists
            var keys = Object.keys(data);
            for (var k = 0; k < keys.length; k++){
                agent_list[keys[k]] = data[keys[k]];
            }
          }
          this.setState({
            agents:agent_list
          });
      });
    }

    onReplayChange(value) {
      this.setState(value); // Set state from changes from replay component
    }


    render() {
      var agent_list  = this.state.agents;
      var keys = Object.keys(agent_list);
      var data=[]
      for(var i =0; i < keys.length; i++){
        data[i]={
          key : String(i),
          agent_proc: String(keys[i]),
          agent_node: agent_list[keys[i]][1],
          agent_addr: agent_list[keys[i]][2],
          agent_port: agent_list[keys[i]][3],
          agent_utc: agent_list[keys[i]][0],

        };
      }
      return (
        <div>
          <Navbar current="dataplot" />
          <br/>
          <Table
            columns={columns}
            dataSource={data}
            size="small"
            pagination={false} />
        </div>
      );
    }
  }

  export default AgentList;
