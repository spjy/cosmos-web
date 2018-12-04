import React, { Component } from 'react';
import CosmosAgentJson from './CosmosAgentJson';

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
  handleChange(){

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
        { plots.map(function(p, index){
                return <CosmosAgentJson key={index} jsonObj = {p} />;
              })}
    </div>
    );
  }

}

export default CosmosJsonParser;
