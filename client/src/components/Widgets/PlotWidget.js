import React, { Component } from 'react';
import io from 'socket.io-client';
import moment from 'moment';
import {  Alert , Row, Col , Button } from 'antd';
import { utc2date , convertTimetoDate, mjd2cal} from './../Cosmos/Libs'
import cosmosInfo from './../Cosmos/CosmosInfo'
import { LineChart, Line ,XAxis, YAxis, Tooltip, ResponsiveContainer, Label} from 'recharts';
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]
const socket = io(cosmosInfo.socket);


class PlotWidget extends Component {
/* should inherit props={
          info: CosmosWidgetConfig,
          plot_domain:[start, end]
          data=[{value: , utc: , date: }]

        }
*/
  constructor(props){
    super(props);
    console.log(props)
      this.state = {
      };
  }


    plotTooltip(props){
      var time = convertTimetoDate(props.label)
      return <div> Time: {time}</div>
    }

    render() {


      var data = [];
      data = this.props.data;

      if(data.length>0) {
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
        Plots=
        <div>
        <Row gutter={16}>
          <Col span={18} >
            <h4 style={{textAlign:'center'}}> {this.props.info.title} </h4>
            <ResponsiveContainer width="100%" height={400}>

              <LineChart data={data}>
                <XAxis dataKey="agent_utc"  type = 'number' allowDataOverflow={true} domain={this.props.plot_domain}
                tickFormatter = {(unixTime) => moment(mjd2cal(unixTime).getTime()).format('YYYY-MM-DD hh:mm a')}>
                >
                  <Label value={this.props.info.plot_labels[0]} offset={0} position="insideBottom" />
                </XAxis>
                <YAxis domain={['auto','auto']} >
                  <Label value= {this.props.info.plot_labels[1]} angle={-90}   position="insideLeft" />
                </YAxis>
                <Tooltip labelFormatter={(val) => { return utc2date(val)}}/>
                {lines}
              </LineChart>
            </ResponsiveContainer>
          </Col>
          <Col span={6} >
            <Button>Pause</Button>
          </Col>
        </Row>
        </div>

      } else {
        Plots = <Alert message="No data available" type="error" showIcon />
      }

      return (
        <div>
          {Plots}
        </div>
      );


    }
}

export default PlotWidget;
