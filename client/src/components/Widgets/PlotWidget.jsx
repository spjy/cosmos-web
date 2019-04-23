import React, { Component } from 'react';
import io from 'socket.io-client';
import moment from 'moment';
import {
  Alert, Slider
} from 'antd';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Label
} from 'recharts';
import { utc2date, mjd2cal} from '../Cosmos/Libs';
import cosmosInfo from '../Cosmos/CosmosInfo';
const colors = ['#82ca9d', '#9ca4ed', '#f4a742', '#e81d0b', '#ed9ce6'];

const scale = (num, in_min, in_max, out_min, out_max) => (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
class PlotWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slider: 0,
      fix_slider: true
    };
  }

  sliderChange(value) {
    let fix = false;
    if (value === this.props.data.length - 1) {
      fix = true;
    }
    this.setState({ slider: value, fix_slider: fix });
  }

  scaleSlider(val) {
    return utc2date(this.props.data[val].agent_utc);
  }

  render() {
    let data = [];
    data = this.props.data;
    let plot_domain;
    let start_time;
    var end_time;
    var slider;
    if (data.length > 0) {
      let lines = [];
      var Plots;
      for (let i = 0; i < this.props.info.values.label.length; i++) {
        lines.push(
          <Line
            type="monotone"
            dataKey={this.props.info.values.label[i]}
            key={String(i)}
            stroke={colors[i % colors.length]}
            animationDuration={1}
          />
        );
      }
      start_time = data[data.length - 1].agent_utc - (this.props.info.xRange / 1440);
      end_time = data[data.length - 1].agent_utc;
      plot_domain = ['auto', 'auto'];
      if (data[0].agent_utc < start_time) { // show slider
        if (this.state.fix_slider) {
          plot_domain = [start_time, end_time];
          // data=data.splice()
          slider = (
            <Slider value={end_time}
              min={0}
              max={data.length-1}
              onChange={this.sliderChange.bind(this)}
              tipFormatter={this.scaleSlider.bind(this)}
            />
          );
        } else {
          plot_domain = [data[this.state.slider].agent_utc - (this.props.info.xRange / 1440), data[this.state.slider].agent_utc];
          slider = (
            <Slider
              value={this.state.slider}
              min={0}
              max={data.length-1}
              onChange={this.sliderChange.bind(this)}
              tipFormatter={this.scaleSlider.bind(this)}
            />
          );
        }
      }
      Plots = (
        <div>
          <h4 style={{ textAlign: 'center' }}>
            {' '}
            {this.props.info.title}
            {' '}
          </h4>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <XAxis
                dataKey="agent_utc"
                type='number'
                allowDataOverflow
                domain={plot_domain}
                tickFormatter={unixTime => moment(mjd2cal(unixTime).getTime()).format('YYYY-MM-DD hh:mm a')}
              >
              >
                <Label value={this.props.info.plot_labels[0]} offset={0} position="insideBottom" />
              </XAxis>
              <YAxis domain={['auto', 'auto']}>
                <Label value={this.props.info.plot_labels[1]} angle={-90} position="insideLeft" />
              </YAxis>
              <Tooltip labelFormatter={(val) => utc2date(val)} />
              {lines}
            </LineChart>
          </ResponsiveContainer>
          {slider}
        </div>
      );
    } else {
      Plots = <Alert message="No data available" type="error" showIcon />;
    }

    return (
      <div>
        {Plots}
      </div>
    );
  }
}

export default PlotWidget;
