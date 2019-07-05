import React, { Component } from 'react';
import CosmosContainer from '../components/Tools/WidgetComponents/CosmosContainer';

const plotWidget = require('../components/Tools/Widgets/LivePlotWidget').default;
const agentListWidget = require('../components/Tools/Widgets/AgentList').default;
const dataTableWidget = require('../components/Tools/Widgets/LiveDataTable').default;
const exampleWidget = require('../components/Tools/Widgets/Example').default;
const agentRequestWidget = require('../components/Tools/Widgets/AgentRequest').default;
const agentCommands = require('../components/Tools/Widgets/AgentCommands').default;


class CosmosToolsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      widgets: [
        {
          agent: 'post527',
          node: 'node-arduino',
          widgetClass: 'LivePlotWidget',
          data_name: ['device_tsen_temp_001'],
          title: 'POST527 Temperature',
          xRange: 10,
          plot_labels: ['Time', 'F']
        },
        {
          widgetClass: 'AgentListWidget'
        },
        {
          widgetClass: 'Example'
        },
        {
          agent: 'post527',
          node: 'node-arduino',
          widgetClass: 'AgentRequest',
          request: 'request_blink',
          label: 'blink on',
          arguments: ['1']
        },
        {
          agent: 'post527',
          node: 'node-arduino',
          widgetClass: 'AgentCommands',
          request: '',
          arguments: ['']
        }
      ]
    };
  }

  updateWidgets = (widgets) => {
    /* function to pass to CosmosContainer to update *this* state
     *   when widgets are modified
    */
    // console.log(widgets)
    this.setState({ widgets });
  }

  render() {
    const imports = {
      LivePlotWidget: plotWidget,
      AgentListWidget: agentListWidget,
      LiveDataTable: dataTableWidget,
      Example: exampleWidget,
      AgentRequest: agentRequestWidget,
      AgentCommands: agentCommands
    };

    return (
      <div>
        <CosmosContainer
          mod
          widgets={this.state.widgets}
          imports={imports}
          updateWidgets={this.updateWidgets}
        />
      </div>
    );
  }
}

export default CosmosToolsPage;
