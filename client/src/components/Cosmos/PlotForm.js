import React, { Component } from 'react';
import { Form, Select, Badge, TreeSelect, Alert, Input , Row, Col ,Card , Icon} from 'antd';
import cosmosInfo from './CosmosInfo'
import io from 'socket.io-client';
const socket = io(cosmosInfo.socket);
function generate_treeselect_data(structure){
  var tree_data = [];
  for(var i =0; i < structure.length; i++){
    var entry = structure[i];
    var parent=tree_data;
    var title = '';
    for(var j=0; j < entry.length; j++){
      var index;
      var child_index;

      if(j === 0){ // first level, find in tree_data
        title=entry[0];
        index = tree_data.findIndex(x => x.title === title);
        if(index >= 0){ // found at first level
          // set parent as tree_data[index]
          parent = tree_data[index];
        }
        else { // add to tree_data
          if(j===entry.length-1){ // add to tree_data without chidlren []
            tree_data.push({
              title:title,
              value:title,
              key:title
            });
            parent = null;
          }
          else {// add to tree_data with children , set added entry as parent
            child_index =tree_data.push({
              title:title,
              value:title,
              key:title,
              children:[]
            });
            parent = tree_data[child_index-1]
          }
        }
      }
      else { // find in parent.children
        title +='_'+entry[j];
        index = parent.children.findIndex(x => x.title === title);

        if(index >= 0){ // found, set parent as parent.children[index]
          parent = parent.children[index];
        }
        else { // not found, add entry
          // console.log('looking for',title, "in", parent.children,"given", index)
          if(j===entry.length-1){ // add to parent.children without chidlren []
            parent.children.push({
              title:title,
              value:title,
              key:title
            });
            parent = null;
          }
          else {// add to parent.children with children , set added entry as parent
            child_index =parent.children.push({
              title:title,
              value:title,
              key:title,

              children:[]
            })
            parent = parent.children[child_index-1]
          }
        }
      }
    }
  }
  // console.log('tree',tree_data)
  return tree_data;
}

class PlotForm extends Component {
  /* this.props.updateInfo() = function to call when updating form info
  // this.props.info
  */
  constructor(props){
    super(props);
    var data_selected = [];
    for(var i=0; i < this.props.info.jsonvalues.length; i++){
      data_selected.push(this.props.info.jsonvalues[i].data);
    }
      this.state = {
        agent_list:[],
        data_selected:data_selected
      };


  }


  componentDidMount() {
    fetch(`${cosmosInfo.socket}/api/agent_list`)
    .then(response => response.json())
    .then(data =>
      this.setState({agent_list:data.result})
    );
    socket.on('agent update list', (data) => { // subscribe to agent
        if (data) {
          var agents = this.state.agent_list;
          for(var i=0; i < agents.length; i++){
              if(data[agents[i].agent_proc]) {
                // console.log( agents[i].agent_proc," live")
                agents[i].live=true;
              } else {
                agents[i].live=false;
              }
          }
          this.setState({agent_list:agents})
        }
      });
  }

  componentDidUpdate(prevProps){
    var data_selected =[];

    if(this.props.info.jsonvalues !== prevProps.info.jsonvalues){
      for(var i=0; i < this.props.info.jsonvalues.length; i++){
        data_selected.push(this.props.info.jsonvalues[i].data);
      }
      this.setState({
        data_selected: data_selected
      });
    }
  }
  componentWillUnmount() {
    socket.removeAllListeners('agent update list');
  }

  agentSelected(value) {
      this.props.updateInfo({ /* calls DataPlot->updateEntry()*/
        id: this.props.id,
        agent:this.state.agent_list[value].agent_proc,
        values: []
      });
    this.setState({
      data_selected: []
    });

  }
  dataSelected(value) {
    // console.log("values selected:", value)
    this.props.updateInfo({
      id: this.props.id,
      agent:this.props.info.agent,
      values:value
    });
    this.setState({data_selected : value});
  }

  handleSubmit = (e) => {
    e.preventDefault();
  }
  handleFieldChange(event){
    // console.log("key:",event.target.id)
    // console.log("value:",event.target.value)
    this.props.updateValue({key:event.target.id, value: event.target.value, id: this.props.id});
  }
  onClickDelete = (e) => {
    e.preventDefault();
    this.props.selfDestruct(this.props.id);
    console.log('The link was clicked.');
  };
render() {
    //agent list
    const AgentOption = Select.Option;
    var agent_names=[];
    var agent_list  = this.state.agent_list;
    var badge;
    for(var i =0; i < agent_list.length; i++){
      badge="default"
      if(agent_list[i].live===true) badge ="success"
      agent_names.push(<AgentOption key={i} ><Badge status={badge} /> {agent_list[i].agent_proc} </AgentOption>);
    }
    var tree_data =[];
    var AgentStatus;
    var agent_status_msg;
    if(this.props.info.live){
      // agent_status_msg=this.state.agent.agent_proc +" is Live";
      agent_status_msg=this.props.info.agent +" is Live";
      AgentStatus = <Alert message={agent_status_msg} type="success" showIcon />
      tree_data = generate_treeselect_data(this.props.info.structure);
    }
    else {
      // agent_status_msg="There is no data for agent "+this.state.agent.agent_proc ;
      agent_status_msg="There is no data for agent "+this.props.info.agent ;
      AgentStatus =  <Alert message={agent_status_msg} type="warning" showIcon />
    }
    tree_data = generate_treeselect_data(this.props.info.structure);

    const form_style = {width: '300px'}
    var agentSelect= <Select
                      showSearch
                      value={this.props.info.agent}
                      onChange={this.agentSelected.bind(this)}
                      style={form_style}
                    >
                      {agent_names}
                    </Select>

    const tree_props = {
      treeData: tree_data,
      value: this.state.data_selected,
      onChange: this.dataSelected.bind(this),
      treeCheckable:true,
      showCheckedStrategy:TreeSelect.SHOW_PARENT,
      searchPlaceholder:'Select',
    };
    return (
      <div style={{ padding: '0 1em' , margin: '20px' }}>
        <Card actions={[<a  onClick={this.onClickDelete.bind(this)}><Icon type="delete"/></a>]}>
            <Form layout="vertical" onSubmit={this.handleSubmit.bind(this)}>
              <Row gutter={16}>
                <Col span={8} >
                  <Form.Item label="Plot Title">
                    <Input placeholder="Title"
                      id="plot_title"
                      onChange={this.handleFieldChange.bind(this)}
                      value={this.props.info.plot_title}
                    style={form_style}/>
                  </Form.Item>
                </Col>
                <Col span={8}  >
                  <Form.Item label="X-Axis Label">
                    <Input placeholder="Label"
                      id="xLabel"
                      onChange={this.handleFieldChange.bind(this)}
                      value={this.props.info.xLabel}
                    style={form_style}/>
                  </Form.Item>
                </Col>
                <Col span={8} >
                  <Form.Item label="Y-Axis Label">
                    <Input placeholder="Label"
                      id="yLabel"
                      onChange={this.handleFieldChange.bind(this)}
                      value={this.props.info.yLabel}
                    style={form_style}/>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8} >
                  <Form.Item label="Agent">
                  {agentSelect}
                  </Form.Item>
                </Col>
                <Col span={8}  >
                  <Form.Item label="DataSet">
                    <TreeSelect style={{width: '300px'}} {... tree_props}>
                    </TreeSelect>
                  </Form.Item>
                </Col>
                <Col span={8}  >
                </Col>
              </Row>



            </Form>
            {AgentStatus}
        </Card>
      </div>
    );
  }

}

export default PlotForm;
