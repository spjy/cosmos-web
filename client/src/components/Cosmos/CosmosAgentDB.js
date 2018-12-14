import React, { Component } from 'react';
import io from 'socket.io-client';
import { notification } from 'antd';
import CosmosPlotForm from './CosmosPlotForm';
import { Select , Icon } from 'antd';
import { Button } from 'antd';
// import 'whatwg-fetch';
import cosmosInfo from './CosmosInfo'
const socket = io(cosmosInfo.socket);

class CosmosAgentDB extends Component {
/* CosmosPlot using .json configuration file */
  constructor(props){
    super(props);
      this.state = {

      };


  }

    componentDidMount() {
      console.log('i am trying.....')
        // fetch(`${cosmosInfo.socket}/api/agent_list`, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json'
        //   },
        //   //credentials: 'same-origin',
        // }).then((response) => {
        //   response.json().then((data) => {
        //     console.log('we got:',data);
        //     // if (data && data.length > 0) {
        //     //   this.setState({
        //     //     live: false,
        //     //     playable: true,
        //     //     replay: data,
        //     //     max: data.length,
        //     //     currentCoord: data[0],
        //     //     satellite: data[0].satellite,
        //     //   });
        //     //   this.refs.replay.startSlider(); // initialize function from replay component
        //     //   this.setState({ playable: false });
        //     // }
        //   });
        // }).catch(err => {
        //   notification.error({
        //     message: 'Error',
        //     description: 'An error occurred.'
        //   })
        //   console.log(err)
        // });
        fetch(`${cosmosInfo.socket}/api/agent_list`)
        .then(response => response.json())
        .then(data => console.log( "received:",data ));
    }

    componentDidUpdate(prevProps) {


    }
    componentWillUnmount() {

    }


    render() {





        return (

          <div>

          </div>


        );



    }

}

export default CosmosAgentDB;
