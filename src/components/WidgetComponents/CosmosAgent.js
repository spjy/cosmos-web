import cosmosInfo from '../Cosmos/CosmosInfo';

class CosmosAgent {
  constructor(jsonObj) {
    this.agent = jsonObj.agent ? jsonObj.agent : '';
    this.node = jsonObj.node ? jsonObj.node : '';
    this.live = false;
    this.archive = false;
    this.map = [];
    this.structure = [];
    this.values = { label: [], structure: [] };
    this.datanames = [];
  }

  setup_agent() {
    return fetch(`${cosmosInfo.socket}/api/cosmos_agent/${this.agent}`)
      .then(response => response.json())
      .then(data => this.agent_info_received(data.result[0]));
  }

  agent_info_received(info) {
    if (info) {
      this.archive = true;
      this.structure = info.structure;
      this.node = info.agent_node;
      this.generate_structure_map();
    } else {
      this.archive = false;
      this.structure = [];
    }
    this.live = false;
    return 'done';
  }

  fetch_agent_info() {
    // console.log("fetch_agent_info")
    return fetch(`${cosmosInfo.socket}/api/cosmos_agent/${this.agent}`)
      .then(response => response.json())
      .then((data) => {
        // console.log(data)
        let info = data.result[0];
        if (info) {
          this.structure = info.structure;
          this.generate_structure_map();
        } else {
          // this.fill_no_info();
        }
      });
  }

  generate_structure_map() {
    const { structure } = this;
    const map = [];
    let str;
    let index;
    for (let i = 0; i < structure.length; i++) {
      for (let j = 0; j < structure[i].length; j++) {
        if (j === 0) str = structure[i][j];
        else str += '_' + structure[i][j];
        index = map.findIndex(x => x.string === str);
        if (index >= 0) {
          map[index].values.push(String(i));
        } else {
          map.push({
            string: str,
            values: [String(i)]
          });
        }
      }
    }
    this.map = map;
  }

  get_data_structure(data_names) {
    let vals = { label: [], structure: [] };
    let temp;
    for (let i = 0; i < data_names.length; i++) {
      this.addvalue(data_names[i]);
      temp = this.map_string(data_names[i]);
      for (let j = 0; j < temp.length; j++) {
        vals.label.push(this.list_to_string(this.structure[temp[j]]));
        vals.structure.push(this.structure[temp[j]]);
      }
    }
    // console.log("agent", this.agent, vals)
    return vals;
  }

  addvalue(json_name) {
    let new_name = true;
    for (let i = 0; i < this.datanames.length; i++) {
      if (this.datanames[i] === json_name) new_name = false;
    }
    if (new_name) {
      this.datanames.push(json_name);
      this.generate_values();
    }
  }

  generate_values() {
    /* populate values array from jsonvalues list */
    let vals = { label: [], structure: [] };
    let temp;
    // console.log("jsonvalues:",this.jsonvalues)
    for (let i = 0; i < this.datanames.length; i++) {
      temp = this.map_string(this.datanames[i]);
      for (let j = 0; j < temp.length; j++) {
        vals.label.push(this.list_to_string(this.structure[temp[j]]));
        vals.structure.push(this.structure[temp[j]]);
      }
    }
    this.values = vals;
    // console.log("values",vals);
    //        console.log(this.jsonvalues)
  }

  // helper functions
  list_to_string(l) {
    let str = l[0];
    for (let i = 1; i < l.length; i++) {
      str += '_' + l[i];
    }
    return str;
  }

  map_string(value_string){
    var ind = this.map.findIndex(x=>x.string === value_string);
    if( ind >=0){
      return this.map[ind].values;
    }
    return [];
  }
}


export default CosmosAgent;
