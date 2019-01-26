import cosmosInfo from './CosmosInfo'

class CosmosAgent  {


  constructor(jsonObj){

    this.agent = jsonObj.agent ? jsonObj.agent : "";
    this.node = jsonObj.node ? jsonObj.node : "";
    this.live = false;
    this.archive = false;
    this.map=[];
    this.structure=[];
    this.values={};
    this.datanames=[];
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
     }
     else {
       this.archive = false;
       this.structure = [];

     }
     this.live = false;
     return "done";
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
        }
        else {
          // this.fill_no_info();
        }

      }
    );
  }
  // fill_no_info(){
  //   this.archive = false;
  //   this.values={label:[], structure:[]};
  //   this.structure = [];
  //   for(var i=0; i < this.jsonvalues.length;i++){
  //     // console.log(this.jsonvalues[i].data);
  //     this.values.label.push(this.jsonvalues[i].data);
  //     this.values.structure.push([this.jsonvalues[i].data])
  //     this.structure.push([this.jsonvalues[i].data]);
  //     this.map.push({
  //       string: this.jsonvalues[i].data,
  //      values: [String(i)]});
  //   }
  // }

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
  get_data_structure(data_names){
    var vals={label:[],structure:[]};
    var temp;
    for(var i=0; i < data_names.length; i++){
      this.addvalue(data_names[i])
      temp = this.map_string(data_names[i]);
      for(var j=0; j< temp.length; j++){
        vals.label.push(this.list_to_string(this.structure[temp[j]]));
        vals.structure.push(this.structure[temp[j]]);

      }

    }
    // console.log("agent", this.agent, vals)
    return vals;

  }
  addvalue(json_name){
    var new_name = true;
    for(var i=0; i <this.datanames.length; i++){
      if(this.datanames[i]===json_name) new_name = false;
    }
    if(new_name){
        this.datanames.push(json_name)
        this.generate_values();
      }

  }
  generate_values(){
    /* populate values array from jsonvalues list*/
    var vals={label:[],structure:[]};
    var temp;
    // console.log("jsonvalues:",this.jsonvalues)
    for(var i=0; i < this.datanames.length; i++){
      temp = this.map_string(this.datanames[i]);
      for(var j=0; j< temp.length; j++){
        vals.label.push(this.list_to_string(this.structure[temp[j]]));
        vals.structure.push(this.structure[temp[j]]);

      }

    }
    this.values = vals;
 // console.log("values",vals);
 //        console.log(this.jsonvalues)
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


}


export default CosmosAgent;
