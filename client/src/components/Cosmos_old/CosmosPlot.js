import React, { Component } from 'react';
import io from 'socket.io-client';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import cosmosInfo from './CosmosInfo'
const socket = io(cosmosInfo.socket);
function get_plot_structure(selection,  parent_str){

  var structure = [];
  if(!parent_str){
      parent_str = "";
  }
  if(parent_str === ""){

  }
  else {
    parent_str+="_";
  }
  var e = {fields:[]};
  for(var i=0; i <selection.length; i++){
    var num_lines = selection[i].num_values;
    if( num_lines === 1){
      e.fields.push (parent_str+selection[i].name);
    }
    else if(num_lines > 1){
      // when the data is an array
      var arr=[];
      for(var j=0; j< num_lines; j++){
        arr.push( parent_str+selection[i].name+'['+String(j)+']')
      }

      structure.push({fields:arr});
    }
    else {
      // when the data is an object
      var child_name = parent_str+selection[i].name;
      structure= structure.concat((get_plot_structure(selection[i].children, child_name)));
    }
  }
  if(e.fields.length){
    structure.push(e);
  }
  return structure;
}
function Plot(props){
/*  props.fields = ['', '', '']
 *
 */
  const ds = new DataSet();
  const dv = ds.createView().source(this.state.data);
  dv.transform({
    type: 'fold',
    fields:  props.fields,
    key: 'satellite',
    value: 'temperature',
  });
  const cols = {
    time: {
      range: [ 0,1 ]
    }
  }
  return (
    <div>
      <Chart height={400} data={dv} scale={cols} forceFit>
        <Legend />
        <Axis name="time" />
        <Axis name="Data" label={{formatter: val => `${val}°F`}}/>
        <Tooltip crosshairs={{type : "y"}}/>
        <Geom type="line" position="time*temperature" size={2} color={'satellite'} />
        <Geom type='point' position="time*temperature" size={4} shape={'circle'} color={'satellite'} style={{ stroke: '#fff', lineWidth: 1}} />
      </Chart>
    </div>
  );

}

function GroupPlots(props){
    /*
      props.structure = CosmosPlot.state.data_selection
       = [{ name: '', num_values: 0, children: []},...]
    */
    var data_selection = props.structure;
    // console.log("GroupPlots",data_selection)
    var plotFields= get_plot_structure(data_selection,  '');
    return (
      <div>
      {plotFields.map(function(p, index){
        return <Plot key={index} data = {props.data} fields = {p.fields}/>;
      })}

      </div>
    );



}

function get_data(selection, json_data, parent_str){

  var data_entry ={};
  if(!parent_str){
      parent_str = "";
  }
  if(parent_str === ""){
    data_entry['time'] =   json_data['agent_utc'];
  }
  else {
    parent_str+="_";
  }

  for(var i=0; i <selection.length; i++){
    var num_lines = selection[i].num_values;
    if( num_lines === 1){
      data_entry[ parent_str+selection[i].name]= json_data[selection[i].name] ;
    }
    else if(num_lines > 1){
      // when the data is an array
      for(var j=0; j< num_lines; j++){
        data_entry[ parent_str+selection[i].name+'['+String(j)+']'] = json_data[selection[i].name][j];
      }
    }
    else {
      // when the data is an object
      var child_name = parent_str+selection[i].name;
      data_entry = Object.assign({},
          data_entry,
          get_data(selection[i].children, json_data[selection[i].name],
          child_name));
    }
  }
  return data_entry;
}
// function get_data_recusion(select)
class CosmosPlot extends Component {
/* Returns a select box filled with active agents */
  constructor(props){
    super(props);

      this.state = {
        data:[],
        agent: props.agent,
        data_length:100
      };



  }

    componentDidMount() {
      socket.on('agent subscribe '+this.props.agent, (data) => { // subscribe to agent
        if (data) {
          // console.log(data)
          var saved_state = this.state;

          var data_entry = get_data(this.props.data_selected, data, '');
          // console.log(data_entry)
          saved_state.data.push(data_entry);
          if(saved_state.data.length > this.state.data_length){
            saved_state.data.shift();
          }
          this.setState(saved_state);
        }
      });
    }
    componentWillUnmount() {
      var prevState = this.props.agent;
      socket.removeAllListeners('agent subscribe '+prevState);
    }
    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      if (this.props.agent !== prevProps.agent) {
        console.log("CosmosPlot agent changed" );
        socket.removeAllListeners('agent subscribe '+prevProps.agent);
        var saved_state = this.state;
        saved_state.agent = this.props.agent;
        this.setState(saved_state);
        socket.on('agent subscribe '+this.props.agent, (data) => { // subscribe to agent
          if (data) {
            // console.log(data)
            var saved_state = this.state;

            var data_entry = get_data(this.props.data_selected, data, '');
            // console.log(data_entry)
            saved_state.data.push(data_entry);
            if(saved_state.data.length > this.state.data_length){
              saved_state.data.shift();
            }
            this.setState(saved_state);
          }
        });
      }

    }
    updateAgent(){
      var saved_state = this.state;
      socket.removeAllListeners('agent subscribe '+ saved_state.agent);
      saved_state.agent = this.props.agent;
      this.setState(saved_state);
      socket.on('agent subscribe '+this.props.agent, (data) => { // subscribe to agent
        if (data) {
          // console.log(data)
          var saved_state = this.state;

          var data_entry = get_data(this.props.data_selected, data, '');
          // console.log(data_entry)
          saved_state.data.push(data_entry);
          if(saved_state.data.length > this.state.data_length){
            saved_state.data.shift();
          }
          this.setState(saved_state);
        }
      });
    }

    render() {
      return (
        <div>
        <Chart height={400} data={dv} scale={cols} forceFit>
          <Legend />
          <Axis name="time" />
          <Axis name="Data" label={{formatter: val => `${val}°F`}}/>
          <Tooltip crosshairs={{type : "y"}}/>
          <Geom type="line" position="time*temperature" size={2} color={'satellite'} />
          <Geom type='point' position="time*temperature" size={4} shape={'circle'} color={'satellite'} style={{ stroke: '#fff', lineWidth: 1}} />
        </Chart>
        </div>
      );


    }
}

export default CosmosPlot;
