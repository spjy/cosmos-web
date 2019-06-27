import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  Alert, Modal, Form, Input
} from 'antd';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Label
} from 'recharts';
import CosmosWidget from '../CosmosWidgetComponents/CosmosWidget';
import { AgentSelect, DataNameSelect } from '../CosmosWidgetComponents/FormComponents';
import {
  utc2date, mjd2cal
} from '../Cosmos/Libs';

const colors = ['#82ca9d', '#9ca4ed', '#f4a742', '#e81d0b', '#ed9ce6'];

class PlotWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // slider: 0,
      // fix_slider: true,
      show_form: false,
      data: [],
      form_valid: true,
      jsonStructure: [],
      prevJsonStructure: [],
      form: { // keeps track of form changes
        agent: '',
        node: '',
        data_name: [],
        plot_labels: ['', ''],
        xRange: null,
        title: ''
      }
    };
  }

  componentDidMount() {
    // save incoming data to state
    if (this.props.info.agent === '') {
      this.setState({ show_form: true });
    }
  }

  componentDidUpdate(prevProps) {
    // save incoming data to state
    if (prevProps.data.agent_utc !== this.props.data.agent_utc) {
      const newData = this.props.data;
      // console.log(this.props.data)
      this.dataAppend(newData);
    }
  }

  onOK = () => {
    let valid = true;
    // validate form here
    if (this.state.form.agent === '') valid = false;
    if (this.state.form.data_name.length < 1) valid = false;

    if (valid) {
      this.props.updateInfo(this.props.id, this.state.form);
      this.closeForm();
    } else {
      this.setState({ form_valid: false });
    }
  }

  onCancel = () => {
    if (this.state.form.agent !== this.props.info.agent) {
      this.setState(prevState => ({ jsonStructure: prevState.prevJsonStructure }));
    }
    this.setState({
      form: {
        agent: this.props.info.agent,
        node: this.props.info.node,
        data_name: this.props.info.data_name,
        plot_labels: [this.props.info.plot_labels[0], this.props.info.plot_labels[1]],
        xRange: this.props.info.xRange,
        title: this.props.info.title
      },
      show_form: false
    });
  }

  handleFieldChange = (e) => {
    // handle form changes
    const { form } = this.state;
    switch (e.target.id) {
      case 'xLabel':
        form.plot_labels[0] = e.target.value;
        break;
      case 'yLabel':
        form.plot_labels[1] = e.target.value;
        break;
      case 'xRange':
        form.xRange = Number(e.target.value);
        break;
      default:
        form[e.target.id] = e.target.value;
        break;
    }
    this.setState({ form });

    e.preventDefault();
  }

  selectAgent = (value) => {
    // onchange function for AgentSelect
    const agentName = value.agent.agent_proc;
    const nodeName = value.agent.agent_node;
    const { structure } = value.agent;
    const { form } = this.state;


    if (form.agent !== agentName && form.agent !== '') { // empty dataset selected if agent changes
      form.data_name = [];
    }
    if (agentName !== this.props.info.agent && form.agent === this.props.info.agent) {
      this.setState(prevState => ({ prevJsonStructure: prevState.jsonStructure }));
    }
    form.agent = agentName;
    form.node = nodeName;

    this.setState({ form, jsonStructure: structure });
  }

  openForm = () => {
    this.setState({
      show_form: true,
      form: {
        agent: this.props.info.agent,
        node: this.props.info.node,
        data_name: this.props.info.data_name,
        plot_labels: [this.props.info.plot_labels[0], this.props.info.plot_labels[1]],
        xRange: this.props.info.xRange,
        title: this.props.info.title
      }
    });
  }

  selectDataName = (value) => {
    this.setState((prevState) => {
      const { form } = prevState;
      form.data_name = value;
      return { form };
    });
  }

  initializeAgent = (agent) => {
    this.selectAgent(agent);
  }

  dataAppend(newData) {
    let { data } = this.state;
    data = [...data, newData];
    if (this.props.info.xRange) {
      let i = 0;
      const startTime = newData.agent_utc - (this.props.info.xRange / 1440);
      while (i < this.state.data.length && data[i].agent_utc < startTime) {
        i += 1;
      }
      if (i > 0) data = data.slice(i);
    }
    this.setState({ data });
  }

  // sliderChange(value) {
  //   let fix = false;
  //   if (value === this.props.data.length - 1) {
  //     fix = true;
  //   }
  //   this.setState({ slider: value, fix_slider: fix });
  // }

  scaleSlider(val) {
    return utc2date(this.props.data[val].agent_utc);
  }


  closeForm() {
    this.setState({ show_form: false });
  }

  render() {
    const { data } = this.state;
    // console.log(this.props.info.values)
    let Plots;
    let plotDomain;
    // let startTime;
    // let endTime;
    let slider;
    const lines = [];
    if (data.length > 0) {
      for (let i = 0; i < this.props.info.values.label.length; i += 1) {
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
      // startTime = data[data.length - 1].agent_utc - (this.props.info.xRange / 1440);
      // endTime = data[data.length - 1].agent_utc;
      plotDomain = ['auto', 'auto'];
      // if(data[0].agent_utc < start_time){ // show slider
      //
      //   if(this.state.fix_slider){
      //     plot_domain=[start_time, end_time];
      //     // data=data.splice()
      //     slider = <Slider value={end_time}
      //       min={0}sssssss
      //       max={data.length-1}
      //       onChange={this.sliderChange}
      //       tipFormatter={this.scaleSlider}
      //       />
      //   }
      //   else {
      //     plot_domain=[data[this.state.slider].agent_utc-(this.props.info.xRange/1440),
      // data[this.state.slider].agent_utc];
      //     slider = <Slider value={this.state.slider}
      //       min={0}
      //       max={data.length-1}
      //       onChange={this.sliderChange}
      //       tipFormatter={this.scaleSlider}
      //       />
      //   }
      //
      // }
      Plots = (
        <div>
          <h4 style={{ textAlign: 'center' }}>
            {this.props.info.title}
          </h4>
          <ResponsiveContainer width="100%" height={400}>

            <LineChart data={data}>
              <XAxis
                dataKey="agent_utc"
                type="number"
                allowDataOverflow
                domain={plotDomain}
                tickFormatter={unixTime => (moment(mjd2cal(unixTime).getTime()).format('YYYY-MM-DD hh:mm a'))}
              >
                <Label value={this.props.info.plot_labels[0]} offset={0} position="insideBottom" />
              </XAxis>
              <YAxis domain={['auto', 'auto']}>
                <Label value={this.props.info.plot_labels[1]} angle={-90} position="insideLeft" />
              </YAxis>
              <Tooltip labelFormatter={(val) => { utc2date(val); }} />
              {lines}
            </LineChart>
          </ResponsiveContainer>
          {slider}
        </div>
      );
    } else {
      Plots = <Alert message="No data available" type="error" showIcon />;
    }

    const formStyle = {};
    return (
      <CosmosWidget
        id={this.props.id}
        title={`[${this.props.info.node}] ${this.props.info.agent}`}
        mod={this.props.mod}
        selfDestruct={this.props.selfDestruct}
        editWidget={this.openForm}
      >
        <Modal
          visible={this.state.show_form}
          title="Widget Settings"
          onOk={this.onOK}
          onCancel={this.onCancel}
        >
          <Form layout="inline">
            <AgentSelect
              agent={this.state.form.agent}
              onMount={this.initializeAgent}
              onChange={this.selectAgent}
            />
            <DataNameSelect
              value={this.state.form.data_name}
              onChange={this.selectDataName}
              structure={this.state.jsonStructure}
            />
            <Form.Item label="Title" key="title">
              <Input
                placeholder="Title"
                id="title"
                onChange={this.handleFieldChange}
                value={this.state.form.title}
                style={formStyle}
              />
            </Form.Item>
            <Form.Item label="X-Axis Label" key="xLabel">
              <Input
                placeholder="Label"
                id="xLabel"
                onChange={this.handleFieldChange}
                value={this.state.form.plot_labels[0]}
                style={formStyle}
              />
            </Form.Item>
            <Form.Item label="Y-Axis Label" key="yLabel">
              <Input
                placeholder="Label"
                id="yLabel"
                onChange={this.handleFieldChange}
                value={this.state.form.plot_labels[1]}
                style={formStyle}
              />
            </Form.Item>
            <Form.Item label="Time Range (minutes)" key="xRange">
              <Input
                placeholder="Time Range (minutes)"
                id="xRange"
                onChange={this.handleFieldChange}
                value={this.state.form.xRange}
                style={formStyle}
              />
            </Form.Item>
          </Form>
          {!this.state.form_valid && <Alert message="Incomplete" type="warning" showIcon />}
        </Modal>
        {Plots}
      </CosmosWidget>
    );
  }
}

PlotWidget.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.shape({
    widgetClass: PropTypes.string.isRequired,
    agent: PropTypes.string,
    node: PropTypes.string,
    plot_labels: PropTypes.arrayOf(PropTypes.string),
    xRange: PropTypes.number,
    title: PropTypes.string,
    data_name: PropTypes.arrayOf(PropTypes.string),
    values: PropTypes.shape({
      label: PropTypes.arrayOf(PropTypes.string),
      structure: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
      )
    })
  }).isRequired,
  data: PropTypes.shape({
    agent_utc: PropTypes.number
  }),
  selfDestruct: PropTypes.func.isRequired,
  updateInfo: PropTypes.func.isRequired,
  mod: PropTypes.bool
};

PlotWidget.defaultProps = {
  mod: true,
  data: {}
};

export default PlotWidget;

export function DefaultPlot() {
  return {
    widgetClass: 'PlotWidget',
    agent: '',
    node: '',
    plot_labels: ['', ''],
    xRange: 10,
    title: 'Plot Title',
    data_name: [],
    values: {
      label: [],
      structure: []
    }
  };
}
