import React, { Component } from 'react';
import Navbar from './Global/Navbar';

import CosmosContainer from './CosmosWidgetComponents/CosmosContainer'
import CosmosWidgetInfo from './CosmosWidgetComponents/CosmosWidgetInfo'



class CosmosToolsPage extends Component {
  constructor(props){
    super(props);
      this.state = {

      };


  }
  getWidgetInfo(){
    var widgets = [];
    widgets.push(new CosmosWidgetInfo({
      agent:'post527',
      node:'node-arduino',
      widgetClass: 'PlotWidget',
      title: 'Post 527',
      xRange:10,
      data_name:['device_tsen_temp_001']
    }));
    widgets.push(new CosmosWidgetInfo({
      widgetClass: 'AgentListWidget'
    }));
    widgets.push(new CosmosWidgetInfo({
      widgetClass: 'Example'
    }));
    // console.log(widgets);
    return widgets;

  }

  render() {
    const imports={
      'PlotWidget': require('./CosmosWidgets/PlotWidget').default,
      'AgentListWidget': require('./CosmosWidgets/AgentList').default,
      'Example': require('./CosmosWidgets/Example').default
    }
    const widgets = this.getWidgetInfo();
    return (

      <div>
        <Navbar current="cosmostools" />
          <div >
            <CosmosContainer
              mod={true}
              widgets={widgets}
              imports={imports}
              />

          </div>
      </div>


    );



  }

}

export default CosmosToolsPage;
