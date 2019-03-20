import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import {  Card , Button ,Form, Input,  Modal , Icon , Select, Alert} from 'antd';
import {plot_form_datalist} from './Cosmos/Libs'
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo'
import CosmosAgent  from './WidgetComponents/CosmosAgent'
import Widget , {widgetType}from './WidgetComponents/Widget'
import CosmosWidgetInfo from './WidgetComponents/CosmosWidgetInfo'
import ConfigForm from './WidgetComponents/ConfigForm'
import { parse_live_data , setup_agent } from './Cosmos/CosmosPlotLibs'
const socket = io(cosmosInfo.socket);


/* This component renders the entire 'Cosmos Tools'page including widgets
 - this component monitors COSMOS Agent data, and passes relevant data to each widget (does not store history, only one at a time )
*/
class CosmosTools extends Component {
  constructor(props){
    super(props);
      this.state = {
        agents: {},
        widgets: [],
        show_config_form:false,
        show_save_modal:false,
        db_info:{name:"",
          description:"",
          author:"",
          id: -1},
        save_form:{
          name:"",
          description:"",
          author:""}
      };


  }
  componentDidMount() {

  }
  componentWillUnmount(){
    var agents = Object.keys(this.state.agents);
    for(var i=0; i< agents.length; i++){
      socket.removeAllListeners('agent subscribe '+agents[i]);
      socket.emit('end record', agents[i]);
    }
  }

  onClickAddWidget(){
    var widgets = this.state.widgets;
    var w = new CosmosWidgetInfo({})
    widgets.push(w)
    this.setState({widgets:widgets})

  }

  startListening(agentname){
    // console.log("listening ",agentname)
    socket.emit('start record', agentname);
    socket.on('agent subscribe '+agentname, (data) => { // subscribe to agent
      if (data) {
        var e;
        var agents = this.state.agents;
        if(agents[agentname].info.values.label.length>0){
          e= parse_live_data(data, agents[agentname].info.values);
          agents[agentname].data = e;
          this.setState({agents:agents});
        }
      }
    });
  }
  updateWidget(e){
    // console.log("CosmosTools:updateWidget");
    var widgets = this.state.widgets;
    widgets[e.id]=e.form;
    var agent_list = this.state.agents;
    var cosmosAgent;
    var agent_name = e.form.agent;
    // console.log(e.form.data_name)
    if(agent_name!=="" ){
      if(agent_list[agent_name]){
        cosmosAgent=this.state.agents[agent_name];
        widgets[e.id].values=cosmosAgent.info.get_data_structure(e.form.data_name);

        this.setState ({widgets:widgets});
        if(e.form.widget_type=== widgetType.LIVE_PLOT || e.form.widget_type === widgetType.COSMOS_DATA){
          this.startListening(agent_name);
        }
      }
      else {
        cosmosAgent = new CosmosAgent({agent:agent_name});
        setup_agent(cosmosAgent).then((result)=>{

          var agent_list = this.state.agents;
          var widgets = this.state.widgets;
          agent_list[agent_name]={info:cosmosAgent, data:{}};
          widgets[e.id].values=cosmosAgent.get_data_structure(e.form.data_name);
          // console.log(widgets[e.id].values  )
          this.setState ({widgets:widgets,agents:agent_list});
          // console.log(e.form)
          if(e.form.widget_type=== widgetType.LIVE_PLOT || e.form.widget_type === widgetType.COSMOS_DATA){
            this.startListening(agent_name);
          }
        });
      }

    }


  }

  removeWidget(index){
    var widgets = this.state.widgets;
    widgets.splice(index.id,1);
    if(widgets.length===0){
      this.setState({widgets:widgets,
        db_info:{name:"",
          description:"",
          author:"",
          id: -1},
        save_form:{
          name:"",
          description:"",
          author:""}
        });

    }
    else {
      this.setState({widgets:widgets});
    }


  }
  agentStructure(agent_name){
    var agents=this.state.agents;
    if(agents[agent_name]){
      return agents[agent_name].info.structure;
    }
    else {

      return;
    }
  }
  newAgent(cosmosAgent){
    // console.log("cosmostools newAgent", cosmosAgent.agent)
    var agent_list = this.state.agents;
    var agent_name = cosmosAgent.agent;
    agent_list[agent_name] = {info:cosmosAgent, data:{}};
    this.setState({agents:agent_list});
  }


  loadConfiguration(config){
    //set this.state.widgets = config
    // setup agents
    // set configForm modal visible false
    this.setState({
      db_info:{name:config.name,
        description:config.description,
        author:config.author,
        id: config._id},
      save_form:{
        name:config.name,
        description:config.description,
        author:config.author},
      widgets:config.widgets
    });

  }
  showConfigForm(){
    this.setState({show_config_form:true});
  }
  hideConfigForm(){
    this.setState({show_config_form:false});
  }
  /* functions for Modal Form*/
  handleFieldChange(event){
    var info=this.state.save_form;
    info[event.target.id] = event.target.value
    this.setState({save_form: info});
  }
  showSaveModal(){
    this.setState({show_save_modal:true, form_validated:true});
  }
  cancelSave(){
    var form_values={
      name:this.state.db_info.name,
      description:this.state.db_info.description,
      author:this.state.db_info.author};
    this.setState({show_save_modal:false, save_form:form_values});

  }
  validateForm(){
    var valid = true;
    // console.log("validating", this.state.save_form)
    if(this.state.save_form.name==="") valid=false;
    else if(this.state.save_form.description==="") valid=false;
    else if(this.state.save_form.author==="") valid=false;
    this.setState({form_validated:valid});
    return valid;
  }
  onClickSaveUpdate(){ // "update" button in Save modal
    if(this.validateForm()){

      const msg ={
        id:this.state.db_info.id,
        data :{
          name:this.state.save_form.name,
          description: this.state.save_form.description,
          author:this.state.save_form.author,
          edited: new Date(),
          widgets: this.state.widgets
        }
      };
      socket.emit('update widget_config', msg);
      var db = {
          name:this.state.save_form.name,
          description: this.state.save_form.description,
          author:this.state.save_form.author,
          id: this.state.db_info.id
      };
      this.setState({db_info:db,show_save_modal:false });
    }

  }
  onClickSaveNew(){ //  "save new" button in save modal
    if(this.validateForm()){
      const data ={
        name:this.state.save_form.name,
        description: this.state.save_form.description,
        author:this.state.save_form.author,
        created: new Date(),
        edited: new Date(),
        widgets: this.state.widgets
      };
      socket.emit('save widget_config', data, this.saveCallback.bind(this));

    }
  }
  saveCallback(msg){
    // console.log("callback msg", msg.id)
    var db = {
      name: this.state.save_form.name,
      description: this.state.save_form.description,
      author: this.state.save_form.author,
      id: msg.id
    }
    this.setState({db_info: db, show_save_modal: false});
  }

  render() {
    var widget=[];
    var data={};
    for(var i=0; i<this.state.widgets.length; i++){
      if(this.state.agents[this.state.widgets[i].agent]) {
        data =this.state.agents[this.state.widgets[i].agent].data
        // console.log("data", data)
        // console.log("widget", this.state.widgets[i])
      }
      widget.push(<Widget key={i} id={i}
        info={this.state.widgets[i]}
        data={data}
        newAgent={this.newAgent.bind(this)}
        updateWidget={this.updateWidget.bind(this)}
        selfDestruct={this.removeWidget.bind(this)}
        agentStructure ={this.agentStructure.bind(this)}/>)
    }
    var saveButton;
    if(this.state.widgets.length>0){
      //only show "Save Widgets" button when there is at least one widget
      saveButton=<Button type="default" onClick={this.showSaveModal.bind(this)}>
            <Icon type="save"/> Save Widgets
          </Button>
    }
    /* Modal form elements */
    var validation;
    if(!this.state.form_validated){
      validation=<Alert message="All fields required" type="warning" showIcon />
    }
    var modal_buttons = [  <Button key="back" onClick={this.cancelSave.bind(this)}>Cancel</Button>,
      <Button key="save" type="primary" onClick={this.onClickSaveNew.bind(this)}>Save As New Entry</Button>];
    if(this.state.db_info.id !== -1){
      modal_buttons.push(
      <Button key="update" type="primary"  onClick={this.onClickSaveUpdate.bind(this)}>
        Update Entry
      </Button>);
    }
    var configForm;
    if(this.state.show_config_form){
      configForm = <ConfigForm
        onSelect={this.loadConfiguration.bind(this)}
        hide={this.hideConfigForm.bind(this)}/>
    }
    var load_widgets_button;
    if(this.state.widgets.length===0){
      load_widgets_button=<Button type="default" onClick={this.showConfigForm.bind(this)}> Load Widgets </Button>
    }


    return (

      <div>
        <Navbar current="cosmostools" />
        <div >
          <Modal
            visible={this.state.show_save_modal}
            title="Configuration Detail"
            onCancel={this.cancelSave.bind(this)}
            footer={modal_buttons}
          >
          <Form layout="vertical" >
            <Form.Item label="Name">
              <Input placeholder="Name"
                id="name"
                onChange={this.handleFieldChange.bind(this)}
                value={this.state.save_form.name}
              />
            </Form.Item>
            <Form.Item label="Author">
              <Input placeholder="Author"
                id="author"
                onChange={this.handleFieldChange.bind(this)}
                value={this.state.save_form.author}
              />
            </Form.Item>
            <Form.Item label="Description">
              <Input placeholder="Description"
                id="description"
                onChange={this.handleFieldChange.bind(this)}
                value={this.state.save_form.description}
              />
            </Form.Item>
            {validation}
          </Form>

          </Modal>
          {configForm}
          <Card size="small" style={{ width: '100%' }} >
            {load_widgets_button}

              {widget}
            <Button type="default" onClick={this.onClickAddWidget.bind(this)}><Icon type="plus"/> New Widget </Button>
            {saveButton}
          </Card>

          </div>
      </div>


    );



  }

}

export default CosmosTools;
