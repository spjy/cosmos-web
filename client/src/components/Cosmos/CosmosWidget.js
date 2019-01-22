import React, { Component } from 'react';
import io from 'socket.io-client';
import { Card,  Button, Icon} from 'antd';
import PlotBox from './PlotBox'
import CosmosWidgetConfig from './CosmosWidgetConfig'
import cosmosInfo from './CosmosInfo'
const socket = io(cosmosInfo.socket);

export const widgetType = {
  NONE: 0,
  LIVE_PLOT: 1,
  AGENT_COMMAND: 2,
  COSMOS_DATA:3
};
class CosmosWidget extends Component {
/* Returns a select box filled with active agents */
  constructor(props){
    super(props);
      this.state = {
        data:[],
        ready:true
      };
  }

    componentDidMount() {

    }


    componentWillUnmount() {

    }
    componentDidUpdate(prevProps){
      if(this.props.config.type===widgetType.LIVE_PLOT){
        if(prevProps.data!= this.props.data){
          var data= this.state.data;
          var new_data = this.props.data;
          data=[...data,new_data]
          this.setState({data:data})
          // console.log(this.state.data)
        }
      }

    }
    onClickCommand(){
      socket.emit('agent_command',
        {agent: this.props.info.command.agent, node: this.props.info.command.node, command: this.props.info.command },
        this.commandResponseReceived.bind(this));
    }
    commandResponseReceived(data){
      this.setState({data:<p style={{whiteSpace:'pre-wrap', wordWrap:'break-word'}} >{data.output}</p>})
    }
    render() {
      // console.log(this.props.config.type===widget_type.LIVE_PLOT);
      var content;
      if(this.state.ready){
        switch(this.props.config.type){
          case(widgetType.LIVE_PLOT):
          // if(this.state.info)
              content = <PlotBox info={this.props.info} plot_domain={['auto, auto']} data={this.state.data}/>
              // console.log(this.state.info)
          break;
          case(widgetType.AGENT_COMMAND):
            content =<div>
              <Button onClick={this.onClickCommand.bind(this)}>{this.props.info.command.title}</Button>
              <div style={{ overflowY:'scroll', height:'200px'}}>
                {this.state.data}
              </div>
            </div>
          break;
          case(widgetType.COSMOS_DATA):
            if(this.props.info.agent)
              content = <div>{"[ " +this.props.info.agent+" ]: " +this.props.info.values.label[0]}<br/> {String(this.props.data[this.props.info.values.label[0]])}</div>
          break;
          default:

          break;
        }
      }

      return (
        <Card >

        {content}
        </Card>
      );


    }
}

export default CosmosWidget;
