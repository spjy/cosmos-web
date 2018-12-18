import React, { Component } from 'react';
import io from 'socket.io-client';
import { notification } from 'antd';
import PlotForm from './PlotForm';
import { Select ,  Card} from 'antd';
import Navbar from './../Global/Navbar';

import CosmosPlotEntry from './CosmosPlotEntry'
import JsonForm from './JsonForm'
// const socket = io(cosmosInfo.socket);

const load_from = {
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

  switch(props.value){
    // case load_from.NONE:
    //   config_contents = <p> Choose one </p>
    //   plot_contents = <p> Set Plot Configuration </p>
    // break;
    case load_from.JSON:
      config_contents = <JsonForm onChangeJson={props.onChangeJson} updateInfo={props.onChangeForm} />
    break;
    case load_from.SAVED:
      config_contents = <p>select config </p>
    break;
    case load_from.NEW:
    var entries = props.entries;

      config_contents = entries.map(function(p, index){

            return <PlotForm key={index} id={index} info={p} updateInfo={props.onChangeForm}/>;
          });

    break;
    default:
      config_contents = <p> Choose one </p>
    break;
  }
  return (
    <div>
      <Select
        showSearch
        placeholder="Load Configuration From"
        onChange={props.onChange}
        style={{width: '300px'}}
        value={props.value}
      >
        <Option value={load_from.JSON}>JSON File</Option>
        <Option value={load_from.SAVED}>Saved Configuration</Option>
        <Option value={load_from.NEW}>New Configuration</Option>
      </Select>
      {config_contents}
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
class CosmosAgentDB extends Component {
/* CosmosPlot using .json configuration file */
  constructor(props){
    super(props);
      this.state = {
        key:'config_tab',
        load_from:[],
        cosmosPlotEntries:[]
      };


  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {


  }
  componentWillUnmount() {

  }
  onTabChange = (key, type) => {
    // console.log(key, type);
    var state = this.state;
    state.key=key;
    this.setState(state);
  }
  changeConfigSource(value){
    var state = this.state;
    state.load_from=value;
    if(value===load_from.NEW){
      // add new empty agent
      state.cosmosPlotEntries=[new CosmosPlotEntry()];
    }
    this.setState(state);
  }
  changeJson(jsonArray){
    // called from JsonForm when a new json file is chosen
    var entries = [];
    for(var i=0; i < jsonArray.length; i++){
      entries.push(new CosmosPlotEntry(jsonArray[i]));
    }
    var state= this.state;
    state.cosmosPlotEntries = entries;
    console.log(entries)
    this.setState(state);
  }
  plotFormUpdated(value){
    // called from PlotForm when selected values change
    var state= this.state;
    state.cosmosPlotEntries[value.id].agent = value.agent;
    state.cosmosPlotEntries[value.id].values = value.values;
  }

  render() {



    const contentList = {
      config_tab: <ConfigTabContent
                      onChange={this.changeConfigSource.bind(this)}
                      entries={this.state.cosmosPlotEntries}
                      onChangeJson={this.changeJson.bind(this)}
                      onChangeForm={this.plotFormUpdated.bind(this)}
                      value={this.state.load_from}/>,
      plot_tab:<PlotTabContent
                      value={this.state.load_from}
                      entries={this.state.cosmosPlotEntries}
                      />
    };


    return (

      <div>
        <Navbar current="dataplot" />
        <div>
        <Card
          style={{ width: '100%' }}
          title="Data Plot"
          tabList={tabList}
          activetabkey={this.state.key}
          onTabChange={(key) => { this.onTabChange(key, 'key'); }}
        >
          {contentList[this.state.key]}
        </Card>

        </div>
      </div>


    );



  }

}

export default CosmosAgentDB;
