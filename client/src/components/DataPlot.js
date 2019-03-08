import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import CosmosWidgetConfig from './Cosmos/CosmosWidgetConfig'
import CosmosPlot from './Cosmos/CosmosPlot'
import ConfigTab ,{import_type} from './Cosmos/ConfigTab'
import {  Card } from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo'
import { get_all_agent_info , update_agent_info} from './Cosmos/CosmosPlotLibs'

const socket = io(cosmosInfo.socket);


const tabList = [{
  key: 'config_tab',
  tab: 'Configure',
}, {
  key: 'plot_tab',
  tab: 'Plot',
}];

class DataPlot extends Component {
  constructor(props){
    super(props);
      this.state = {
        tab_key:'config_tab',
        config_source: import_type.NONE,
        widgets:[],
        db_info:{
          name: '',
          desc:'',
          author:'',
          id: 0
        }
      };


  }
  componentDidMount() {
    socket.on('agent update list', (data) => { // subscribe to agent
      if (data) {
        var agents = this.state.widgets;
        for(var i=0; i < agents.length; i++){
            if(data[agents[i].agent]) {
              agents[i].live=true;
              // console.log(agents[i].agent,"live")
            }

        }
        this.setState({widgets:agents});
      }
    });
  }
  componentWillUnmount(){
    socket.removeAllListeners('agent update list');
  }

  onTabChange = (key, type) => {
    // console.log(key, type);
    var state = this.state;
    state.tab_key=key;
    this.setState(state);
  }
  onChangeConfigSource(source){
    this.setState({
      config_source:source,
      widgets:[],
      db_info:{
        name: '',
        desc:'',
        author:'',
        id: 0
      }
    });

  }
  updateAgentStatus(entries){

    this.setState({widgets:entries});
  }
  clearEntries(){
    this.setState({widgets:[]});
  }
  onClickAddEntry(){
    var entry = new CosmosWidgetConfig();
    var entries = this.state.widgets;
    entries.push(entry);
    this.setState({widgets:entries});
  }

  importJsonArray(jsonArr){
    // called from JsonForm when a file is selected
    var entries = [];
    for(var i=0; i < jsonArr.length; i++){
      entries.push(new CosmosWidgetConfig(jsonArr[i]));
    }
    get_all_agent_info(entries).then((result)=>{
      this.setState({widgets:entries});
      console.log(entries)
    });


  }
  removeEntry(index){
    /* called from PlotForm::onClickDelete()
     */
    var saved_state = this.state;
    saved_state.widgets.splice(index,1);
    this.setState(saved_state);
  }
  updateEntry( new_vals){
    /* called from PlotForm::onClickSave()
      new_vals = {  id: ,  agent: ,  values:  }
     */
    var entries = this.state.widgets;
    update_agent_info(entries[new_vals.id], new_vals).then((result)=>{
      this.setState({widgets:entries});
    });
  }
  updateConfig(obj){
    var saved_state = this.state;
    saved_state.widgets[obj.id][obj.key] = obj.value;
    this.setState(saved_state);
  }

  saveConfig(info){
    var jsonArr = [];
    for(var i =0; i < this.state.widgets.length; i++){
      jsonArr.push(this.state.widgets[i].to_json());
    }
    var config={
      name:info.name,
      description: info.desc,
      author: info.author,
      created: new Date(),
      edited: new Date(),
      json: jsonArr
    }
    // console.log("SAVE CLICKED")
    this.setState({db_info:info});
    socket.emit("save plot_config", config);
  }
  updateDBconfig(info){
    var jsonArr = [];
    for(var i =0; i < this.state.widgets.length; i++){
      jsonArr.push(this.state.widgets[i].to_json());
    }
    var msg = {
      id: info.id,
      data: {
        name:info.name,
        description: info.desc,
        author: info.author,
        edited: new Date(),
        json: jsonArr
      }
    }
    this.setState({db_info:info});
    socket.emit("update plot_config", msg);
  }
  dbSelected(info){
    this.setState({db_info:info})
  }
  render() {

    var plotentries = this.state.widgets;
    var plot_contents=[];
    for(var i = 0; i < plotentries.length; i++){
      plot_contents.push(
        <CosmosPlot info={plotentries[i]} key= {i}/>
      );
    }
    const contentList = {
      config_tab:
        <ConfigTab
                      onChangeConfigSource={this.onChangeConfigSource.bind(this)}
                      entries={this.state.widgets}
                      onChangeJson={this.importJsonArray.bind(this)}
                      updatePlotInfo={this.updateEntry.bind(this)}
                      currentConfigSource={this.state.config_source}
                      addPlot={this.onClickAddEntry.bind(this)}
                      selfDestruct={this.removeEntry.bind(this)}
                      updateValue={this.updateConfig.bind(this)}
                      saveConfig={this.saveConfig.bind(this)}
                      updateAgentStatus={this.updateAgentStatus.bind(this)}
                      clearEntries={this.clearEntries.bind(this)}
                      updateConfigDB={this.updateDBconfig.bind(this)}
                      info={this.state.db_info}
                      dbSelected={this.dbSelected.bind(this)}
                      />,

      plot_tab: <div> {plot_contents}</div>

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
