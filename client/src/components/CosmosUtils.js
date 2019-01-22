import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import {  Card , Button , Modal , Icon , Select, Alert} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo'
import CosmosWidget , {widgetType} from './Cosmos/CosmosWidget'
import PlotForm from './Cosmos/PlotForm'
import CosmosWidgetConfig from './Cosmos/CosmosWidgetConfig'
import { parse_live_data , update_agent_info} from './Cosmos/CosmosPlotLibs'
const socket = io(cosmosInfo.socket);



class CosmosUtils extends Component {
  constructor(props){
    super(props);
      this.state = {
        view_modal :false,
        widget_form: new CosmosWidgetConfig(),
        widget_form_type:widgetType.NONE,
        agents: {},
        widgets: [],
        invalid_form:false
      };


  }
  componentDidMount() {

  }
  componentWillUnmount(){
    var agents = Object.keys(this.state.agents);
    for(var i=0; i< agents.length; i++){
      socket.removeAllListeners('agent subscribe '+agents[i]);
    }
  }

  onClickAddWidget(){
    this.setState({view_modal:true});
  }

  plotFormAgentSelected(obj){
    var widget_form= this.state.widget_form;
    update_agent_info(widget_form, obj).then((result)=>{
      this.setState({widget_form:widget_form});
    });
    // console.log("agent selected",obj)
  }
  updateFormValue(obj){
    // console.log("update form value", obj)
    var widget_form= this.state.widget_form;
    widget_form[obj.key] = obj.value;
    this.setState({widget_form:widget_form});
  }
  saveWidget(){
    if(this.validateForm()){
      // check if agent in this.state.agents
      var widget_form = this.state.widget_form;
      var agents = this.state.agents;
      var widgets = this.state.widgets;
      var agent, new_widget;
      // console.log(widget_form)
      if(this.state.agents[widget_form.agent]){
        agent = this.state.agents[widget_form.agent].info;
        for(var i=0; i < widget_form.jsonvalues.length; i++){
          agent.addvalue(widget_form.jsonvalues[i].data);
        }
      }
      else{
        agent = widget_form;
        // add new listener
        this.startListening(agent.agent);
      }
      agents[widget_form.agent] = {info:agent, data:{}};
      var new_widget={type:this.state.widget_form_type, agent: agent.agent, data_name:[]}
      for(var i=0; i < widget_form.jsonvalues.length;i++){
        new_widget.data_name.push(widget_form.jsonvalues[i].data);
      }
      widgets.push(new_widget);
      // console.log(agents)
      this.setState({view_modal:false, agents: agents, widgets: widgets, widget_form:new CosmosWidgetConfig(), widget_form_type:widgetType.NONE})
    }

  }
  validateForm(){
    var valid = true;
    if(this.state.widget_form_type===widgetType.NONE){
      // console.log("no widget type")
       valid=false;
     }
    else if(this.state.widget_form.agent===""){
      valid=false;
      // console.log("no agent")
    }
    else if(this.state.widget_form.values.label.length ===0){
      // console.log("no data")
      valid=false;
    }
    this.setState({invalid_form:!valid})
    return valid;
  }
  hideModal(){
    this.setState({view_modal:false, widget_form:new CosmosWidgetConfig(), widget_form_type:widgetType.NONE})
  }
  selectWidgetType(val){
    // console.log("widget type select", val)
    this.setState({widget_form_type:val})
  }
  startListening(agentname){
    socket.emit('start record', agentname);
    socket.on('agent subscribe '+agentname, (data) => { // subscribe to agent
      if (data) {
      var agents = this.state.agents;
      if(agents[agentname].info.values.label.length>0){
        agents[agentname].data = parse_live_data(data, agents[agentname].info.values);
        this.setState({agents:agents});
      }
      }
    });
  }

  render() {

    var widget=[];
    for(var i=0; i<this.state.widgets.length; i++){
      // console.log(this.state.agents[this.state.widgets[i].agent].info)
      widget.push(<CosmosWidget key={i} config ={this.state.widgets[i]}
        info={this.state.agents[this.state.widgets[i].agent].info}
        data={this.state.agents[this.state.widgets[i].agent].data} />)
    }
    // console.log("num widgets", widget.length)
    const Option = Select.Option;
    var form_validation;
    if(this.state.invalid_form){
      form_validation=<Alert message="Form Incomplete" type="warning" showIcon />
    }
    return (

      <div>
        <Navbar current="cosmosutils" />
        <Modal
            visible={this.state.view_modal}
            title="Add Widget"
            onOk={this.saveWidget.bind(this)}
            onCancel={this.hideModal.bind(this)}
          >
            <Select onChange={this.selectWidgetType.bind(this)} style={{ width: 200 }} value={this.state.widget_form_type}>
              <Option value={widgetType.NONE}>Select Widget Type</Option>
              <Option value={widgetType.LIVE_PLOT}>Live Plot</Option>
              <Option value={widgetType.COSMOS_DATA}>Data Box</Option>
            </Select>
                <PlotForm
                key={i}
                id={i}
                info={this.state.widget_form }
                updateInfo={this.plotFormAgentSelected.bind(this)}
                updateValue={this.updateFormValue.bind(this)}/>
                {form_validation}
          </Modal>
        <div style={{margin:'20px'}}>
          <Card
            style={{ width: '100%' }}
          >
            {widget}
          <Button type="default" onClick={this.onClickAddWidget.bind(this)}><Icon type="plus"/> Add Widget </Button>
          </Card>

          </div>
      </div>


    );



  }

}

export default CosmosUtils;
