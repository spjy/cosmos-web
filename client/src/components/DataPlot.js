import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import JsonForm from './Cosmos/JsonForm'
import CosmosPlotEntry from './Cosmos/CosmosPlotEntry'
import PlotForm from './Cosmos/PlotForm'
import { Select , Card } from 'antd';

const import_type = {
  NONE: 0,
  JSON: 1,
  SAVED: 2,
  NEW:3
};
const tabList = [{
  key: 'config_tab',
  tab: 'Configure',
}, {
  key: 'plot_tab',
  tab: 'Plot',
}];

const Option = Select.Option;
function ConfigTabContent (props) {
  var config_contents; // contents of config tab
  var entries = props.entries;
  switch(props.currentConfigSource){
    case import_type.JSON:
      config_contents = <JsonForm onChangeJson={props.onChangeJson} />
    break;
    case import_type.SAVED:
      config_contents = <p>Select config </p>
    break;
    case import_type.NEW:
      config_contents = <p>New config </p>
    break;
    default:
      config_contents = <p> Choose one </p>
    break;
  }
  var plot_forms = entries.map(function(p, index){
    return <PlotForm key={index} id={index} info={p} updateInfo={props.updatePlotInfo}/>;
  });
  return (
    <div>
      <Select
        showSearch
        placeholder="Load Configuration From"
        onChange={props.onChangeConfigSource}
        style={{width: '300px'}}
        value={props.currentConfigSource}
      >
        <Option value={import_type.JSON}>JSON File</Option>
        <Option value={import_type.SAVED}>Saved Configuration</Option>
        <Option value={import_type.NEW}>New Configuration</Option>
      </Select>
      {config_contents}
      {plot_forms}
    </div>
    );
}
function PlotTabContent(props) {
  var plot_contents=<p>Coming soon...</p>;
  var plotentries = props.entries;
  return (
    <div>
      {plot_contents}
    </div>
  );
}


class DataPlot extends Component {
  constructor(props){
    super(props);
      this.state = {
        tab_key:'config_tab',
        config_source: import_type.NONE,
        cosmosPlotEntries:[],
      };


  }
  componentDidMount() {
    // TODO : fetch agent_list
  }

  onTabChange = (key, type) => {
    // console.log(key, type);
    var state = this.state;
    state.tab_key=key;
    this.setState(state);
  }
  onChangeConfigSource(source){
    // TODO
    // if changed to new, set cosmosPlotEntries=[] empty array, add one empty entry
    var state = this.state;
    state.config_source = source;
    this.setState(state);

  }

  importJsonArray(jsonArr){
    // called from JsonForm when a file is selected
    var state = this.state;
    var entries = [];
    for(var i=0; i < jsonArr.length; i++){
      entries.push(new CosmosPlotEntry(jsonArr[i]));
    }
    state.cosmosPlotEntries = entries;
    this.setState(state);
  }

  updateEntry(index, new_vals){
    // TODO
    // called from PlotForm when changes are made
    // var state = this.state;
    // state.cosmosPlotEntries[index] = ???
    // this.setState(state);
  }

  render() {
    // var config_contents; // contents of config tab
    // var entries = this.state.cosmosPlotEntries;
    // switch(this.state.config_source){
    //   case import_type.JSON:
    //     config_contents = <JsonForm onChangeJson={this.importJsonArray.bind(this)} />
    //   break;
    //   case import_type.SAVED:
    //     config_contents = <p>Select config </p>
    //   break;
    //   case import_type.NEW:
    //     config_contents = <p>New config </p>
    //   break;
    //   default:
    //     config_contents = <p> Choose one </p>
    //   break;
    // }
    // var plot_forms = entries.map(function(p, index){
    //   return <PlotForm key={index} id={index} info={p} updateInfo={this.updateEntry.bind(this)}/>;
    // });
    const contentList = {
      config_tab:
        <ConfigTabContent
                      onChangeConfigSource={this.onChangeConfigSource.bind(this)}
                      entries={this.state.cosmosPlotEntries}
                      onChangeJson={this.importJsonArray.bind(this)}
                      updatePlotInfo={this.updateEntry.bind(this)}
                      currentConfigSource={this.state.config_source}
                      />,

      plot_tab: <p>Coming soon...</p>
    };


    return (

      <div>
        <Navbar current="dataplot" />
        <div>
        <Card
          style={{ width: '100%' }}
          title="Data Plot"
          tabList={tabList}
          activetabkey={this.state.tab_key}
          onTabChange={(tab_key) => { this.onTabChange(tab_key, 'key'); }}
        >
          {contentList[this.state.tab_key]}
        </Card>

        </div>
      </div>


    );



  }

}

export default DataPlot;
