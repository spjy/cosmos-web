import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, Form, Alert, Table
} from 'antd';

import CosmosWidget from '../CosmosWidgetComponents/CosmosWidget';
import { AgentSelect, DataNameSelect } from '../CosmosWidgetComponents/FormComponents';
import {
  utc2date
} from '../CosmosWidgetComponents/Utils';

class LiveDataTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show_form: false,
      jsonStructure: [],
      prevJsonStructure: [],
      form: {
        agent: '',
        node: '',
        data_name: []
      },
      form_valid: true
    };
  }

  componentDidMount() {
    /* Open form if no agent is selected */
    if (this.props.info.agent === '') this.setState({ show_form: true });
  }

  onOK = () => {
    let valid = true;
    // validate form here
    if (this.state.form.agent === '') valid = false;
    if (this.state.form.data_name.length < 1) valid = false;

    if (valid) {
      this.props.updateInfo(this.props.id, this.state.form);
      this.closeForm();
    } else {
      this.setState({ form_valid: false });
    }
  }

  openForm = () => {
    this.setState({
      show_form: true,
      form: {
        agent: this.props.info.agent,
        node: this.props.info.node,
        data_name: this.props.info.data_name
      }
    });
  }

  closeForm = () => {
    this.setState({ show_form: false });
  }


  onCancel = () => {
    if (this.state.form.agent !== this.props.info.agent) {
      this.setState(prevState => ({ jsonStructure: prevState.prevJsonStructure }));
    }
    this.setState({
      form: {
        agent: this.props.info.agent,
        node: this.props.info.node,
        data_name: this.props.info.data_name
      },
      show_form: false
    });
  }

  selectAgent = (value) => {
    // onchange function for AgentSelect
    const agentName = value.agent.agent_proc;
    const nodeName = value.agent.agent_node;
    const { structure } = value.agent;
    const { form } = this.state;


    if (form.agent !== agentName && form.agent !== '') { // empty dataset selected if agent changes
      form.data_name = [];
    }
    if (agentName !== this.props.info.agent && form.agent === this.props.info.agent) {
      this.setState(prevState => ({ prevJsonStructure: prevState.jsonStructure }));
    }
    form.agent = agentName;
    form.node = nodeName;

    this.setState({ form, jsonStructure: structure });
  }

  selectDataName = (value) => {
    this.setState((prevState) => {
      const { form } = prevState;
      form.data_name = value;
      return { form };
    });
  }

  initializeAgent = (agent) => {
    this.selectAgent(agent);
  }

  render() {
    const col = [
      { title: 'Name', dataIndex: 'dataname' },
      { title: 'Value', dataIndex: 'value' },
      { title: 'Time', dataIndex: 'time' }
    ];
    const data = [];
    if (this.props.info.values) {
      const jsonnames = this.props.info.values.label;
      for (let i = 0; i < jsonnames.length; i += 1) {
        data.push({
          key: i,
          dataname: jsonnames[i],
          value: this.props.data[jsonnames[i]],
          time: utc2date(this.props.data.agent_utc)
        });
      }
    }

    return (
      <CosmosWidget
        id={this.props.id}
        title={`[${this.props.info.node}] ${this.props.info.agent}`}
        mod={this.props.mod}
        selfDestruct={this.props.selfDestruct}
        editWidget={this.openForm}
      >
        <Modal
          visible={this.state.show_form}
          title="Widget Settings"
          onOk={this.onOK}
          onCancel={this.onCancel}
        >
          <Form layout="inline">
            <AgentSelect
              agent={this.state.form.agent}
              onMount={this.initializeAgent}
              onChange={this.selectAgent}
            />
            <DataNameSelect
              value={this.state.form.data_name}
              onChange={this.selectDataName}
              structure={this.state.jsonStructure}
            />
          </Form>
          {!this.state.form_valid && <Alert message="Incomplete" type="warning" showIcon />}
        </Modal>
        <Table columns={col} dataSource={data} size="small" pagination={false} />
      </CosmosWidget>
    );
  }
}

LiveDataTable.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.shape({
    widgetClass: PropTypes.string.isRequired,
    agent: PropTypes.string,
    node: PropTypes.string,
    data_name: PropTypes.arrayOf(PropTypes.string),
    values: PropTypes.shape({
      label: PropTypes.arrayOf(PropTypes.string),
      structure: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
      )
    })
  }).isRequired,
  data: PropTypes.shape({
    agent_utc: PropTypes.number
  }),
  selfDestruct: PropTypes.func.isRequired,
  updateInfo: PropTypes.func.isRequired,
  mod: PropTypes.bool
};

LiveDataTable.defaultProps = {
  mod: true,
  data: {}
};
export default LiveDataTable;

export function DefaultTable() {
  return {
    widgetClass: 'LiveDataTable',
    agent: '',
    node: '',
    data_name: [],
    values: {
      label: [],
      structure: []
    }
  };
}
