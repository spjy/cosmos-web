import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import CosmosContainer from './CosmosWidgetComponents/CosmosContainer';

function getWidgetInfo() {
  return [
    {
      agent: 'propagator_simple',
      node: 'cubesat1',
      widgetClass: 'PlotWidget',
      title: 'Propagator',
      xRange: 10,
      data_name: ['node_loc_pos_eci_vel'],
      plot_labels: ['', '']
    },
    // {
    //   agent: 'propagator_simple',
    //   node: 'cubesat1',
    //   widgetClass: 'LiveDataTable',
    //   data_name: ['node_loc_pos_eci_vel']
    // },
    {
      agent: 'post527',
      node: 'node-arduino',
      widgetClass: 'LiveDataTable',
      data_name: ['device_tsen_temp_001']
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
      widgetClass: 'AgentCommands',
      request: 'request_blink',
      arguments: ['1']
    }
  ];
}

class CosmosToolsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const imports = {
      'PlotWidget': require('./CosmosWidgets/PlotWidget').default,
      'AgentListWidget': require('./CosmosWidgets/AgentList').default,
      'LiveDataTable': require('./CosmosWidgets/LiveDataTable').default,
      'Example': require('./CosmosWidgets/Example').default
    };
    const widgets = getWidgetInfo();

    return (
      <div>
        <Navbar current="cosmostools" />
        <div>
          <CosmosContainer
            mod
            widgets={widgets}
            imports={imports}
          />
        </div>
      </div>
    );
  }
}

export default CosmosToolsPage;
