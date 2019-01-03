import React, { Component } from 'react';
import { Table , Button} from 'antd';
import cosmosInfo from './CosmosInfo'

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
  title: 'Preview',
  dataIndex: 'preview',
  key: 'preview',
}

]

class ConfigSelectForm extends Component {

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
  preview(key){
    console.log("preview",key)
    this.setState({selection:key})
    this.props.onSelect(this.state.config[key])
  }
  updateTable(){
    fetch(`${cosmosInfo.socket}/api/plot_configurations`)
    .then(response => response.json())
    .then(data =>{
      this.setState({config:data.result})
      // console.log(data.result)
    }
    );
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
        preview:<Button onClick={this.preview.bind(this, i)}>Preview</Button>
      };

    }
      return (
        <div >
          <Table columns={columns} dataSource={data} size="small"/>
        </div>
      );

  }

}

export default ConfigSelectForm;
