import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import CosmosContainer from './CosmosWidgetComponents/CosmosContainer'

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
    {
      widgetClass: 'AgentListWidget'
    },
    {
      widgetClass: 'Example'
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
      'Example': require('./CosmosWidgets/Example').default
    }
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
