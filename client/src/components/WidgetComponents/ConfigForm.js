import React, { Component } from 'react';
import { Table , Button, Icon, Card , Modal} from 'antd';
import cosmosInfo from './../Cosmos/CosmosInfo'
import io from 'socket.io-client';
const socket = io(cosmosInfo.socket);
const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name',
},{
  title: 'Description',
  dataIndex: 'description',
  key: 'description',
},
{
  title: 'Author',
  dataIndex: 'author',
  key: 'author',
},
{
  title: 'Created on',
  dataIndex: 'created',
  key: 'created',
},
{
  title: 'Edited',
  dataIndex: 'edited',
  key: 'edited',
},
{
  title: 'Select',
  dataIndex: 'select',
  key: 'select',
}

]

class ConfigForm extends Component {

  constructor(props){
    super(props);
    // console.log(this.props)
    this.state = {
      config:[],
      selection: -1,
    }

  }
  componentDidMount() {
    this.updateTable();
  }
  select(key){
    // console.log(this.state.config[key])
    this.setState({selection:key})
    // this.props.onSelect(this.state.config[key])
  }
  updateTable(){
    // console.log("update table")
    socket.emit('list_widget_config', {},this.receivedDBList.bind(this));

  }
  receivedDBList(msg){
    this.setState({config:msg});
  }
  hideModal(){
     this.props.hide();
  }
  onOK(){
    // console.log(this.state.config[this.state.selection])
    this.props.onSelect(this.state.config[this.state.selection]);
    this.props.hide();
  }
  render() {
    var db_result = this.state.config;
    var data=[];

    for(var i = 0; i < db_result.length; i++){
      data[i]= {
        key: String(i),
        name: db_result[i].name,
        description:db_result[i].description ,
        author:db_result[i].author ,
        created:db_result[i].created ,
        edited:db_result[i].edited,
        select:<Button onClick={this.select.bind(this, i)}>Select</Button>
      };
      if(i===this.state.selection){
        data[i].select=<Button disabled>Selected</Button>
      }
    }

    var disableOK= false;
     disableOK =true;
    var modal_buttons=[<Button key="back" onClick={this.hideModal.bind(this)}>Cancel</Button>];
    if( this.state.selection===-1){
      modal_buttons.push(<Button key="ok" type="primary" onClick={this.onOK.bind(this)} disabled >OK</Button>);
    } else {
      modal_buttons.push(<Button key="ok" type="primary" onClick={this.onOK.bind(this)} >OK</Button>);
    }

      return (
        <div style={{margin:'10px'}}>
          <Modal
            visible={true}
            title="Available Configurations"
            footer={modal_buttons}
            onCancel={this.hideModal.bind(this)}
            width='100%'
          >
            <Table columns={columns} dataSource={data} size="small"/>
          </Modal>
        </div>
      );

  }

}

export default ConfigForm;
