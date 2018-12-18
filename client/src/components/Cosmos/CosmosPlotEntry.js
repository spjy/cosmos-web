

class CosmosPlotEntry  {
  // var agent :string;
  // var node :string;
  // var plot_title :string;
  // var xLabel :string;
  // var yLabel :string;
  // var visible :boolean;
  // var xRange: number;
  // var yRange: number;

  constructor(jsonObj){
    if(jsonObj){
      console.log("cosmos",jsonObj)
      this.agent = jsonObj.agent;
      this.node = jsonObj.node;
      this.plot_title = jsonObj.title;
      this.xLabel = jsonObj.xLabel;
      this.yLabel = jsonObj.yLabel;
      this.yRange = jsonObj.yRange;
      this.xRange = jsonObj.xRange;
      this.visible = jsonObj.visible;


      this.agent_info=null;
      this.live = false;
      this.archive = false;
      this.values=[];
      for(var i =0; i <jsonObj.values; i++){
        this.values.push(jsonObj.values[i].data);
      }
    }
    else{
      this.agent = "";
      this.node = "";
      this.plot_title = "";
      this.xLabel = "";
      this.yLabel = "";
      this.yRange = 10;
      this.xRange = 3600;
      this.visible = true;
      this.values=[]
      this.agent_info=null;
      this.live = false;
      this.archive = false;
    }
  }

  update_from_json(jsonObj){
    this.agent = jsonObj.agent;
    this.node = jsonObj.node;
    this.plot_title = jsonObj.title;
    this.xLabel = jsonObj.xLabel;
    this.yLabel = jsonObj.yLabel;
    this.yRange = jsonObj.yRange;
    this.xRange = jsonObj.xRange;
    this.visible = jsonObj.visible;
    this.agent_info=null;
    this.live = false;
    this.archive = false;
    this.values=[];
    for(var i =0; i <jsonObj.values; i++){
      this.values.push(jsonObj.values[i].data);
    }
  }
  toJson(){
    return( {
      "agent": this.agent,
      "node": this.node,
      "title": this.plot_title,
      "values": this.values,
      "visible":this.visible,
      "xLabel": this.xLabel,
      "xRange": this.xRange,
      "yLabel": this.yLabel,
      "yRange": this.yRange
    });
  }
  set_live_status(status){
    this.live = status;
  }
  set_archive_status(status){
    this.archive = status;
  }
  agent_name(){return this.agent;};

}

export default CosmosPlotEntry;
