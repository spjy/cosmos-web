import React, { Component } from 'react';
import io from 'socket.io-client';
import { Card,  Button, Icon} from 'antd';
import PlotBox from './PlotBox'
import CosmosWidgetConfig from './CosmosWidgetConfig'
import cosmosInfo from './CosmosInfo'
const socket = io(cosmosInfo.socket);
const widget_type = {
  NONE: 0,
  LIVE_PLOT: 1,
  AGENT_COMMAND: 2,
  COSMOS_DATA:3
};

async function setup(cosmos_plot_entry){
  await cosmos_plot_entry.setup_agent();
  return;
}
function parse_live_data(data,fields){
  var values = {};
  var p, val;
  values.agent_utc=Number(data.agent_utc);
  for(var i = 0; i < fields.label.length; i++){
    p = fields.structure[0];
    val = data;
    for(var j = 0; j <p.length; j++ ){
      val=val[p[j]];
    }

    values[fields.label[0]]=Number(val);
  }

  return values;
}


class CosmosWidget extends Component {
/* Returns a select box filled with active agents */
  constructor(props){
    super(props);
      this.state = {
        data:[], info:null,
        ready:false
      };
  }

    componentDidMount() {
      var entry;
      if(this.props.type===widget_type.LIVE_PLOT || this.props.type===widget_type.COSMOS_DATA ){
        // set up CosmosWidgetConfig
        // console.log(this.props.info.plot_info.data_name)
        var agent, entry;
        if(this.props.type===widget_type.LIVE_PLOT){
          agent = this.props.info.plot_info.agent;
          entry = new CosmosWidgetConfig({
            agent: this.props.info.plot_info.agent,
            title: this.props.info.plot_info.title,
            values : [{data:this.props.info.plot_info.data_name}],
            node:"",
            xLabel:"Time",
            yLabel:this.props.info.plot_info.data_name,
            xRange: 100,
            yRange: 10,
            visible : true
          })
        }
        if(this.props.type===widget_type.COSMOS_DATA){
          agent = this.props.info.data_box.agent;
          entry = new CosmosWidgetConfig({
            agent: this.props.info.data_box.agent,
            title: this.props.info.data_box.title,
            values : [{data:this.props.info.data_box.data_name}],
            node:"",
            xLabel:"Time",
            yLabel:this.props.info.data_box.data_name,
            xRange: 100,
            yRange: 10,
            visible : true
          })
        }
        setup(entry).then((result)=>{
          this.setState({info:entry})
          socket.on('agent update list', (data) => { // subscribe to agent
            if (data) {
              var info = this.state.info;
              if(data[info.agent]) {
                info.live=true;
              }
              this.setState({info:info, ready: true});
              socket.removeAllListeners('agent update list');
            }
          });

          socket.emit('start record', agent);
          socket.on('agent subscribe '+agent, (data) => { // subscribe to agent
            if (data) {

              if(this.state.info.values.label.length>0){

                var data_entry = parse_live_data(data, this.state.info.values);
                if(this.props.type===widget_type.COSMOS_DATA){
                  this.setState({data: data_entry[this.props.info.data_box.data_name]});
                }
                else if(this.props.type===widget_type.LIVE_PLOT){
                  var saved_data = this.state.data;
                    if(saved_data.length > this.state.info.xRange){
                      saved_data.shift();
                    }
                    saved_data = [...saved_data, data_entry]
                    this.setState({data:saved_data});

                }

              }
            }

          });
        });

      }
      else {
        this.setState({ready:true})
      }



    }


    componentWillUnmount() {
      // remove listeners
      if(this.state.ready){
        if(this.props.type===widget_type.COSMOS_DATA || this.props.type===widget_type.LIVE_PLOT){
          socket.removeAllListeners('agent subscribe '+this.state.info.agent);
          socket.emit('end record', this.state.info.agent);
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
      console.log(this.props.info)
      var content;
      if(this.state.ready){
        switch(this.props.type){
          case(widget_type.LIVE_PLOT):
          if(this.state.info)
              content = <PlotBox info={this.state.info} plot_domain={['auto, auto']} data={this.state.data}/>
              // console.log(this.state.info)
          break;
          case(widget_type.AGENT_COMMAND):
            content =<div>
              <Button onClick={this.onClickCommand.bind(this)}>{this.props.info.command.title}</Button>
              <div style={{ overflowY:'scroll', height:'200px'}}>
                {this.state.data}
              </div>
            </div>
          break;
          case(widget_type.COSMOS_DATA):
            if(this.state.info.agent)
              content = <div>{"[ " +this.state.info.agent+" ]: " +this.state.info.values.label[0]}<br/> {String(this.state.data)}</div>
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
