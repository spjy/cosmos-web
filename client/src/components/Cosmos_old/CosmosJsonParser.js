import React, { Component } from 'react';
import CosmosAgentJson from './CosmosAgentJson';
import { Button, Icon, Modal } from 'antd';
const default_json =     {
        "agent": "null",
        "node": "",
        "title": "",
        "values": [
            {
                "data": "",
                "logdata": 1,
                "name": "",
                "precision": 7,
                "scale": 1,
                "units": ""
            }
        ],
        "visible": 0,
        "xLabel": "",
        "xRange": 0,
        "yLabel": "",
        "yRange": 0
    };
function Plots(props){
  var plots = props.info;
  const result =  plots.map(function(p, index){
          return <CosmosAgentJson key={index} id={index} jsonObj = {p} saveJsonObj={props.saveJsonObj}
          selfDestruct={props.selfDestruct} />;
        });
  return result;
}
class CosmosJsonParser extends Component {

  constructor(){
    super();
    this.handleFileChosen= this.handleFileChosen.bind(this);
    this.state = {
      jsonArray: [],
      file_chosen:false,
      view_modal:false
    }

  }
  handleFileChosen = (file) => {
    let fileReader;
      fileReader = new FileReader();
      fileReader.onloadend = (e) => {
          const content = fileReader.result;
          var json = JSON.parse(content)
          // this.props.updateJsonObj(json); // pass json to DataPlot::onJsonUpload()
          this.setState({jsonArray: json, file_chosen:true});
      };
      fileReader.readAsText(file);
      // console.log(file)
    };

  updateJson(jsonObj, index){
    var saved_state = this.state;
    var jsonArr = this.state.jsonArray;
    while( jsonArr.length <= index){
      jsonArr.push({});
    }
    jsonArr[index] = jsonObj;
    saved_state.jsonArray = jsonArr;
      this.setState(saved_state);
    //TODO : write changes to file
    const file_content = JSON.stringify(this.state.jsonArray);
    console.log(file_content)
  }
  removeChild(index){
    // console.log("goodbye", index)
    var saved_state = this.state;
    saved_state.jsonArray.splice(index,1);
    this.setState(saved_state);
  }
  onClickAdd(){
    var saved_state = this.state;
    saved_state.jsonArray.push(default_json);
    this.setState(saved_state);
  }
  copyJsonToClipboard(){
    this.textArea.select();
    document.execCommand('copy');

    var saved_state = this.state;
    saved_state.view_modal=false;
    this.setState(saved_state);
  }
  viewJson(){
    var saved_state = this.state;
    saved_state.view_modal=true;
    this.setState(saved_state);
  }
  render() {

    var plots = (this.state.jsonArray ? this.state.jsonArray: []) ;
    var addButton=<Button type='default' onClick={this.onClickAdd.bind(this)}><Icon type="plus"/> New Plot</Button>;
    var contents= JSON.stringify(this.state.jsonArray, null,2);
    var modal = <Modal title="Json content"
      visible={this.state.view_modal}
      onOk={this.copyJsonToClipboard.bind(this)}
      okText="Copy to Clipboard (rn this doesnt do anything)"
    >
    <textarea ref={(textarea) => this.textArea = textarea } value={contents}/>
    </Modal>;
    var view_modal_button = <Button type='default' onClick={this.viewJson.bind(this)}> View </Button>;
    return (
      <div className='upload-json'>
        {this.state.view_modal && modal}

        <input type='file'
               id='json-file'
               className='input-file'
               accept='.json'
               onChange={e => this.handleFileChosen(e.target.files[0])}
        />
        {this.state.file_chosen && view_modal_button}
        <br/>

          <Plots info={plots} saveJsonObj={this.updateJson.bind(this)} selfDestruct={this.removeChild.bind(this)}/>
          {addButton}
        <br/>

    </div>
    );
  }

}

export default CosmosJsonParser;
