import React, { Component } from 'react';
import CosmosAgentJson from './CosmosAgentJson';
// const default_json =     {
//         "agent": "",
//         "node": "",
//         "title": "",
//         "values": [
//             {
//                 "data": "",
//                 "logdata": 1,
//                 "name": "",
//                 "precision": 7,
//                 "scale": 1,
//                 "units": ""
//             }
//         ],
//         "visible": 0,
//         "xLabel": "",
//         "xRange": 0,
//         "yLabel": "",
//         "yRange": 0
//     };
function Plots(props){
  var plots = props.info;
  const result =  plots.map(function(p, index){
          return <CosmosAgentJson key={index} id={index} jsonObj = {p} saveJsonObj={props.saveJsonObj} />;
        });
  return result;
}
class CosmosJsonParser extends Component {

  constructor(){
    super();
    this.handleFileChosen= this.handleFileChosen.bind(this);
    this.state = {
      jsonArray: []
    }
  }
  handleFileChosen = (file) => {
    let fileReader;
      fileReader = new FileReader();
      fileReader.onloadend = (e) => {
          const content = fileReader.result;
          var json = JSON.parse(content)
          // this.props.updateJsonObj(json); // pass json to DataPlot::onJsonUpload()
          this.setState({jsonArray: json});
      };
      fileReader.readAsText(file);
    };

  updateJson(jsonObj, index){
    var jsonArr = this.state.jsonArray;
    while( jsonArr.length <= index){
      jsonArr.push({});
    }
    this.state.jsonArray[index] = jsonObj;
    //TODO : write changes to file
    const file_content = JSON.stringify(this.state.jsonArray);
    console.log(file_content)
  }
  render() {

    var plots = (this.state.jsonArray ? this.state.jsonArray: []) ;
    return (
      <div className='upload-json'>
        <input type='file'
               id='json-file'
               className='input-file'
               accept='.json'
               onChange={e => this.handleFileChosen(e.target.files[0])}
        />
        <br/>

          <Plots info={plots} saveJsonObj={this.updateJson.bind(this)} />
    </div>
    );
  }

}

export default CosmosJsonParser;
