import React, { Component } from 'react';
import io from 'socket.io-client';
import { notification } from 'antd';
import CosmosPlotForm from './CosmosPlotForm';
import { Select , Icon ,Card} from 'antd';
import { Button } from 'antd';
import Navbar from './../Global/Navbar';
// import 'whatwg-fetch';
import cosmosInfo from './CosmosInfo'
const socket = io(cosmosInfo.socket);
const tabList = [{
  key: 'config_tab',
  tab: 'Configure',
}, {
  key: 'plot_tab',
  tab: 'Plot',
}];

class CosmosAgentDB extends Component {
/* CosmosPlot using .json configuration file */
  constructor(props){
    super(props);
      this.state = {
        key:'config_tab'
      };


  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {


  }
  componentWillUnmount() {

  }
  onTabChange = (key, type) => {
    console.log(key, type);
    var state = this.state;
    state.key=key;
    this.setState(state);
  }
  render() {


    const contentList = {
      config_tab: <CosmosPlotForm/>,
      plot_tab: <p>Coming soon...</p>,
    };


    return (

      <div>
        <Navbar current="dataplot" />
        <div>
        <Card
          style={{ width: '100%' }}
          title="Data Plot"
          tabList={tabList}
          activetabkey={this.state.key}
          onTabChange={(key) => { this.onTabChange(key, 'key'); }}
        >
          {contentList[this.state.key]}
        </Card>

        </div>
      </div>


    );



  }

}

export default CosmosAgentDB;
