import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {  Alert , Slider, Modal, Form, Input} from 'antd';

import CosmosWidget from './../CosmosWidgetComponents/CosmosWidget'
import CosmosWidgetInfo from './../CosmosWidgetComponents/CosmosWidgetInfo'
import { AgentSelect, DataNameSelect } from './../CosmosWidgetComponents/FormComponents'
import { utc2date , convertTimetoDate, mjd2cal, plot_form_datalist} from './../Cosmos/Libs'
import { LineChart, Line ,XAxis, YAxis, Tooltip, ResponsiveContainer, Label} from 'recharts';
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
class PlotWidget extends Component {
  constructor(props) {
    const info = props.info;
    super(props);
      this.state = {
        slider:0,
        fix_slider:true,
        show_form: false,
        data : [],
        form_valid: true, // validation
        datanameslist: [],
        prevDataNames:[],
        form: {          // keeps track of form changes
          agent: '',
          node: '',
          data_name: [],
          plot_labels : [ '',''],
          xRange : null,
          title: ''
        }
      };
  }
  
  componentDidUpdate(prevProps){ // save incoming data to state

    if(prevProps.data.agent_utc!== this.props.data.agent_utc){
        var data= this.state.data;
        var new_data = this.props.data;
        data=[...data,new_data]
        this.setState({data:data})

    }
  }

  sliderChange(value){
    var fix = false;
    if(value===this.props.data.length-1){
      fix=true;
    }
    this.setState({slider:value, fix_slider:fix});
  }

  scaleSlider(val){
    return utc2date(this.props.data[val].agent_utc);
  }
  openForm(){
    this.setState({
      show_form:true,
      form :{
        agent: this.props.info.agent,
        node: this.props.info.node,
        data_name: this.props.info.data_name,
        plot_labels : [this.props.info.plot_labels[0],this.props.info.plot_labels[1]],
        xRange : this.props.info.xRange,
        title: this.props.info.title
      }
    });
    // this.setState({show_form:true})
  }
  closeForm(){
    this.setState({show_form:false});
  }
  // form functions
  initializeAgent(agent){
    // console.log("setup form")
    this.selectAgent(agent);
  }
  selectAgent (value) {
    // console.log('selectAgent')
    const agent_name = value.agent.agent_proc;
    const node_name = value.agent.agent_node;

    var agentDataStructure = value.agent.structure;
    var form = this.state.form;

    if(agentDataStructure){
      const tree_data = plot_form_datalist(agentDataStructure);
      if(form.agent !== agent_name && form.agent!== ''){ // empty dataset selected if agent changes
        form.data_name = [];
      }
      if(agent_name !== this.props.info.agent && form.agent == this.props.info.agent){
        const prevNames = this.state.datanameslist;
        this.setState({prevDataNames: prevNames});
      }
      form.agent = agent_name;
      form.node = node_name;

      this.setState({form:form, datanameslist: tree_data });
    }

  }
  selectDataName (value) {
    var form = this.state.form;
    form.data_name = value;
    this.setState({form:form})
  }
  handleFieldChange=(e)=> {
    var form = this.state.form;
    switch(e.target.id){
      case 'xLabel':
        form.plot_labels[0]=e.target.value;
        break;
      case 'yLabel':
        form.plot_labels[1]=e.target.value;
        break;
      default:
        form[e.target.id] = e.target.value;
        break;
    }
    this.setState({form:form});

    e.preventDefault();

  }
  onOK(){
    var valid = true;
    // validate form here
    if(this.state.form.agent ==='') valid = false;
    if(this.state.form.data_name.length <1) valid = false;

    if(valid){

      this.props.updateInfo(this.props.id,this.state.form);
      this.closeForm();
    } else { this.setState({form_valid:false})}

  }
  onCancel (){

    if(this.state.form.agent !== this.props.info.agent ){
      const prevDataNames = this.state.prevDataNames;
      this.setState({datanameslist: prevDataNames })
    }
    this.setState({ form:{
        agent: this.props.info.agent,
        node: this.props.info.node,
        data_name: this.props.info.data_name,
        plot_labels : [this.props.info.plot_labels[0], this.props.info.plot_labels[1]],
        xRange : this.props.info.xRange,
        title: this.props.info.title
      },
      show_form : false
    });
    // this.closeForm();
  }
  render() {


    var data = [];
    data = this.state.data;

    var plot_domain;
    var start_time, end_time, slider;
    if(data.length>0) {
      var lines=[];
      var Plots;
      for(var i =0; i < this.props.info.values.label.length; i++){
        lines.push(
          <Line type="monotone"
            dataKey={this.props.info.values.label[i]}
            key={String(i)}
            stroke={colors[i%colors.length]}
            animationDuration={1}
            />)
      }
      start_time =data[data.length-1].agent_utc - (this.props.info.xRange/1440);
      end_time=data[data.length-1].agent_utc;
      plot_domain=['auto','auto'];
      // if(data[0].agent_utc < start_time){ // show slider
      //
      //   if(this.state.fix_slider){
      //     plot_domain=[start_time, end_time];
      //     // data=data.splice()
      //     slider = <Slider value={end_time}
      //       min={0}sssssss
      //       max={data.length-1}
      //       onChange={this.sliderChange.bind(this)}
      //       tipFormatter={this.scaleSlider.bind(this)}
      //       />
      //   }
      //   else {
      //     plot_domain=[data[this.state.slider].agent_utc-(this.props.info.xRange/1440), data[this.state.slider].agent_utc];
      //     slider = <Slider value={this.state.slider}
      //       min={0}
      //       max={data.length-1}
      //       onChange={this.sliderChange.bind(this)}
      //       tipFormatter={this.scaleSlider.bind(this)}
      //       />
      //   }
      //
      // }
      Plots=
      <div>

          <h4 style={{textAlign:'center'}}> {this.props.info.title} </h4>
          <ResponsiveContainer width="100%" height={400}>

            <LineChart data={data}>
              <XAxis dataKey="agent_utc"  type = 'number' allowDataOverflow={true} domain={plot_domain}
              tickFormatter = {(unixTime) => moment(mjd2cal(unixTime).getTime()).format('YYYY-MM-DD hh:mm a')}>
              >
                <Label value={this.props.info.plot_labels[0]} offset={0} position="insideBottom" />
              </XAxis>
              <YAxis domain={['auto','auto']} >
                <Label value= {this.props.info.plot_labels[1]} angle={-90}   position="insideLeft" />
              </YAxis>
              <Tooltip labelFormatter={(val) => { return utc2date(val)}}/>
              {lines}
            </LineChart>
          </ResponsiveContainer>
          {slider}
      </div>

    } else {
      Plots = <Alert message="No data available" type="error" showIcon />
    }

    const form_style =  {};
    return (
      <CosmosWidget
        id = {this.props.id}
        title = {'['+this.props.info.node+'] '+this.props.info.agent}
        mod = {this.props.mod}
        selfDestruct = {this.props.selfDestruct}
        editWidget = {this.openForm.bind(this)}
      >
        <Modal
          visible={ this.state.show_form }
          title="Widget Settings"
          onOk={this.onOK.bind(this)}
          onCancel={this.onCancel.bind(this)}
        >
          <Form layout="inline" >
            <AgentSelect
              agent = {this.state.form.agent}
              onMount = {this.initializeAgent.bind(this)}
              onChange = {this.selectAgent.bind(this)}
            />
            <DataNameSelect
              value = {this.state.form.data_name}
              onChange = {this.selectDataName.bind(this)}
              allNames ={this.state.datanameslist}
            />
            <Form.Item label="Title" key="title">
              <Input placeholder="Title"
              id="title"
              onChange={this.handleFieldChange}
              value={this.state.form.title}
              style={form_style}/>
            </Form.Item>
            <Form.Item label="X-Axis Label" key="xLabel">
              <Input placeholder="Label"
              id="xLabel"
              onChange={this.handleFieldChange}
              value={this.state.form.plot_labels[0]}
              style={form_style}/>
            </Form.Item>
            <Form.Item label="Y-Axis Label" key="yLabel">
              <Input placeholder="Label"
              id="yLabel"
              onChange={this.handleFieldChange}
              value={this.state.form.plot_labels[1]}
              style={form_style}/>
            </Form.Item>
            <Form.Item label="Time Range (minutes)" key="xRange">
              <Input placeholder="Time Range (minutes)"
              id="xRange"
              onChange={this.handleFieldChange}
              value={this.state.form.xRange}
              style={form_style}/>
            </Form.Item>
          </Form>
          {!this.state.form_valid &&  <Alert message="Incomplete" type="warning" showIcon />}
        </Modal>
        {Plots}
      </CosmosWidget>
    );


  }
}
PlotWidget.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.instanceOf(CosmosWidgetInfo).isRequired,
  selfDestruct: PropTypes.func.isRequired,
  updateInfo: PropTypes.func.isRequired
}
export default PlotWidget;
