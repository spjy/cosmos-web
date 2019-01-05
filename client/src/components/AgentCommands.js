import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import {  Button , Input , Card , Icon , Col, Row, Form, Select} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo'
const socket = io(cosmosInfo.socket);


function commandText(text, id){
  return (<p style={{whiteSpace:'pre-wrap', wordWrap:'break-word', color:'blue'}} key={String(id)}> <b>Command:</b> {text}</p>);
}
function responseText(text, id){

  return (<p style={{whiteSpace:'pre-wrap', wordWrap:'break-word'}} key={String(id)}> <b>Output:</b>{text}</p>);
}
class AgentCommands extends Component {
  constructor(props){
    super(props);
      this.state = {
        command:-1,
        output: [],
        loading_output: false,
        loading_commands:false,
        agent_list:{},
        command_list:[],
        agent:'',
        args:''
      };


  }
  componentDidMount() {
    socket.on('agent update list', (data) => { // subscribe to agent
        if (data) {
          this.setState({agent_list:data})
        }
      });


  }
  componentWillUnmount(){

    socket.removeAllListeners('agent update list');
  }
  // commandChange(event){
  //   this.setState({command:event.target.value});
  // }

  clearOutput(){
    this.setState({output:[]})
  }
  clearAll(){
    this.setState({agent:'', args: '', output:[], command_list:[], loading_output: false,
        loading_commands:false,});
  }

  onSelectAgent(agent){
    this.setState({loading_commands:true, command_list:[], agent: agent, command: -1})
    var nodename = this.state.agent_list[agent][1]
    console.log(nodename)
    // clear commands list
    // get list of commands for agents:
    socket.emit('list_agent_commands', {agent: agent, node: nodename});
    socket.on('list_agent_commands_response', (data) => { // listen for response
      if (data) {
        // console.log(data.command_list)
        this.setState({command_list:data.command_list, loading_commands:false});
      }
      socket.removeAllListeners('list_agent_commands_response'); // remove listener
    });

  }

  onSelectCommand(val){
     this.setState({command:val});
  }

  onChangeArgs(event){
    this.setState({args:event.target.value});
  }

  onSend(){
    var cmd = this.state.command_list[this.state.command].command+" "+this.state.args;
    var agent = this.state.agent;
    var nodename = this.state.agent_list[agent][1];
    socket.emit('cosmos_command', {agent: agent, node: nodename, command: cmd});
    var cmd_sent='agent '+nodename+' '+agent+' '+cmd;
    var output = this.state.output;
    output.push(commandText(cmd_sent, output.length));
    this.setState({loading_output:true, output:output});
    socket.on('cosmos_command_response', (data) => { // listen for response
      if (data) {
        var output = this.state.output;
        output.push(responseText(data.output, output.length));
        this.setState({output:output, loading_output:false})
      }
      socket.removeAllListeners('cosmos_command_response');
    });
    // this.clearOutput();
  }
  copyOutput(){


  }

  render() {


    const Option = Select.Option;
    var agent_names=[];
    var agent_list  = Object.keys(this.state.agent_list)
    for(var i =0; i < agent_list.length; i++){
      agent_names.push(<Option key={i} value={agent_list[i]}> {agent_list[i]} </Option>);
    }
    var commandSelect, argsInput, commandDetail, executeButton;
    if(this.state.command_list.length>0){
      var command_list=[];
      for(var j = 0; j < this.state.command_list.length; j++){
        command_list.push(<Option key={j} value={j}> {this.state.command_list[j].command} </Option>);
      }
      commandSelect= <Form.Item label="Command">
                          <Select
                            showSearch
                            onChange={this.onSelectCommand.bind(this)}>
                            {command_list}
                          </Select>
                        </Form.Item>;
      if(this.state.command!==-1){
        argsInput =  <Form.Item label="Args">
          <Input onChange={this.onChangeArgs.bind(this)} value={this.state.args} placeholder="Enter Arguments"/>
        </Form.Item>;
        commandDetail=<p key='3'style={{whiteSpace:'pre-wrap'}}> <b>Command Detail: <br/></b>{this.state.command_list[this.state.command].detail} </p>;

        if(this.state.loading_output){
          executeButton = <Button key='4' type="primary" onClick={this.onSend.bind(this)} disabled><Icon type="loading" /></Button>
        }
        else {
            executeButton = <Button key='4' type="primary" onClick={this.onSend.bind(this)}>Execute</Button>
        }
      }

    }
    else if(this.state.loading_commands){
      commandSelect=<h4> <Icon type="loading" /> Loading Commands</h4>
    }
    return (
      <div>
        <Navbar current="agentcommands" />
        <div style={{margin:'20px'}}>


          <Card title="Agent Commands"
            extra={<a onClick={this.clearAll.bind(this)}>Clear</a>}
            >
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={8} >
                  <Form.Item label="Agent">
                    <Select
                      showSearch
                      onChange={this.onSelectAgent.bind(this)}>
                      {agent_names}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}  key='1'>
                  {commandSelect}
                </Col>
                <Col span={8} key='2' >
                  {argsInput}
                </Col>
                {commandDetail}
                {executeButton}
              </Row>

            </Form>
            <br/>
            <Card actions={[<a onClick={this.clearOutput.bind(this)}>Clear</a>]}>
              <div style={{ overflowY:'scroll', height:'500px'}}>
                {this.state.output}
              </div>
            </Card>

          </Card>
        </div>
      </div>


    );



  }

}

export default AgentCommands;
