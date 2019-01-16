import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import {  Button , Input , Card , Icon , Col, Row, Form} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo'
const socket = io(cosmosInfo.socket);

class Commands extends Component {
  constructor(props){
    super(props);
      this.state = {
        command:'',
        output: '',
        loading: false
      };


  }
  componentDidMount() {

    socket.on('cosmos_command_response', (data) => { // subscribe to agent
      if (data) {
        var output = this.state.output;
        this.setState({output:output+data.output, loading:false})
      }

    });
  }
  componentWillUnmount(){
    socket.removeAllListeners('cosmos_command_response');
  }
  commandChange(event){
    this.setState({command:event.target.value});
  }
  onSend(){
    var cmd = this.state.command;
    socket.emit('cosmos_command', {command: cmd});
    this.setState({loading:true});
    this.clearOutput();
  }
  clearOutput(){
    this.setState({output:''})
  }

  render() {
    var output;
    if(this.state.loading){
      output=<Icon type="loading" />
    }
    else {
      output = this.state.output;
    }


    return (
      <div>
        <Navbar current="commands" />
        <div style={{margin:'20px'}}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={8} >
                <Form.Item >
                  <Input onChange={this.commandChange.bind(this)} value={this.state.command} placeholder="Enter Command"/>
                </Form.Item>
              </Col>
              <Col span={2} >
                <Button onClick={this.onSend.bind(this)}> Send</Button>
              </Col>
            </Row>
          </Form>

          <Card title="Output"
            extra={<a onClick={this.clearOutput.bind(this)}>Clear</a>}
            >
            <div >
              <p style={{whiteSpace:'pre-wrap'}}> {output}</p>

            </div>

          </Card>
        </div>
      </div>


    );



  }

}

export default Commands;
