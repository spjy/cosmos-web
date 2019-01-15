import React, { Component } from 'react';
import io from 'socket.io-client';
import moment from 'moment';
import {  Alert} from 'antd';
import { mjd2cal } from './Libs'
import cosmosInfo from './CosmosInfo'
import { LineChart, Line ,XAxis, YAxis, Tooltip, ResponsiveContainer, Label} from 'recharts';
const colors=["#82ca9d", "#9ca4ed","#f4a742","#e81d0b","#ed9ce6"]
const socket = io(cosmosInfo.socket);


function convertTimetoDate(val){
  return new Date(val).toLocaleString('en-US')
}
class PlotBox extends Component {
/* should inherit props={
          info: CosmosPlotEntry,
          plot_domain:[start, end]
          data=[{value: , utc: , date: }]

        }
*/
  constructor(props){
    super(props);
      this.state = {
      };
  }


    plotTooltip(props){
      var time = convertTimetoDate(props.label)
      return <div> Time: {time}</div>
    }

    render() {
      // console.log("plot_domain",this.props.plot_domain)
      // if(this.props.data.length){
      //   console.log(mjd2cal(this.props.data[0].agent_utc).getTime())
      //   console.log(moment(mjd2cal(this.props.data[0].agent_utc).getTime()).format('YYYY-MM-DD hh:mm a'))
      // }


      var data = [];
      data = this.props.data;
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

      if(data.length>0) {
        Plots=
        <div>
        <h4 style={{textAlign:'center'}}> {this.props.info.plot_title} </h4>
              <ResponsiveContainer width="100%" height={400}>

                <LineChart data={data}>
                  <XAxis dataKey="agent_utc"  type = 'number' allowDataOverflow={true} domain={this.props.plot_domain}
                  tickFormatter = {(unixTime) => moment(mjd2cal(unixTime).getTime()).format('YYYY-MM-DD hh:mm a')}>
                  >
                    <Label value={this.props.info.xLabel} offset={0} position="insideBottom" />
                  </XAxis>
                  <YAxis domain={['auto','auto']} >
                    <Label value= {this.props.info.yLabel} angle={-90}   position="insideLeft" />
                  </YAxis>
                  <Tooltip labelFormatter={(val) => { return convertTimetoDate(mjd2cal(val).getTime())}}/>
                  {lines}
                </LineChart>
                </ResponsiveContainer>
                </div>

      } else {
        // Plots = <Alert message="No data available" type="error" showIcon />
      }

      return (
        <div>
          {Plots}
        </div>
      );


    }
}

export default PlotBox;
