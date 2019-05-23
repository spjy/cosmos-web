/* global fetch:false */
import React, { Component } from 'react';
import { Table, Badge } from 'antd';
import PropTypes from 'prop-types';
import io from 'socket.io-client';

import cosmosInfo from '../Cosmos/CosmosInfo';
import CosmosWidget from '../CosmosWidgetComponents/CosmosWidget';

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
}, {
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
  title: 'AgentStatus',
  dataIndex: 'status',
  key: 'status',
  width: '16%'
}];

class AgentList extends Component {
/* Returns a table element of all agents, which gets updated every five seconds */
    state = {
      agents: []
    };

    componentDidMount() {
      fetch(`${cosmosInfo.socket}/api/agent_list`)
        .then(response => response.json())
        .then(data => this.setState({
          agents: data.result
        }));
      socket.on('agent update list', (data) => { // subscribe to agent
        if (data) {
          // console.log(data)
          const { agents } = this.state;
          for (let i = 0; i < agents.length; i += 1) {
            if (data[agents[i].agent_proc]) {
              // console.log( agents[i].agent_proc," live")
              agents[i].live = true;
            } else {
              agents[i].live = false;
            }
          }
          this.setState({ agents });
        }
      });
    }

    componentWillUnmount() {
      socket.removeAllListeners('agent update list');
    }

    render() {
      const agentList = this.state.agents;
      // console.log(this.state.agents)
      // var keys = Object.keys(agent_list);
      const data = [];
      for (let i = 0; i < agentList.length; i += 1) {
        let status = <Badge status="default" />;
        if (agentList[i].live === true) {
          status = <Badge status="success" />;
        }
        data[i] = {
          key: String(i),
          agent_proc: String(agentList[i].agent_proc),
          agent_node: agentList[i].agent_node,
          agent_addr: agentList[i].agent_addr,
          agent_port: agentList[i].agent_port,
          agent_utc: agentList[i].agent_utc,
          status
        };
      }
      return (
        <CosmosWidget
          id={this.props.id}
          title="Agents"
          mod={false}
          selfDestruct={this.props.selfDestruct}
        >
          <Table
            columns={columns}
            dataSource={data}
            size="small"
            pagination={false}
          />
        </CosmosWidget>
      );
    }
}
AgentList.propTypes = {
  id: PropTypes.number.isRequired,
  selfDestruct: PropTypes.func.isRequired
};
export default AgentList;
