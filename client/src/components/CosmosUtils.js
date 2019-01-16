import React, { Component } from 'react';
import Navbar from './Global/Navbar';
import {  Card , Button , Modal , Icon} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo'
import CosmosWidget from './Cosmos/CosmosWidget'
const socket = io(cosmosInfo.socket);
const widget_type = {
  NONE: 0,
  LIVE_PLOT: 1,
  AGENT_COMMAND: 2,
  COSMOS_DATA:3
};

class CosmosUtils extends Component {
  constructor(props){
    super(props);
      this.state = {
        view_modal :false,
        agents: [],
        widgets: []
      };


  }
  componentDidMount() {

  }
  componentWillUnmount(){
  }
  onClickAddWidget(){
    this.setState({view_modal:true});
  }
  addNewWidget(){
    // if agent in this.state.agents, append val
    // else add agent in this.state.agents
    // add new widget to this.state.widgets
  }

  render() {

    var widget_info ={
      plot_info: {
        agent:"post527",
        data_name: "device_tsen_temp_001",
        title: "example"
      },
      data_box: {
        agent:"post527",
        data_name: "device_tsen_temp_001",
        title: "example"
      },
      command:{
        agent:"post527",
        node:"node-arduino",
        command:"status",
        title:"Get Status"
      }
    }


    return (

      <div>
        <Navbar current="cosmosutils" />
        <Modal
                  visible={this.state.view_modal}
                  title="Add Widget"
                >


                </Modal>
        <div style={{margin:'20px'}}>
          <Card
            style={{ width: '100%' }}
          >
          <CosmosWidget type={widget_type.LIVE_PLOT} info={widget_info}/>
          <CosmosWidget type={widget_type.COSMOS_DATA} info={widget_info}/>
          <CosmosWidget type={widget_type.AGENT_COMMAND} info={widget_info}/>
          <Button type="default" onClick={this.onClickAddWidget.bind(this)}><Icon type="plus"/> Add Widget </Button>
          </Card>

          </div>
      </div>


    );



  }

}

export default CosmosUtils;
