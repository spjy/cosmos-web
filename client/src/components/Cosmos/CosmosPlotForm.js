import React, { Component } from 'react';
import { Form, Select, Button, Icon, TreeSelect} from 'antd';
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
class CosmosPlotForm extends Component {

  constructor(props){
    super(props);
      this.state = {
        agent_list:[],
        agent: '',
        data_list:[],
        data_selected:[]
      };


  }
  componentDidMount() {
    // fetch agent list
    fetch(`${cosmosInfo.socket}/api/agent_list`)
    .then(response => response.json())
    .then(data =>
      this.setState({
        agent_list:data.result,
        agent: '',
        data_selected:[]
      })
    );
  }



  agentSelected(value) {
    var state = this.state;
    state.agent = this.state.agent_list[value];
    this.setState(state);
    // console.log("agent: ", this.state.agent," structure:", this.state.agent.structure);

  }
  dataSelected(value) {
    console.log("data:", value);
    var state = this.state;
    state.data_selected = value;
    this.setState(state);
  }
  dataSelected

  submit(e) {
    e.preventDefault();
    // call parent component function
    // this.props.onCosmosPlotFormSubmit({
    //   selected: this.state.selected,
    //   dateFrom: this.state.dateFrom,
    //   dateTo: this.state.dateTo,
    // })
  }


render() {
    //agent list
    const AgentOption = Select.Option;
    var agent_names=[];
    var agent_list  = this.state.agent_list;
    for(var i =0; i < agent_list.length; i++){
      agent_names.push(<AgentOption key={i} >{agent_list[i].agent_proc}</AgentOption>);
    }
    var tree_data = (this.state.agent==='')? [] : generate_treeselect_data(this.state.agent.structure);

    const tree_props = {
      treeData: tree_data,
      value: this.state.data_selected,
      onChange: this.dataSelected.bind(this),
      treeCheckable:true,
      showCheckedStrategy:TreeSelect.SHOW_CHILD,
      searchPlaceholder:'Select'
    };

    var contentList = {
      config_tab: <p>Configure</p>,
      plot_tab: <p>Plot</p>,
    };
    return (
      <div style={{ padding: '0 1em' }}>

            <Form layout="inline" onSubmit={this.submit.bind(this)}>
              <Form.Item label="Agent">
                <Select
                  showSearch
                  placeholder="Select"
                  onChange={this.agentSelected.bind(this)}
                  style={{width: '300px'}}
                >
                  {agent_names}
                </Select>
              </Form.Item>
              <Form.Item label="DataSet">
                <TreeSelect style={{width: '300px'}} {... tree_props}>
                </TreeSelect>
              </Form.Item>

              <Button type="primary" htmlType="submit" className="login-form-button">
                <Icon type="check"/>
              </Button>
            </Form>

      </div>
    );
  }

}

export default CosmosPlotForm;
