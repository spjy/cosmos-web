import React, { Component } from 'react';
import io from 'socket.io-client';
// import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
// import DataSet from '@antv/data-set';
import { Card, Alert, Row, Col} from 'antd';
import cosmosInfo from './CosmosInfo'
import { LineChart, Line ,XAxis, YAxis, Tooltip, ResponsiveContainer, Label} from 'recharts';
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]
const socket = io(cosmosInfo.socket);

function get_data(data,fields){
  var values = {};
  var p, val;
  // console.log("get_data data:", data, "fields", fields)
  values.utc=Number(data.agent_utc);
  for(var i = 0; i < fields.label.length; i++){
    p = fields.structure[i];
    val = data;
    console.log("structure", p);
    for(var j = 0; j <p.length; j++ ){

      val=val[p[j]];
      console.log("name",p[j],"val",val)
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
        data:[], current_data:{}
      };
  }

    componentDidMount() {

      socket.on('agent subscribe '+this.props.info.agent, (data) => { // subscribe to agent
        if (data) {

        var saved_data = this.state.data;
        if(this.props.info.values.label.length>0){
          var data_entry = get_data(data, this.props.info.values);
          // console.log('data_entry', data_entry)
          // console.log(data_entry)
          if(saved_data.length > this.props.info.xRange){
            saved_data.shift();
          }
          saved_data = [...saved_data, data_entry]
          this.setState({data:saved_data, current_data: data_entry});
        }

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

      const legend = [];
      var current_data =this.state.current_data;
      const labels = this.props.info.values.label;
      for(var j=0; j<labels.length; j++){
        var color={color:colors[j%colors.length]}
        legend.push(<div key={String(j)}><h4 style={color}>{labels[j]}</h4><p >{current_data[labels[j]]}</p></div>);

      }
      if(data.length>0) {
        Plots=
        <Row >
          <Col span={18} >
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <XAxis dataKey="utc"  type = 'number' domain={['auto','auto']}>
                  <Label value={this.props.info.xLabel} offset={0} position="insideBottom" />
                </XAxis>
                <YAxis domain={['auto','auto']} >
                  <Label value= {this.props.info.yLabel} angle={-90}   position="insideLeft" />
                </YAxis>
                <Tooltip/>
                {lines}
              </LineChart>
              </ResponsiveContainer>
            </Col>
            <Col span={6} >
            <Card>  {legend}
            </Card>
            </Col>
          </Row>

      } else {
        Plots = <Alert message="No data available" type="error" showIcon />
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
