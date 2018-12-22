import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import JsonForm from './Cosmos/JsonForm'
import CosmosPlotEntry from './Cosmos/CosmosPlotEntry'
import PlotForm from './Cosmos/PlotForm'
import CosmosPlotLive from './Cosmos/CosmosPlotLive'
import { Select , Card , Button, Icon} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo'
const socket = io(cosmosInfo.socket);

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
async function update_agent_info(cosmos_plot_entry, info){
  await cosmos_plot_entry.update(info);

}
async function get_all_agent_info(cosmos_plot_entries){
  for(var i =0; i < cosmos_plot_entries.length; i++){
    await cosmos_plot_entries[i].setup_agent();
  }
  return;
}
const Option = Select.Option;
function ConfigTabContent (props) {
  var config_contents; // contents of config tab
  var entries = props.entries;
  var json_form;
  switch(props.currentConfigSource){
    case import_type.JSON:
      json_form = <JsonForm onChangeJson={props.onChangeJson} />
      if(entries.length>0) {
        config_contents = <Button type="default" onClick={props.addPlot}>
                    <Icon type="plus"/> Add
                  </Button>
      }
    break;
    case import_type.SAVED:
      config_contents = <p>Select config </p>
    break;
    case import_type.NEW:
      config_contents = <Button type="default" onClick={props.addPlot}>
                  <Icon type="plus"/> Add
                </Button>
    break;
    default:
      config_contents = <p> Choose one </p>
    break;
  }
  var plot_forms = entries.map(function(p, index){
    return <PlotForm
                key={index}
                id={index}
                info={p}
                updateInfo={props.updatePlotInfo}
                selfDestruct={props.selfDestruct}
                updateValue={props.updateValue}/>;
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
      {json_form}
      {plot_forms}
      {config_contents}
    </div>
    );
}
function PlotTabContent(props) {

  var plotentries = props.entries;
  var plot_contents=plotentries.map(function(p, index){
    return <CosmosPlotLive
                key={index}
                id={index}
                info={p}
                />;
              });
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
    socket.on('agent update list', (data) => { // subscribe to agent
      if (data) {
        var agents = this.state.cosmosPlotEntries;
        for(var i=0; i < this.state.cosmosPlotEntries.length; i++){
            if(data[agents[i].agent]) {
              // console.log( agents[i].agent," live")
              agents[i].live=true;
            }

        }
        this.setState({cosmosPlotEntries:agents})
      }
    });
  }

  onTabChange = (key, type) => {
    // console.log(key, type);
    var state = this.state;
    state.tab_key=key;
    this.setState(state);
  }
  onChangeConfigSource(source){
    var state = this.state;
    state.config_source = source;
    state.cosmosPlotEntries =[];
    this.setState(state);

  }
  onClickAddConfig(){
    var entry = new CosmosPlotEntry();
    var entries = this.state.cosmosPlotEntries;
    entries.push(entry);
    this.setState({cosmosPlotEntries:entries});
  }

  importJsonArray(jsonArr){
    // called from JsonForm when a file is selected
    var state = this.state;
    var entries = [];
    for(var i=0; i < jsonArr.length; i++){
      entries.push(new CosmosPlotEntry(jsonArr[i]));
    }
    get_all_agent_info(entries).then((result)=>{
      state.cosmosPlotEntries = entries;
      this.setState(state);
    });

  }
  removeEntry(index){
    /* called from PlotForm::onClickDelete()
     */
    var saved_state = this.state;
    saved_state.cosmosPlotEntries.splice(index,1);
    this.setState(saved_state);
  }
  updateEntry( new_vals){
    /* called from PlotForm::onClickSave()
      new_vals = {  id: ,  agent: ,  values:  }
     */
    var entries = this.state.cosmosPlotEntries;
    update_agent_info(entries[new_vals.id], new_vals).then((result)=>{
      this.setState(entries);
    });
  }
  updateConfig(obj){
    var saved_state = this.state;
    saved_state.cosmosPlotEntries[obj.id][obj.key] = obj.value;
    this.setState(saved_state);
  }

  render() {

    const contentList = {
      config_tab:
        <ConfigTabContent
                      onChangeConfigSource={this.onChangeConfigSource.bind(this)}
                      entries={this.state.cosmosPlotEntries}
                      onChangeJson={this.importJsonArray.bind(this)}
                      updatePlotInfo={this.updateEntry.bind(this)}
                      currentConfigSource={this.state.config_source}
                      addPlot={this.onClickAddConfig.bind(this)}
                      selfDestruct={this.removeEntry.bind(this)}
                      updateValue={this.updateConfig.bind(this)}
                      />,

      plot_tab: <PlotTabContent
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
