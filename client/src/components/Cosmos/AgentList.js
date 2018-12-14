import React, { Component } from 'react';
import { Table } from 'antd';
import Navbar from './../Global/Navbar';
import io from 'socket.io-client';
import cosmosInfo from './CosmosInfo'
const socket = io(cosmosInfo.socket);

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
      fetch(`${cosmosInfo.socket}/api/agent_list`)
      .then(response => response.json())
      .then(data =>
        this.setState({
          agents:data.result
        })
      );
    }

    render() {
      var agent_list  = this.state.agents;
      // var keys = Object.keys(agent_list);
      var data=[]
      for(var i =0; i < agent_list.length; i++){
        data[i]={
          key : String(i),
          agent_proc: String(agent_list[i].agent_proc),
          agent_node: agent_list[i].agent_node,
          agent_addr: agent_list[i].agent_addr,
          agent_port: agent_list[i].agent_port,
          agent_utc: agent_list[i].agent_utc

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
