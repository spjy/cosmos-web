import React, { Component } from 'react';
import io from 'socket.io-client';
// import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
// import DataSet from '@antv/data-set';
import { Card} from 'antd';
import cosmosInfo from './CosmosInfo'
import { LineChart, Line ,XAxis, YAxis, Tooltip, Legend} from 'recharts';

const socket = io(cosmosInfo.socket);
function plot_fields(list){
  var fields =[];
  var str;
  for(var i =0; i< list.length; i++){
    str = list[i][0];
    for(var j = 1; j < list[i].length; j++){
        str += "_"+list[i][j];
    }
    fields.push({string: str, list: list[i]});
  }
  return fields;
}
function get_data(data,fields){
  var values = {};
  var p, val, name;

  values.utc=Number(data.agent_utc);
  for(var i = 0; i < fields.length; i++){
    p = fields[i].list;
    val = data;
    for(var j = 0; j <p.length; p++ ){
      val=val[p[j]];
    }
    values[fields[i].string]=Number(val);
  }

  return values;
}


function Plot(props){
  var lines=[];
  for(var i =0; i < props.fields.length; i++){
    console.log("line: ", props.fields[i].string)
    lines.push(
      <Line type="monotone"
        dataKey={props.fields[i].string}
        key={String(i)}
        stroke="#82ca9d"
        animationDuration={1}
        />)
  }


  if(props.data.length>0) {
    return( <LineChart width={600} height={200} data={props.data}>
                      <XAxis dataKey="utc"  type = 'number' domain={['auto','auto']}/>
                      <YAxis domain={['auto','auto']}/>
                      <Tooltip/>
                      <Legend />
                      {lines}
                </LineChart> );
  } else {
    return (<p> Nothing to see here </p> );
  }

}
class CosmosPlotLive extends Component {
/* Returns a select box filled with active agents */
  constructor(props){
    super(props);


      var saved_state = this.state;
      var vals_to_track = [];
      var selected = this.props.info.values;
      for(var i=0; i< selected.length; i++){
        vals_to_track.push(this.props.info.structure[selected[i]]);
      }
      console.log("vals_to_track",vals_to_track);
      var fields = plot_fields(vals_to_track);
      this.state = {
        data:[],
        fields: fields
      };
  }

    componentDidMount() {

      socket.on('agent subscribe '+this.props.info.agent, (data) => { // subscribe to agent
        if (data) {

        var saved_data = this.state.data;

        var data_entry = get_data(data, this.state.fields);

        if(saved_data.length > this.props.info.xRange){
          saved_data.shift();
        }
        saved_data = [... saved_data, data_entry]
        this.setState({data:saved_data});
        }

      });
    }
    componentWillUnmount() {
      var prevState = this.props.agent;
      socket.removeAllListeners('agent subscribe '+prevState);
    }


    render() {
      var data = [];
      data = this.state.data;

      return (
        <div>
          <Card
            style={{ width: '100%' }}
            title={this.props.info.plot_title}
          >
          < Plot
            fields={this.state.fields}
            status={this.props.info.live || this.props.info.archive}
            data={data}
          />
          </Card>
        </div>
      );


    }
}

export default CosmosPlotLive;
