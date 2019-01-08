import React, { Component } from 'react';
import io from 'socket.io-client';
import moment from 'moment';
import { Card, Alert, Row, Col, Button , DatePicker} from 'antd';
import cosmosInfo from './CosmosInfo'
import { LineChart, Line ,XAxis, YAxis, Tooltip, ResponsiveContainer, Label} from 'recharts';
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]
const socket = io(cosmosInfo.socket);
const { RangePicker } = DatePicker;
function get_data(data,fields){
  var values = {};
  var p, val;
  values.utc=Number(data.agent_utc);
  for(var i = 0; i < fields.label.length; i++){
    p = fields.structure[i];
    val = data;
    for(var j = 0; j <p.length; j++ ){
      val=val[p[j]];
    }

    values[fields.label[i]]=Number(val);
  }

  return values;
}
function range(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

function formatDate(date){
  // format="YYYY-MM-DD HH:mm:ss"
  var str;
  str=String(date.getFullYear())+"-";
  str+= String(date.getMonth()+1)+"-";
  str+=String(date.getDate()+1)+" ";
  str+=String(date.getHours())+":";
  str+=String(date.getMinutes())+":";
  str+=String(date.getSeconds());
  return str;
}
class CosmosPlotDB extends Component {
/* Returns a select box filled with active agents */
  constructor(props){
    super(props);
      var selected = this.props.info.values;
      console.log('agent:',this.props.info.agent)

      this.state = {
        data:[],
        dates:{
          start:'',
          end: ''
        },
        plot_dates:{
          start:null,
          end:null
        }
      };
  }

    componentDidMount() {
      // query available dates for agent
      socket.emit('agent_dates', {agent: this.props.info.agent}, this.setBoundaries.bind(this));
    }
    setBoundaries(msg){
      console.log(msg); // data will be 'tobi says woot'
      var startDate = new Date(msg.dates.start)
      var endDate = new Date(msg.dates.end)
      console.log(moment(startDate).format('lll')  , moment(endDate).format('lll')  );
      console.log(moment(startDate).local(),moment(endDate).local())
      if(msg.valid===true){
        this.setState({dates:{start:startDate, end: endDate}})
      }
    }

    componentDidUpdate(prevProps){
      if(this.props.info !== prevProps.info){
        this.setState ( {
          data:[]
        });
      }
    }
    componentWillUnmount() {

    }

    disabledDate(current) {
      return current && (current > moment(this.state.dates.end).endOf('day') || current < moment(this.state.dates.start).startOf('day'));
    }
    getQueryFields(){
      var vals = this.props.info.values.structure;
      var fields = [];
      var field;
      for(var i = 0; i < vals.length; i++){
        field = vals[i][0]
        for(var j=1; j < vals[i].length; j++){
          field+="."+vals[i][j];
        }
        fields.push(field)
      }
      return fields;
    }

    onDateChange(dates, dateStrings){
      // console.log('From: ', dates[0].startOf('day'), ', to: ', dates[1].endOf('day'));
      // console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
      var startDate = dates[0].startOf('day');
      var endDate = dates[1].endOf('day');

      this.setState({plot_dates: {start: startDate, end:  endDate}})

      socket.emit('agent_query',{agent: this.props.info.agent, startDate: startDate, endDate: endDate, fields:this.getQueryFields()}, this.receivedPlotData.bind(this));

    }
    receivedPlotData(data){
      console.log(data.length," results found")
      console.log(data[0])
      this.setState({data:data})
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
      var selected_dates;
      var default_time_start = '00:00:00';
      var default_time_end ='11:59:59';
      if(this.state.plot_dates.start !== null){
        selected_dates = [moment(this.state.plot_dates.start), moment(this.state.plot_dates.end)]
      }
      const date_form =     <RangePicker
        disabledDate={this.disabledDate.bind(this)}
        value={selected_dates}
        onChange={this.onDateChange.bind(this)}
        format="YYYY-MM-DD"
      />

      var agent_title = "Agent "+this.props.info.agent;
      var plot_title = "["+agent_title+"] "+this.props.info.plot_title
      if(data.length>0) {
        Plots=
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis dataKey="agent_utc"  type = 'number' domain={['auto','auto']}>
              <Label value={this.props.info.xLabel} offset={0} position="insideBottom" />
            </XAxis>
            <YAxis domain={['auto','auto']} >
              <Label value= {this.props.info.yLabel} angle={-90}   position="insideLeft" />
            </YAxis>
            <Tooltip/>
            {lines}
          </LineChart>
          </ResponsiveContainer>

      } else {
        Plots = <Alert message="No data available" type="error" showIcon />
      }

      return (
        <div>
          <Card
            style={{ width: '100%' }}
            title={plot_title}
          >

          <Row >
          {date_form}
            <Col span={18} >
              {Plots}
              </Col>
              <Col span={6} >
              <Card title={agent_title}>

              </Card>

              </Col>
            </Row>
          </Card>
        </div>
      );


    }
}

export default CosmosPlotDB;
