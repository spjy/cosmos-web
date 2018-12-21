import React, { Component } from 'react';
import io from 'socket.io-client';
// import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
// import DataSet from '@antv/data-set';
import { Card} from 'antd';
import cosmosInfo from './CosmosInfo'
import { LineChart, Line ,XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label} from 'recharts';
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]
const socket = io(cosmosInfo.socket);

function get_data(data,fields){
  var values = {};
  var p, val;

  values.utc=Number(data.agent_utc);
  for(var i = 0; i < fields.label.length; i++){
    p = fields.structure[i];
    val = data;
    for(var j = 0; j <p.length; p++ ){
      val=val[p[j]];
    }
    values[fields.label[i]]=Number(val);
  }

  return values;
}

class CosmosPlotLive extends Component {
/* Returns a select box filled with active agents */
  constructor(props){
    super(props);
      var selected = this.props.info.values;
      console.log('slected data:',selected)

      this.state = {
        data:[]
      };
  }

    componentDidMount() {

      socket.on('agent subscribe '+this.props.info.agent, (data) => { // subscribe to agent
        if (data) {

        var saved_data = this.state.data;

        var data_entry = get_data(data, this.props.info.values);
        console.log('data_entry', data_entry)
        if(saved_data.length > this.props.info.xRange){
          saved_data.shift();
        }
        saved_data = [... saved_data, data_entry]
        this.setState({data:saved_data});
        }

      });
    }
    componentDidUpdate(prevProps){
      if(this.props.info !== prevProps.info){
        this.setState =( {
          data:[]
        });
      }
    }
    componentWillUnmount() {
      var prevState = this.props.info.agent;
      socket.removeAllListeners('agent subscribe '+prevState);
    }


    render() {
      var data = [];
      data = this.state.data;
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

      // {this.props.info.xLabel}
      // {this.props.info.yLabel}
      if(data.length>0) {
        Plots=
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <XAxis dataKey="utc"  type = 'number' domain={['auto','auto']}>
                <Label value="Xlabel" offset={0} position="insideBottom" />
              </XAxis>
              <YAxis domain={['auto','auto']} >
                <Label value= "Ylabel" angle={-90}   position="insideLeft" />
              </YAxis>
              <Tooltip/>
              <Legend  verticalAlign="top"/>
              {lines}
            </LineChart>
            </ResponsiveContainer>

      } else {
        Plots = <p> Nothing to see here </p>
      }

      return (
        <div>
          <Card
            style={{ width: '100%' }}
            title={this.props.info.plot_title}
          >

          {Plots}
          </Card>
        </div>
      );


    }
}

export default CosmosPlotLive;
