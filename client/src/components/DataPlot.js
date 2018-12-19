import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import JsonForm from './Cosmos/JsonForm'
import CosmosPlotEntry from './Cosmos/CosmosPlotEntry'
import PlotForm from './Cosmos/PlotForm'
import CosmosPlot from './Cosmos/CosmosPlot'
import { Select , Card , Button, Icon} from 'antd';

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
  switch(props.currentConfigSource){
    case import_type.JSON:
      config_contents = <JsonForm onChangeJson={props.onChangeJson} />
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
                selfDestruct={props.selfDestruct}/>;
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

  var plotentries = props.entries;
  var plot_contents=plotentries.map(function(p, index){
    return <CosmosPlot
                key={index}
                id={index}
                info={p} />;
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
  }

  onTabChange = (key, type) => {
    // console.log(key, type);
    var state = this.state;
    state.tab_key=key;
    this.setState(state);
  }
  onChangeConfigSource(source){
    console.log('changesource',source)
    var state = this.state;
    state.config_source = source;
    state.cosmosPlotEntries =[];
    this.setState(state);

  }
  onClickAddConfig(){
    var entry = new CosmosPlotEntry();
    var state = this.state;
    state.cosmosPlotEntries.push(entry);
    this.setState(state);
  }

  importJsonArray(jsonArr){
    // called from JsonForm when a file is selected
    var state = this.state;
    var entries = [];
    var result;
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
    console.log("goodbye",index)
    var saved_state = this.state;
    saved_state.cosmosPlotEntries.splice(index,1);
    this.setState(saved_state);
  }
  updateEntry( new_vals){
    /* called from PlotForm::onClickSave()
      new_vals = {  id: ,  agent: ,  values:  }
     */
    var state = this.state;
    update_agent_info(state.cosmosPlotEntries[new_vals.id], new_vals).then((result)=>{
      this.setState(state);
    });
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
