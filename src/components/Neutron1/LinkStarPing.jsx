import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import io from 'socket.io-client';

import CosmosWidget from '../Tools/WidgetComponents/CosmosWidget';
import cosmosInfo from '../Cosmos/CosmosInfo';

const socket = io(cosmosInfo.socket);
const pingStatus = {
  NONE: 0,
  WAITING: 1,
  RECEIVED: 2
};

class AgentRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: pingStatus.NONE,
      ping_id: -1,
      error: ''
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => this.checkPing(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  sendPing = () => {
    socket.emit('agent_command',
      { agent: 'linkstar_gs', node: 'neutron1', command: 'test' },
      this.sendPingResponseReceived.bind(this));
    this.setState({ status: pingStatus.WAITING });
  }

  checkPing = () => {
    if (this.state.status === pingStatus.WAITING && this.state.ping_id > -1) {
      // console.log('checkPing');
      let cmd = 'check_ping';
      cmd += ` ${this.state.ping_id.toString()}`;
      socket.emit('agent_command',
        { agent: 'linkstar_gs', node: 'neutron1', command: cmd },
        this.checkPingResponseReceived.bind(this));
    }
  }

  openForm = () => {

  }

  sendPingResponseReceived(data) {
    const resp = data.output;
    // console.log(resp)
    if (resp.includes('[OK]')) {
      const jsonstr = resp.split('\n');
      const json = JSON.parse(jsonstr[0]);
      if (json.command_id) {
        this.setState({
          ping_id: json.command_id,
          error: resp
        });
      }
    } else {
      this.setState({ error: resp });
    }
  }

  checkPingResponseReceived(data) {
    const resp = data.output;
    let status = pingStatus.WAITING;

    // console.log(resp)
    if (resp.includes('[OK]')) {
      const jsonstr = resp.split('\n');
      const json = JSON.parse(jsonstr[0]);

      if (json.db) status = pingStatus.RECEIVED;
      this.setState({
        status,
        error: resp
      });
    } else {
      this.setState({ error: resp });
    }
  }

  render() {
    const title = 'LinkStar Ping';
    let pingButton;
    if (this.state.status === pingStatus.WAITING) {
      pingButton = <Button disabled> SENT </Button>;
    } else {
      pingButton = <Button onClick={this.sendPing}> PING </Button>;
    }
    let pingInfo;
    if (this.state.ping_id >= 0) {
      pingInfo = 'Ping ID: ';
      pingInfo += this.state.ping_id;
      pingInfo += '\n';
    }
    return (
      <CosmosWidget
        id={this.props.id}
        title={title}
        mod={false}
        selfDestruct={this.props.selfDestruct}
        editWidget={this.openForm}
      >
        {pingButton}
        <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{pingInfo}</p>
        {this.state.error}
        <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{this.state.error}</p>
      </CosmosWidget>
    );
  }
}

AgentRequest.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.shape({
    widgetClass: PropTypes.string.isRequired
  }).isRequired,
  selfDestruct: PropTypes.func.isRequired
};

export default AgentRequest;
