import React, { Component } from 'react';
import io from 'socket.io-client';
import { Card,  Button, Icon, Modal, Popover, Layout, Table, Alert, Col, Row} from 'antd';
import PlotWidget from './PlotWidget'
import ArchivePlotWidget from './ArchivePlotWidget'
import WidgetForm from './WidgetForm'
import cosmosInfo from './../Cosmos/CosmosInfo'
import AgentList from './../Cosmos/AgentList'
import {utc2date} from './../Cosmos/Libs'
const socket = io(cosmosInfo.socket);
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]
const ButtonGroup = Button.Group;
const {
  Header, Content, Footer, Sider,
} = Layout;

export const widgetType = {
  NONE: 0,
  LIVE_PLOT: 1,
  AGENT_COMMAND: 2,
  COSMOS_DATA:3,
  AGENT_LIST:4,
  ARCHIVE_PLOT:5
};
class Widget extends Component {

  constructor(props){
    super(props);
      this.state = {
        view_form:true,
        data:[],
        form:{},
        prevData:{},
        form_valid:true,
        node:""
      };
  }
  componentWillMount() {
    this.setState({form: this.props.info});
  }
  updateForm(e){
    var form=this.state.form;
    switch(e.key) {
      case ("xLabel"):
        form.plot_labels[0]= e.value;
      break;
      case ("yLabel"):
        form.plot_labels[1]= e.value;
      break;
      case ("command0"):
        form.command[0]= e.value;
      break;
      case ("args"):
        form.command[1]= e.value;
      break;
      default:
        form[e.key]=e.value;
      break;
    }
    this.setState({form:form})
  }
  onSaveForm(){
    var form = this.state.form;
    if(this.validateForm()) {
      this.props.updateWidget({form:form, id:this.props.id});
      this.setState({view_form:false})
    }
  }
  hideModal(){
    this.setState({view_form:false, form: this.props.info})
  }
  componentDidUpdate(prevProps){

    if(prevProps.data.agent_utc!== this.props.data.agent_utc){
      if(this.props.info.widget_type===widgetType.LIVE_PLOT){
        // console.log(this.props.data)
        var data= this.state.data;
        var new_data = this.props.data;
        data=[...data,new_data]
        // data[data.length]= new_data

        this.setState({data:data})
      }
    }
  }
  openModal(){
    this.setState({view_form:true})
  }
  validateForm(){
    var valid = true;

    if(this.state.form.widget_type===widgetType.NONE) valid= false;
    if(this.state.form.widget_type===widgetType.AGENT_COMMAND){
      if( this.state.form.command[0]==="")valid= false;
      if(this.state.form.agent==="") valid= false;
    }
    else if(this.state.form.widget_type===widgetType.COSMOS_DATA||
      this.state.form.widget_type===widgetType.LIVE_PLOT
    )
     {
      if(this.state.form.data_name.length<1) valid= false;
      if(this.state.form.agent==="") valid= false;
      if(this.state.form.xRange <= 0) valid = false;
    }

    this.setState({form_valid:valid})
    return valid;
  }
  setNode(nodename){
    this.setState({node:nodename});
  }
  onClickCommand(){
    this.setState({data:<Icon type="loading" />});
    socket.emit('agent_command',
      {agent: this.props.info.agent, node: this.state.node, command: this.props.info.command[0]+" "+this.props.info.command[0] },
      this.commandResponseReceived.bind(this));
  }
  selfDestruct(){
    this.props.selfDestruct({id:
      this.props.id});
  }
  commandResponseReceived(data){
    this.setState({data:<p style={{whiteSpace:'pre-wrap', wordWrap:'break-word'}} >{data.output}</p>})
  }
  render() {

    var content, table_data;
    // const table_cols = []

    const table_cols = [{title:"Name", dataIndex:"dataname"},{title:"Value", dataIndex:"value"}, {title:"Time", dataIndex:"time"}]
    // console.log("widget.data", this.state.data, this.props.data)
    if(!this.state.view_form){
      switch(this.props.info.widget_type){
        case(widgetType.LIVE_PLOT):
            table_data=[];
            for(var i=0; i < this.props.info.values.label.length; i++){
              table_data.push({key:i,
                dataname: <p style={{color:colors[i%colors.length]}}>{this.props.info.values.label[i]}</p>,
                value: this.props.data[this.props.info.values.label[i]]});
            }
            content =   <Row gutter={16}>
                <Col span={16} >
                  <PlotWidget info={this.props.info} plot_domain={['auto, auto']} data={this.state.data}/>
                  </Col>
                  <Col span={8} >
                    <Table columns={[{title:"Name", dataIndex:"dataname"},{title:"Value", dataIndex:"value"}]} dataSource={table_data} size="small"  pagination={false}/>
                  </Col>
                </Row>
        break;
        case(widgetType.ARCHIVE_PLOT):
            content =  <ArchivePlotWidget info={this.props.info} />;

        break;
        case(widgetType.AGENT_COMMAND):
          content =<div>
            <Button onClick={this.onClickCommand.bind(this)}>{this.props.info.title}</Button>
            <div style={{ overflowY:'scroll', height:'200px'}}>
              {this.state.data}
            </div>
          </div>
        break;
        case(widgetType.COSMOS_DATA):
          if(this.props.info.agent){
            table_data=[];
            for(var i=0; i < this.props.info.values.label.length; i++){
              table_data.push({key:i,
                dataname: this.props.info.values.label[i],
                value: this.props.data[this.props.info.values.label[i]],
                time: utc2date(this.props.data.agent_utc)})
            }
            content = <Table columns={table_cols} dataSource={table_data} size="small"  pagination={false}/>
          }

        break;
        case(widgetType.AGENT_LIST):
          content=<AgentList />
        break;
        default:

        break;
      }
    }
    var form_validation;
    if(!this.state.form_valid) form_validation= <Alert message="Incomplete" type="warning" showIcon />;

    const widget_style ={
      border:'1px solid #e1e6ef',
      background: '#fff',
      padding:'10px' ,
      margin:"10px",
      borderRadius: "10px"
    }

    return(
      <Layout style={widget_style}>
        <Modal
            visible={this.state.view_form}
            title="Add Widget"
            onOk={this.onSaveForm.bind(this)}
            onCancel={this.hideModal.bind(this)}
          >
          <WidgetForm info={this.state.form}
            updateForm={this.updateForm.bind(this)}
            newAgent={this.props.newAgent}
            setNode={this.setNode.bind(this)}
            structure={this.props.agentStructure}/>
            { form_validation}
        </Modal>
        <Content>
          <div style={{margin:"10px"}}> <p style={{display:"inline"}}><b>[{this.props.info.node}] {this.props.info.agent}</b></p>
          <ButtonGroup size="small" style={{display:"inline", float:"right"}}>
            <Button  onClick={this.openModal.bind(this)}><Icon type="setting"/></Button>
            <Button  onClick={this.selfDestruct.bind(this)}><Icon type="delete"/></Button>
          </ButtonGroup>
          </div>
          {content}
        </Content>



      </Layout>
    );


  }
}

export default Widget;
