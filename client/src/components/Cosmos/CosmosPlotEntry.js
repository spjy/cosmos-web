import cosmosInfo from './CosmosInfo'

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
      // console.log("cosmos",jsonObj)
      this.agent = jsonObj.agent;
      this.node = jsonObj.node;
      this.plot_title = jsonObj.title;
      this.xLabel = jsonObj.xLabel;
      this.yLabel = jsonObj.yLabel;
      this.yRange = jsonObj.yRange;
      this.xRange = jsonObj.xRange;
      this.visible = jsonObj.visible;
      this.live = false;
      this.archive = false;
      this.values=[];
      this.jsonvalues=jsonObj.values;
      this.map=[];
      this.structure=[];

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
      this.values=[];
      this.jsonvalues=[];
      this.live = false;
      this.archive = false;
      this.map=[];
      this.structure=[];
    }
  }
  update(info){
    console.log("update", info)
    this.agent = info.agent;

    this.values = info.values;
    this.fetch_agent_info();
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
    this.live = false;
    this.archive = false;
    this.values=[];
    this.map=[];
    this.jsonvalues=jsonObj.values;
    this.fetch_agent_info();
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
  // setup_agent = async()=>{
  //   const agent_info = await this.fetch_agent_info();
  //   return agent_info;
  //   // this.agent_info_received(agent_info)
  // }
  setup_agent (){
    /* fetch the MongoDB entry in agent_list for this agent */
    console.log("setup_agent")
    return fetch(`${cosmosInfo.socket}/api/cosmos_agent/${this.agent}`)
      .then(response => response.json())
      .then(data =>
        // {
      //   var info = data.result[0];
      //   if(info){
      //     this.archive = true;
      //     this.structure = info.structure;
      //     this.node = info.agent_node;
      //     this.generate_structure_map();
      //   }
      //   else {
      //     this.archive = false;
      //     this.values=[];
      //     this.structure = [];
      //     for(var i=0; i < this.jsonvalues.length;i++){
      //       this.values.push(String(i));
      //       this.structure.push([this.jsonvalues[i].data]);
      //       this.map.push({
      //         string: this.jsonvalues[i].data,
      //        values: [String(i)]});
      //     }
      //     console.log("values",this.values)
      //   }
      //   this.live = false;
      //   return "done";
      // }
      // //   // console.log('CosmosPlotEntry:fetch_agent_info', data.result)
        this.agent_info_received(data.result[0])
        // {return data.result[0]}
    );
  }
  fetch_agent_info(){
    console.log("fetch_agent_info")
    return fetch(`${cosmosInfo.socket}/api/cosmos_agent/${this.agent}`)
      .then(response => response.json())
      .then(data =>{
        var info = data.result[0];
        this.structure = info.structure;
        this.generate_structure_map();
      }

        // {return data.result[0]}
    );
  }
  agent_info_received(info){
    /* callback function for fetch_agent_info,
     * info= MongoDB object for the agent specified by this.agent
     */
     // console.log("agent info",info)
     if(info){
       this.archive = true;
       this.structure = info.structure;
       this.node = info.agent_node;
       this.generate_structure_map();
       this.generate_values();
     }
     else {
       this.archive = false;
       this.values=[];
       this.structure = [];
       for(var i=0; i < this.jsonvalues.length;i++){
         this.values.push(String(i));
         this.structure.push([this.jsonvalues[i].data]);
         this.map.push({
           string: this.jsonvalues[i].data,
          values: [String(i)]});
       }
       console.log("values",this.values)
     }
     this.live = false;
     return "done";
  }
  generate_structure_map(){
    /* generate a map of string to values in this.structure
     * handles the nested objects of the CosmosAgent data
     * Ex: "node_loc_pos_eci" maps to all nested values, but each can also be addressed individually
     */
    var structure = this.structure;
    var map = [];
    var str;
    var index;
    for(var i=0; i < structure.length; i++){
      for(var j = 0; j < structure[i].length; j++){
        if(j===0) str = structure[i][j];
        else str+="_"+structure[i][j];
        index = map.findIndex(x => x.string === str)
        if(index >= 0 ){
          map[index].values.push(String(i));
        }
        else {
          map.push({
            string: str,
            values:[String(i)]
          })
        }
      }
    }
    this.map = map;

  }
  generate_values(){
    /* populate values array */
    var vals=[];
    var temp;
    var index;
    for(var i=0; i < this.jsonvalues.length; i++){
      index = this.map.findIndex(x=> x.string === this.jsonvalues[i].data);
      if(index >=0){
        temp = vals.concat(this.map[index].values);
        vals = temp;
      }
    }
    this.values = vals;
    console.log("values",vals)
  }

}

export default CosmosPlotEntry;
