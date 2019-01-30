import React, { Component } from 'react';
import { CSVLink } from "react-csv";
import io from 'socket.io-client';
import moment from 'moment';
import { Card, Switch, DatePicker, Slider, Row, Col, Button, Icon, Badge, Tooltip} from 'antd';
import cosmosInfo from './CosmosInfo'
import { mjd2cal } from './Libs'
import PlotBox from './PlotBox'
import { parse_live_data } from './CosmosPlotLibs'

const socket = io(cosmosInfo.socket);
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]
const { RangePicker } = DatePicker;

function convertTimetoDate(val){
  return new Date(mjd2cal(val).getTime()).toLocaleString('en-US')
}

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
function DownloadCSV(props){
  var data = props.getData();
  return (<CSVLink data={data[1]} filename={"cosmos.csv"}>Download CSV</CSVLink>);
}
class CosmosPlot extends Component {
/* Returns a select box filled with active agents */
  constructor(props){
    super(props);
    // console.log(this.props.info)
      this.state = {
        live_view:this.props.info.live,
        data: [],
        live_data:[],
        live:{
          current_data:{},
          pause: false
        },
        archive: {
          date_boundaries:{
            start:null,
            end: null
          },
          date_picker:{
            start:null,
            end:null
          }
        },
        slider:{
          start:0,
          end:1000
        },

        time_start:0,
        time_end:1
      };
  }

    componentDidMount() {
      if(this.props.info.live){
        this.startListening();
      }
      if(this.props.info.archive){
        socket.emit('agent_dates', {agent: this.props.info.agent}, this.setBoundaries.bind(this));
      }

    }
    startListening(){
      // console.log("startListening")
      socket.emit('start record', this.props.info.agent);
      socket.on('agent subscribe '+this.props.info.agent, (data) => { // subscribe to agent
        if (data) {
          // console.log('update')
        var saved_data = this.state.live_data;
        var l = this.state.live;
        if(this.props.info.values.label.length>0){
          var data_entry = parse_live_data(data, this.props.info.values);
          if(saved_data.length > this.props.info.xRange){
            saved_data.shift();
          }
          saved_data = [...saved_data, data_entry]
          l.current_data = data_entry;
          // console.log(saved_data)
          this.setState({live_data:saved_data, live: l});
        }

        }

      });
    }
    stopListening(){
      socket.removeAllListeners('agent subscribe '+this.props.info.agent);
    }
    setBoundaries(msg){
      // console.log("setBoundaries")
      if(msg.valid===true){
        var startDate = new Date(msg.dates.start)
        var endDate = new Date(msg.dates.end)
        // console.log(moment(startDate).format('lll')  , moment(endDate).format('lll')  );
        // console.log(moment(startDate).local(),moment(endDate).local())
        var a = this.state.archive;
        a.date_boundaries.start=startDate;
        a.date_boundaries.end=endDate
        this.setState({archive:a})
      }
    }

    componentDidUpdate(prevProps){
    }
    componentWillUnmount() {
      var prevState = this.props.info.agent;
      socket.removeAllListeners('agent subscribe '+prevState);
      socket.emit('end record', this.props.info.agent);
    }

    onChangeView(val){
      if(val ){
        if( this.state.live_data.length >0){
          this.resumeLivePlot();
        } else {
          this.startListening();
        }

      }
      else {
        this.stopListening();
        if(this.state.archive.date_boundaries.start === null){
          // get date boundaries for calendar
          socket.emit('agent_dates', {agent: this.props.info.agent}, this.setBoundaries.bind(this));
        }
      }

      this.setState({live_view:val});
    }

    disabledDate(current) {
      return current && (current > moment(this.state.archive.date_boundaries.end).endOf('day') || current < moment(this.state.archive.date_boundaries.start).startOf('day'));
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
    sliderChange(value){
      var slider= {start: value[0], end:value[1]};
      this.setState({slider:slider})
    }
    onDateChange(dates, dateStrings){

      var startDate = dates[0].startOf('day');
      var endDate = dates[1].endOf('day');
      var a = this.state.archive;
      a.date_picker.start = startDate;
      a.date_picker.end = endDate;
      this.setState({archive:a})

      socket.emit('agent_query',{agent: this.props.info.agent, startDate: startDate, endDate: endDate, fields:this.getQueryFields()}, this.receivedPlotData.bind(this));

    }
    receivedPlotData(data){
      if(data.length > 0 ){
        var min, max;
        min = data[0]["agent_utc"]
        max = data[data.length-1]["agent_utc"]
        this.setState({
          data:data,

         slider:   {start: 0, end:data.length},
          time_start:min,
          time_end: max
          },() => console.log(this.state));
      }else {
        console.log("didnt get anything")
      }

    }
    receivedLiveData(data){

      // console.log('received data: ', data)
      var local_data = this.state.live_data;
      var live_data = local_data.concat(data);
      var l = this.state.live;
      l.pause = false;
      this.setState({live:l, live_data: live_data});
      this.startListening();
    }
    pauseLivePlot(){
      // console.log(" paused at: ", this.state.live.current_data["agent_utc"])
      this.stopListening();   // stop listening for new data
      var l = this.state.live;
      l.pause = true;
        this.setState({live:l,
          time_start: this.state.live_data[0]["agent_utc"],
          time_end: this.state.live.current_data["agent_utc"],
          slider:{
            start:0,
            end: this.state.live_data.length,
          }})
    }
    resumeLivePlot(){
      // fetch data since last live data  point
      // callback: this.receivedLiveData()
      // console.log("fetch data from: ",  this.state.live.current_data["agent_utc"])
      socket.emit('agent_resume_live_plot',
          { agent: this.props.info.agent, resumeUTC: this.state.live.current_data["agent_utc"], fields:this.getQueryFields()},
          this.receivedLiveData.bind(this));

    }
    getCSV(){
      var start =scale(this.state.slider.start, 0,this.state.live_data.length, this.state.time_start, this.state.time_end)
      var end = scale(this.state.slider.end, 0,this.state.live_data.length, this.state.time_start, this.state.time_end)
      var csv_data =[];
      var csv_headers=[];
      var data_src, data;
      // for(var j=0; j < this.props.info.values.label.length; j++){
      //   csv_headers.push({})
      // }
      if(this.state.live_view){
        //use live_data
        data_src = this.state.live_data;
      }
      else {
        data_src = this.state.data;
      }
      for(var i=0; i < data_src.length; i++){
        data=data_src[i]
        if(data.agent_utc >= start && data.agent_utc <=end)
          csv_data.push(data)
      }
      return  [csv_headers, csv_data];
    }
    scaleSlider(val){
      if(this.state.live_view){
        return convertTimetoDate(scale(val, 0,this.state.live_data.length, this.state.time_start, this.state.time_end));
      }
      else {
        return convertTimetoDate(scale(val, 0,this.state.data.length, this.state.time_start, this.state.time_end));
      }

    }

    render() {
      // console.log("live:", this.state.live_data.length)
      const legend = [];
      var selected_dates;
      var date_form, slider,plot_domain, action, csv_form;
      var disable_switch = false;
      var slider_visible = false;
      var data_source;
      var title= <div> {"Agent "+this.props.info.agent} <Badge status="default" /></div>
      if(this.props.info.live){
        title= <div> {"Agent "+this.props.info.agent} <Badge status="processing" /></div>
      }
      if(this.state.live_view){
        // render legend - holds value of current data
        data_source = this.state.live_data;
        const labels = this.props.info.values.label;
        for(var j=0; j<labels.length; j++){
          var color={color:colors[j%colors.length]}
          legend.push(<div key={String(j)}><h4 style={color}>{labels[j]}</h4><p >{this.state.live.current_data[labels[j]]}</p></div>);

        }
        plot_domain = ['auto, auto'];
        if(this.state.live.pause)
        {
          slider_visible=true;

          action = <Button type="default" onClick={this.resumeLivePlot.bind(this)}> Resume </Button>
          csv_form = <DownloadCSV getData={this.getCSV.bind(this)}/>
        }
        else {
          action = <Button type="default" onClick={this.pauseLivePlot.bind(this)}> Pause </Button>
          csv_form = <p> Pause Plot to export as CSV </p>
        }
        if(!this.props.info.archive) disable_switch=true;
      }
      else {
        // render Datepicker and slider
        data_source= this.state.data;
        if(this.state.archive.date_picker.start !== null){
          selected_dates = [moment(this.state.archive.date_picker.start), moment(this.state.archive.date_picker.end)]
        }
        date_form =     <RangePicker
            disabledDate={this.disabledDate.bind(this)}
            value={selected_dates}
            onChange={this.onDateChange.bind(this)}
            format="YYYY-MM-DD"
          />
          if(data_source.length >0) {
            slider_visible = true;
            csv_form = <DownloadCSV getData={this.getCSV.bind(this)}/>
          }
          else {
            csv_form = <p> Select Dates </p>
          }

        if(!this.props.info.live) {
          disable_switch=true;
        }

      }
      if(slider_visible){
        plot_domain=[    scale(this.state.slider.start, 0,data_source.length, this.state.time_start, this.state.time_end),
        scale(this.state.slider.end, 0,data_source.length, this.state.time_start, this.state.time_end)]

        slider = <Slider range value={[this.state.slider.start, this.state.slider.end]}
            min={0}
            max={data_source.length}
            onChange={this.sliderChange.bind(this)}
            tipFormatter={this.scaleSlider.bind(this)}
            />
      }

      return (
        <Card
          style={{ width: '100%' }}
          title={title}
          extra={(this.props.info.live && this.props.info.archive) &&
            <div>Live View
                <Switch checked={this.state.live_view}
                onChange={this.onChangeView.bind(this)}
                disabled={disable_switch}/>
            </div>}
        >
        <div>
        <Row>{date_form}</Row>
        <Row gutter={16}>
          <Col span={18} >
            {slider}
            <PlotBox info={this.props.info} plot_domain={plot_domain} data={data_source}/>
            </Col>
            <Col span={6} >
            <Card title={this.props.info.agent}>
              {legend}
              {action}
              {csv_form}
            </Card>
            </Col>
          </Row>
        </div>
        </Card>
      );


    }
}

export default CosmosPlot;
