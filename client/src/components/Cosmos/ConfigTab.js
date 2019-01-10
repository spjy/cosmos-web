import React, { Component } from 'react';
import { Button, Icon, Modal , Select, Form, Input, Alert} from 'antd';
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

    this.state = {
      view_modal:false,
      info:this.props.info,
      form_validated: true
    };

  }
  componentDidMount() {
    // console.log("entries",this.props.entries)
    // socket.on('agent update list', (data) => { // subscribe to agent
    //   if (data) {
    //     var agents = this.props.entries;
    //     for(var i=0; i < this.props.entries.length; i++){
    //         if(data[agents[i].agent]) {
    //           agents[i].live=true;
    //         }
    //
    //     }
    //     this.props.updateAgentStatus(agents);
    //   }
    // });
  }
  componentWillUnmount(){
    // socket.removeAllListeners('agent update list');
  }
  openModal(){
    this.setState({view_modal:true})
  }
  onSelectSource(val){
    this.setState({info:{
      name: '',
      desc:'',
      author:'',
      id: 0
    }});
    this.props.onChangeConfigSource(val);
  }
  validateForm(){
    var valid = true;
    if(this.state.info.name.length <1 )  valid = false;
    if(this.state.info.desc.length <1 ) valid = false;
    if(this.state.info.author.length <1 ) valid = false;
    this.setState({form_validated: valid})
    return valid;
  }
  onSave(){
    // TO DO: form validation
    this.setState({loading:true});
    if(this.validateForm()===true){
      var info= this.state.info;
      this.props.saveConfig(info);
      this.setState({view_modal:false});
    }
    this.setState({loading:false});

  }
  onUpdate(){
    this.setState({loading:true});
    this.validateForm();
    if(this.validateForm()===true){
      var info= this.state.info;
      this.props.updateConfigDB(info);
      this.setState({view_modal:false});
    }
    this.setState({loading:false});

  }
  onCancel(){
    this.setState({view_modal:false});
  }
  loadConfig(config){
    // info = { name: , desc: , author: }
    // this.props.onChangeJson(jsonarr)
    this.setState({
      info:{
        name:config.name,
        desc: config.description,
        author: config.author,
        id:config._id }});
    this.props.onChangeJson(config.json);
    this.props.dbSelected({
      name:config.name,
      desc: config.description,
      author: config.author,
      id:config._id })
  }
  handleFieldChange(event){
    var info=this.state.info;
    info[event.target.id] = event.target.value
    this.setState({info: info});

  }

  render() {
    var entries = this.props.entries;
    var json_form;
    var save_config;
    var add_plot;
    var db_select;
    var plot_forms=[];
    switch(this.props.currentConfigSource){
      case import_type.JSON:
        json_form = <JsonForm onChangeJson={this.props.onChangeJson} />

      break;
      case import_type.SAVED:
        db_select = <ConfigSelectForm onSelect={this.loadConfig.bind(this)} id={this.state.info.id}/>
      break;
      case import_type.NEW:
        add_plot = <Button type="default" onClick={this.props.addPlot}>
                    <Icon type="plus"/> Add
                  </Button>
      break;
      default:

      break;

    }
    if(entries.length>0) {
      add_plot = <Button type="default" onClick={this.props.addPlot}>
                  <Icon type="plus"/> Add
                </Button>
      save_config = <Button type="default" onClick={this.openModal.bind(this)}>
                  <Icon type="save"/> Save Configurations
                </Button>
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
    var validation;
    if(this.state.form_validated!==true){
      validation=<Alert message="All fields required" type="warning" showIcon />
    }
    var modal_buttons = [  <Button key="back" onClick={this.onCancel.bind(this)}>Cancel</Button>,
                <Button key="save" type="primary" loading={this.state.loading} onClick={this.onSave.bind(this)}>
                  Save As New Entry
                </Button>];
    if(this.state.info.id !== 0){
      modal_buttons.push(
      <Button key="update" type="primary" loading={this.state.loading} onClick={this.onUpdate.bind(this)}>
        Update Entry
      </Button>);
    }
    var save_modal =  <Modal
              visible={this.state.view_modal}
              title="Configuration Detail"
              onCancel={this.handleCancel}
              footer={modal_buttons}
            >
            <Form layout="vertical" >
              <Form.Item label="Name">
                <Input placeholder="Name"
                  id="name"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.state.info.name}
                />
              </Form.Item>
              <Form.Item label="Author">
                <Input placeholder="Author"
                  id="author"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.state.info.author}
                />
              </Form.Item>
              <Form.Item label="Description">
                <Input placeholder="Description"
                  id="desc"
                  onChange={this.handleFieldChange.bind(this)}
                  value={this.state.info.desc}
                />
              </Form.Item>
              {validation}
            </Form>

            </Modal>
    return (
      <div>
      {save_modal}
        <Select
          showSearch
          placeholder="Load Configuration From"
          onChange={this.onSelectSource.bind(this)}
          style={{width: '300px'}}
          value={this.props.currentConfigSource}
        >
          <Option value={import_type.NONE}>Select Configuration Source</Option>
          <Option value={import_type.JSON}>JSON File</Option>
          <Option value={import_type.SAVED}>Saved Configuration</Option>
          <Option value={import_type.NEW}>New Configuration</Option>
        </Select>
        {json_form}
        {db_select}
        {plot_forms}
        {add_plot}
        {save_config}
      </div>
      );
  }

}

export default ConfigTab;
