import React, { Component } from 'react';
import { Button, Icon, Modal ,Select} from 'antd';
import ConfigSelectForm from './ConfigSelectForm'
import PlotForm from './PlotForm'
import JsonForm from './JsonForm'

import io from 'socket.io-client';
import cosmosInfo from './CosmosInfo'
const socket = io(cosmosInfo.socket);


const import_type = {
  NONE: 0,
  JSON: 1,
  SAVED: 2,
  NEW:3
};
const Option = Select.Option;

class ConfigTab extends Component {

  constructor(props){
    super(props);

    this.state = {};

  }
  componentDidMount() {
    console.log("entries",this.props.entries)
    socket.on('agent update list', (data) => { // subscribe to agent
      if (data) {
        var agents = this.props.entries;
        for(var i=0; i < this.props.entries.length; i++){
            if(data[agents[i].agent]) {
              agents[i].live=true;
            }

        }
        this.props.updateAgentStatus(agents);
      }
    });
  }
  componentWillUnmount(){
    socket.removeAllListeners('agent update list');
  }



  render() {
    var entries = this.props.entries;
    var json_form;
    var save_config;
    var add_plot;
    var config_select;
    var plot_forms=[];
    switch(this.props.currentConfigSource){
      case import_type.JSON:
        json_form = <JsonForm onChangeJson={this.props.onChangeJson} />
        if(entries.length>0) {
          add_plot = <Button type="default" onClick={this.props.addPlot}>
                      <Icon type="plus"/> Add
                    </Button>
          save_config = <Button type="default" onClick={this.props.saveConfig}>
                      <Icon type="save"/> Save Configurations
                    </Button>
        }
      break;
      case import_type.SAVED:
        config_select = <ConfigSelectForm />
      break;
      case import_type.NEW:
        add_plot = <Button type="default" onClick={this.props.addPlot}>
                    <Icon type="plus"/> Add
                  </Button>
        if(entries.length>0) {
          save_config = <Button type="default" onClick={this.props.saveConfig}>
                      <Icon type="save"/> Save Configurations
                    </Button>
        }
      break;
      default:

      break;
    }
    for(var i = 0; i < entries.length; i++){
      plot_forms.push(<PlotForm
                  key={i}
                  id={i}
                  info={entries[i]}
                  updateInfo={this.props.updatePlotInfo}
                  selfDestruct={this.props.selfDestruct}
                  updateValue={this.props.updateValue}/>);
    }
    return (
      <div>
        <Select
          showSearch
          placeholder="Load Configuration From"
          onChange={this.props.onChangeConfigSource}
          style={{width: '300px'}}
          value={this.props.currentConfigSource}
        >
          <Option value={import_type.NONE}>Select Configuration Source</Option>
          <Option value={import_type.JSON}>JSON File</Option>
          <Option value={import_type.SAVED}>Saved Configuration</Option>
          <Option value={import_type.NEW}>New Configuration</Option>
        </Select>
        {json_form}
        {config_select}
        {plot_forms}
        {add_plot}
        {save_config}
      </div>
      );
  }

}

export default ConfigTab;
