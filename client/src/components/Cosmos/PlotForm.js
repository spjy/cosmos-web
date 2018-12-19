import React, { Component } from 'react';
import { Form, Select, Button, Icon, TreeSelect, Alert} from 'antd';
import cosmosInfo from './CosmosInfo'

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
        if(index > 0){ // found at first level
          // set parent as tree_data[index]
          parent = tree_data[index];
        }
        else { // add to tree_data
          if(j===entry.length-1){ // add to tree_data without chidlren []
            tree_data.push({
              title:title,
              value: String(i),
              key: String(i)
            });
            parent = null;
          }
          else {// add to tree_data with children , set added entry as parent
            child_index =tree_data.push({
              title:title,
              value: 'parent'+String(i),
              key: 'parent'+String(i),
              children:[]
            });
            parent = tree_data[child_index-1]
          }
        }
      }
      else { // find in parent.children
        title +='_'+entry[j];
        index = parent.children.findIndex(x => x.title === title);
        if(index > 0){ // found, set parent as parent.children[index]
          parent = parent.children[index];
        }
        else { // not found, add entry
          if(j===entry.length-1){ // add to parent.children without chidlren []
            parent.children.push({
              title:title,
              value: String(i),
              key: String(i)
            });
            parent = null;
          }
          else {// add to parent.children with children , set added entry as parent
            child_index =parent.children.push({
              title:title,
              value: 'parent'+String(i),
              key: 'parent'+String(i),

              children:[]
            })
            parent = parent.children[child_index-1]
          }
        }
      }
    }
  }
  return tree_data;
}

function get_data_index(data_list, structure){
  var indexes = [];
  var dataname_iter;
  for(var i=0;i<data_list.length; i++){
    dataname_iter = data_list[i];
    for(var j = 0; j < dataname_iter.length; i++){

    }
  }
}
class PlotForm extends Component {
  /* this.props.updateInfo() = function to call when updating form info
  // this.props.info
  */
  constructor(props){
    super(props);
    var agent = this.props.info;
    /* load state from props.info CosmosPlotEntry class*/
    // console.log('Plotform:agent.vlaues =',this.props.info.values)
      this.state = {
        agent_list:[],
        agent: {agent_proc: this.props.info.agent, structure: this.props.info.structure },
        data_selected:this.props.info.values,
        valid: this.props.info.live || this.props.info.archive,
        edit: false
      };


  }


  componentDidMount() {
    console.log(this.state.agent)
  }

  componentDidUpdate(prevProps){
    if(this.props.info.agent !== prevProps.info.agent){
      this.setState({
        agent_list:[],
        agent: {agent_proc: this.props.info.agent, structure: this.props.info.structure },
        data_selected:this.props.info.values,
        valid: this.props.info.live || this.props.info.archive,
        edit: false
      })
    }
  }

  agentSelected(value) {
    // var state = this.state;
    // state.agent = this.state.agent_list[value];
    // state.data_selected=[];
    this.setState({
      agent: this.state.agent_list[value],
      data_selected: []
    });
    // console.log("agent: ", this.state.agent," structure:", this.state.agent.structure);

  }
  dataSelected(value) {
    console.log("data:", value);
    this.setState({data_selected : value});

  }
  receivedAgentList(agent_list){
    this.setState({
      agent_list: agent_list,
      edit:true
    });

  }
  onClickEdit(){
    fetch(`${cosmosInfo.socket}/api/agent_list`)
    .then(response => response.json())
    .then(data =>
      this.receivedAgentList(data.result)
    );
  }
  onClickDelete(){
    this.onClickCancel();
    this.props.selfDestruct(this.props.id);
  }

  onClickSave(){
    // call this.props.updateInfo() to update parent with values
    // set this.state.edit = false to disable inputs
    this.setState({edit:false});
    // TODO: call this.props.updateInfo to update parent component
    var info={
      id: this.props.id,
      agent:this.state.agent.agent_proc,
      values: this.state.data_selected
    }
    this.props.updateInfo(info);
  }
  onClickCancel(){
    // update state from props
    // set this.state.edit = false to disable inputs
    this.setState({
      agent_list:[],
      agent: {agent_proc: this.props.info.agent, structure: this.props.info.structure },
      data_selected:this.props.info.values,
      valid: this.props.info.live || this.props.info.archive,
      edit: false
    })
  }


render() {
    //agent list
    const AgentOption = Select.Option;
    var agent_names=[];
    var agent_list  = this.state.agent_list;
    for(var i =0; i < agent_list.length; i++){
      agent_names.push(<AgentOption key={i} >{agent_list[i].agent_proc}</AgentOption>);
    }
    var tree_data =[];
    var AgentStatus;
    var agent_status_msg;
    if(this.state.valid){
      // agent_status_msg=this.state.agent.agent_proc +" is Live";
      agent_status_msg=this.props.info.agent +" is Live";
      AgentStatus = <Alert message={agent_status_msg} type="success" showIcon />
      tree_data = generate_treeselect_data(this.state.agent.structure);
    }
    else {
      // agent_status_msg="There is no data for agent "+this.state.agent.agent_proc ;
      agent_status_msg="There is no data for agent "+this.props.info.agent ;
      AgentStatus =  <Alert message={agent_status_msg} type="warning" showIcon />
    }
    tree_data = generate_treeselect_data(this.state.agent.structure);
    var disable_form;

    var contentList = {
      config_tab: <p>Configure</p>,
      plot_tab: <p>Plot</p>,
    };
    var actionButtons;
    var agentSelect;
    if(this.state.edit){
      disable_form = false;
      actionButtons = [
        <Button type="default" key="0" onClick={this.onClickSave.bind(this)}>
          <Icon type="save"/>
        </Button>,
        <Button type="danger"  key="1" onClick={this.onClickCancel.bind(this)}>
          <Icon type="close"/>
        </Button> ,
        <Button type="default" key="2"onClick={this.onClickDelete.bind(this)}>
          <Icon type="delete"/>
        </Button>
              ];
      agentSelect= <Select
                        showSearch
                        value={this.state.agent.agent_proc}
                        onChange={this.agentSelected.bind(this)}
                        style={{width: '300px'}}
                      >
                        {agent_names}
                      </Select>
    } else{
      disable_form = true;
      agentSelect= <Select
                        showSearch
                        placeholder="Select"
                        value={this.state.agent.agent_proc}
                        onChange={this.agentSelected.bind(this)}
                        style={{width: '300px'}}
                        disabled
                      >
                        {agent_names}
                      </Select>
      actionButtons = <Button type="default" onClick={this.onClickEdit.bind(this)}>
          <Icon type="edit"/> Edit
        </Button>
    }
    const tree_props = {
      treeData: tree_data,
      value: this.state.data_selected,
      onChange: this.dataSelected.bind(this),
      treeCheckable:true,
      showCheckedStrategy:TreeSelect.SHOW_PARENT,
      searchPlaceholder:'Select',
      disabled:disable_form
    };
    return (
      <div style={{ padding: '0 1em' }}>

            <Form layout="inline" >
              <Form.Item label="Agent">
              {agentSelect}
              </Form.Item>
              <Form.Item label="DataSet">
                <TreeSelect style={{width: '300px'}} {... tree_props}>
                </TreeSelect>
              </Form.Item>
              {actionButtons}
            </Form>
            {AgentStatus}

      </div>
    );
  }

}

export default PlotForm;
