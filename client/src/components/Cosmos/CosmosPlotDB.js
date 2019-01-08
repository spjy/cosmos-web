import React, { Component } from 'react';
import io from 'socket.io-client';
import moment from 'moment';
import { Card, Alert, Row, Col, Button , DatePicker} from 'antd';
import cosmosInfo from './CosmosInfo'
import { LineChart, Line ,XAxis, YAxis, Tooltip, ResponsiveContainer, Label} from 'recharts';
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]
const socket = io(cosmosInfo.socket);
const { RangePicker } = DatePicker;


function isleap( year)
{
    if (!(year % 4))
    {
        if (!(year%100))
        {
            if (!(year%400))
            {
                return (1);
            }
            else
            {
                return 0;
            }
        }
        else
        {
            return 1;
        }
    }
    else
    {
        return 0;
    }
}
function mjd2ymd( mjd,  year, month, day, doy)
{
    var lmjd = 0.;
    var lyear = 1858;
    var lmonth = 11;
    var lday = 17.;
    var ldoy = 321.;

    if (mjd !== lmjd)
    {
        var a, b, c, d, e, z, alpha;
        var f;

        lmjd = mjd;
        mjd += 2400001.;
        z = Math.floor(mjd);
        f = mjd - z;

        if (z<2299161)
            a = z;
        else
        {
            alpha = Math.floor((z - 1867216.25)/36524.25);
            a = z +1 + alpha - Math.floor(alpha/4);
        }

        b = a + 1524;
        c = Math.floor((b - 122.1)/365.25);
        d = Math.floor(365.25*c);
        e = Math.floor((b - d)/30.6001);

        lday = b - d - Math.floor(30.6001 * e) + f;
        if (e < 14)
            lmonth = e - 1;
        else
            lmonth = e - 13;
        if (lmonth > 2)
            lyear = c - 4716;
        else
            lyear = c - 4715;
        ldoy = Math.floor((275 * lmonth)/9) - (2-isleap(lyear))*Math.floor((lmonth+9)/12) + lday - 30;
    }

    // year = lyear;
    // month = lmonth;
    // day = lday;
    // doy  = ldoy;
    // return 0;
    return {year: lyear, month:lmonth, day: lday, doy: ldoy}
}
function mjd2cal(mjd){
  var lmjd = 0.;
  var date={};

  if (lmjd !== mjd)
  {
      // var dom;
      // var doy;
      var temp;
      lmjd = mjd;

      temp = mjd2ymd(mjd);
      // mjd2ymd(mjd, date.year, date.month, dom, doy);
      date.year = temp.year;
      date.month = temp.month
      // date.doy = (int32_t)doy;
      date.doy = Math.floor(temp.doy)
      date.dom = Math.floor(temp.day)
      // date.dom = (int32_t)dom;
      // doy = (doy - date.doy) * 24.;
      temp.doy = (temp.doy - date.doy) * 24.;
      // date.hour = (int32_t)doy;
      date.hour = Math.floor(temp.doy);
      // doy = (doy - date.hour) * 60.;
      temp.doy = (temp.doy - date.hour) * 60.;
      // date.minute = (int32_t)doy;
      date.minute = Math.floor(temp.doy)
      // doy = (doy - date.minute) * 60.;
      temp.doy = (temp.doy - date.minute) * 60.;
      // date.second = (int32_t)doy;
      date.second = Math.floor(temp.doy)
      // doy = (doy - date.second) * 1e9;
      temp.doy = (temp.doy - date.second) * 1e6;
      date.nsecond = Math.floor(temp.doy + .5);
  }
   console.log(date)
  return new Date(Date.UTC(date.year, date.month-1, date.dom, date.hour, date.minute, date.second));
  // return new Date(String(date.year)+"-"+String(date.month)+"-"+String(date.dom)+"T"+String(date.hour)+":"+String(date.minute)+":"+String(date.second))
}
class CosmosPlotDB extends Component {
/* Returns a select box filled with active agents */
  constructor(props){
    super(props);
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

      var startDate = dates[0].startOf('day');
      var endDate = dates[1].endOf('day');

      this.setState({plot_dates: {start: startDate, end:  endDate}})

      socket.emit('agent_query',{agent: this.props.info.agent, startDate: startDate, endDate: endDate, fields:this.getQueryFields()}, this.receivedPlotData.bind(this));

    }
    receivedPlotData(data){
      console.log(data.length," results found")
      console.log(mjd2cal(data[0]["agent_utc"]))
      console.log(mjd2cal(data[data.length-1]["agent_utc"]))
      var vals = data;
      for(var i = 0; i < vals.length; i++){
        vals[i]["date"]= mjd2cal(vals[i]["agent_utc"]).getTime()
      }
      console.log(vals[0])
      this.setState({data:vals})
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
            <XAxis dataKey="date"  type = 'number' domain={['auto','auto']}
            tickFormatter = {(unixTime) => moment(unixTime).format('YYYY-MM-DD hh:mm a')}>
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
