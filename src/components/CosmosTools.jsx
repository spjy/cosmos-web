import React, { Component } from 'react';
import {
  Select, Button
} from 'antd';
import Navbar from './Global/Navbar';
import CosmosContainer from './CosmosWidgetComponents/CosmosContainer';
import { DefaultPlot } from './CosmosWidgets/PlotWidget';

const plotWidget = require('./CosmosWidgets/PlotWidget').default;
const agentListWidget = require('./CosmosWidgets/AgentList').default;
const dataTableWidget = require('./CosmosWidgets/LiveDataTable').default;
const exampleWidget = require('./CosmosWidgets/Example').default;
const agentRequestWidget = require('./CosmosWidgets/AgentRequest').default;

const imports = {
  PlotWidget: plotWidget,
  AgentListWidget: agentListWidget,
  LiveDataTable: dataTableWidget,
  Example: exampleWidget,
  AgentRequest: agentRequestWidget
};

const allWidgets = [
  'Plot'
];

class CosmosTools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      widgetType: '',
      widgets: []
    };
  }

  addWidget = () => {
    const { widgets } = this.state;
    switch (this.state.widgetType) {
      case 'Plot':
        widgets.push(DefaultPlot());
        break;
      default:
        break;
    }
    this.setState({ widgets });
  }

  onChange = (val) => {
    this.setState({ widgetType: val });
  }

  render() {
    const showAdd = this.state.widgetType !== '';
    const widgetOptions = [];
    for (let i = 0; i < allWidgets.length; i += 1) {
      widgetOptions.push(
        <Select.Option key={allWidgets[i]}>
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
