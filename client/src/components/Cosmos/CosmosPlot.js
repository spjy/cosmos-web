import React, { Component } from 'react';
import io from 'socket.io-client';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import CosmosPlotInfo from './CosmosPlotInfo';
// import CosmosAgent from './CosmosAgent';

const socket = io('http://localhost:3001');
function get_plot_structure(selection,  parent_str){

  var structure = [];
  if(!parent_str){
      parent_str = "";
  }
  if(parent_str === ""){

  }
  else {
    parent_str+=":";
  }
  var e = {fields:[]}
  // structure[0] = e;
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
  const dv = ds.createView().source(props.data);
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
    parent_str+=":";
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
constructor(){
  super();
    this.state = {
      agent_selection: '',
      data_selection: '',

      data_length:0,
      data:[]
    };

  }

    componentDidMount() {



    }
    componentWillUnmount() {
      var prevState = this.state.agent_selection;
      socket.removeAllListeners('agent subscribe '+prevState);
    }
    updateInfo(info){
      var prevState = this.state.agent_selection;
      var state = {
        agent_selection: info.agent_selection,
        data_selection: info.data_selection,
        data_length:info.data_length,
        data:[]
        };
        // console.log(info.data_selection );
      this.setState(state);
      socket.removeAllListeners('agent subscribe '+prevState);
      socket.on('agent subscribe '+state.agent_selection, (data) => {
        if (data) {
          // console.log(data)
          var saved_state = this.state;

          var data_entry = get_data(saved_state.data_selection, data, '');
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
          <CosmosPlotInfo updateInfo = {this.updateInfo.bind(this)} />
          <GroupPlots data={this.state.data} structure={this.state.data_selection}/>
        </div>
      );

    }
}

export default CosmosPlot;
