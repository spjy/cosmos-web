import cosmosInfo from './CosmosInfo'

class CosmosPlotEntry  {


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
      this.values={label:[],structure:[]};
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
      this.values={label:[],structure:[]};
      this.jsonvalues=[];
      this.live = false;
      this.archive = false;
      this.map=[];
      this.structure=[];
    }
  }

  setup_agent (){
    /* fetch the MongoDB entry in agent_list for this agent
      needs to be called after constructor
    */
    // console.log("setup_agent")
    return fetch(`${cosmosInfo.socket}/api/cosmos_agent/${this.agent}`)
      .then(response => response.json())
      .then(data =>
        this.agent_info_received(data.result[0])
    );
  }
  update(info){
    // console.log("update", info)
    var vals = info.values;
    var jsonvals = [];
    for(var i =0; i < vals.length; i++){
      jsonvals.push({data: vals[i]})
    }
    this.jsonvalues= jsonvals;
    if(info.agent !== this.agent){
      this.agent = info.agent;
      this.fetch_agent_info();
    }
    else {
      this.generate_values();
    }


  }
  fetch_agent_info(){
    // console.log("fetch_agent_info")
    return fetch(`${cosmosInfo.socket}/api/cosmos_agent/${this.agent}`)
      .then(response => response.json())
      .then(data =>{
        // console.log(data)
        var info = data.result[0];
        if(info){
          this.structure = info.structure;
          this.generate_structure_map();
          this.generate_values();
        }
        else {
          this.fill_no_info();
        }

      }
    );
  }
  fill_no_info(){
    this.archive = false;
    this.values={label:[], structure:[]};
    this.structure = [];
    for(var i=0; i < this.jsonvalues.length;i++){
      this.values.label.push(this.jsonvalues[i].data);
      this.values.structure.push([this.jsonvalues[i].data])
      this.structure.push([this.jsonvalues[i].data]);
      this.map.push({
        string: this.jsonvalues[i].data,
       values: [String(i)]});
    }
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
       this.fill_no_info();
       // console.log("values",this.values)
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
    /* populate values array from jsonvalues list*/
    var vals={label:[],structure:[]};
    var temp;
    for(var i=0; i < this.jsonvalues.length; i++){
      temp = this.map_string(this.jsonvalues[i].data);
      for(var j=0; j< temp.length; j++){
        vals.label.push(this.list_to_string(this.structure[temp[j]]));
        vals.structure.push(this.structure[temp[j]]);

      }

    }
    this.values = vals;
    // console.log("values",vals);
  }

  // helper functions
  list_to_string(l){
    var str =l[0];
    for(var i=1;i<l.length;i++){
      str+="_"+l[i];
    }
    return str;
  }
  map_string(value_string){
    var ind = this.map.findIndex(x=>x.string === value_string);
    if( ind >=0){
      return this.map[ind].values;
    }
    else return [];
  }
  to_json(){
    return {
      "agent":this.agent,
      "node":this.node,
      "title":this.plot_title,
      "xLabel":this.xLabel,
      "yLabel":this.yLabel,
      "yRange":this.yRange,
      "xRange": this.xRange,
      "visible":this.visible,
      "values":this.jsonvalues
    }
  }

}


export default CosmosPlotEntry;
