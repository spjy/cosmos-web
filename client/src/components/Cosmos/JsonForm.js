import React, { Component } from 'react';
// import { Button, Icon, Modal } from 'antd';

// Form to Select Json File
class JsonForm extends Component {

  constructor(){
    super();
    this.handleFileChosen= this.handleFileChosen.bind(this);
    // console.log(this.props)
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
          this.saveJsonFile(json);

      };
      fileReader.readAsText(file);
    };
  saveJsonFile(json){ // saves content from json file to state
    var state= this.state;
    state.jsonArray=json;
    state.file_chosen=true;
    this.setState(state);
    this.props.onChangeJson(json);
  }

  render() {

    return (
      <div className='upload-json'>
        <input type='file'
               id='json-file'
               className='input-file'
               accept='.json'
               onChange={e => this.handleFileChosen(e.target.files[0])}
        />

    </div>
    );
  }

}

export default JsonForm;
