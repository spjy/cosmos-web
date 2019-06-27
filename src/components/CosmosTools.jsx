import React, { Component } from 'react';
import {
  Select, Button
} from 'antd';
import Navbar from './Global/Navbar';
import CosmosContainer from './CosmosWidgetComponents/CosmosContainer';
import { DefaultPlot } from './CosmosWidgets/PlotWidget';
import { DefaultTable } from './CosmosWidgets/LiveDataTable';
import { DefaultAgentRequest } from './CosmosWidgets/AgentRequest';

const plotWidget = require('./CosmosWidgets/PlotWidget').default;
const dataTableWidget = require('./CosmosWidgets/LiveDataTable').default;
const agentListWidget = require('./CosmosWidgets/AgentList').default;
const agentRequestWidget = require('./CosmosWidgets/AgentRequest').default;

const imports = {
  PlotWidget: plotWidget,
  LiveDataTable: dataTableWidget,
  AgentListWidget: agentListWidget,
  AgentRequest: agentRequestWidget
};

/* Widget Type options to select from */
const allWidgets = [
  'Plot',
  'Table',
  'Agent List',
  'Agent Request'
];

/* returns default info object for the widgetType */
function widgetDefault(widgetType) {
  const widgetName = allWidgets[widgetType];
  switch (widgetName) {
    case 'Plot':
      return DefaultPlot();
    case 'Table':
      return DefaultTable();
    case 'Agent List':
      return { widgetClass: 'AgentListWidget' };
    case 'Agent Request':
      return DefaultAgentRequest();
    default:
      return {};
  }
}

class CosmosTools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      widgetType: -1,
      widgets: []
    };
  }

  addWidget = () => {
    const { widgets } = this.state;
    widgets.push(widgetDefault(this.state.widgetType));
    this.setState({ widgets });
  }

  onChange = (val) => {
    this.setState({ widgetType: val });
  }

  render() {
    const showAdd = this.state.widgetType >= 0;
    const widgetOptions = [
      <Select.Option value={-1} key={-1}>
        Select Widget Type
      </Select.Option>];
    for (let i = 0; i < allWidgets.length; i += 1) {
      widgetOptions.push(
        <Select.Option key={i} value={i}>
          {allWidgets[i]}
        </Select.Option>
      );
    }
    return (
      <div>
        <Navbar current="cosmostools" />
        <div style={{ margin: '10px' }}>
          <Select
            value={this.state.widgetType}
            onChange={this.onChange}
            style={{ minWidth: '200px' }}
          >
            {widgetOptions}
          </Select>
          {showAdd && <Button onClick={this.addWidget}> Add </Button>}
        </div>
        <CosmosContainer
          mod
          widgets={this.state.widgets}
          imports={imports}
        />
      </div>
    );
  }
}

export default CosmosTools;
