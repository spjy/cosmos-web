import React, { Component } from 'react';

const ImportFromFileBodyComponent = () => {
    let fileReader;

    const handleFileRead = (e) => {
        const content = fileReader.result;
        console.log(JSON.parse(content));
        // … do something with the 'content' …
    };

    const handleFileChosen = (file) => {
        fileReader = new FileReader();
        fileReader.onloadend = handleFileRead;
        fileReader.readAsText(file);
    };

    return <div className='upload-expense'>
        <input type='file'
               id='file'
               className='input-file'
               accept='.json'
               onChange={e => handleFileChosen(e.target.files[0])}
        />
    </div>;
};

class CosmosJsonParser extends Component {

  constructor(){
    super();
    this.handleFileChosen= this.handleFileChosen.bind(this);
  }
  handleFileChosen = (file) => {
    let fileReader;
      fileReader = new FileReader();
      fileReader.onloadend = (e) => {
          const content = fileReader.result;
          var json = JSON.parse(content)
          this.props.updateJsonObj(json); // pass json to DataPlot::onJsonUpload()
      };
      fileReader.readAsText(file);
    };
  handleChange(){

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

export default CosmosJsonParser;
