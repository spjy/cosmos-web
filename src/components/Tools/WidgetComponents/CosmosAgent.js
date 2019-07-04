/* global fetch:false */
import cosmosInfo from '../../Cosmos/CosmosInfo';

function getIndex(map, str) {
  return map.findIndex(x => x.string === str);
}

// helper functions
function list2string(l) {
  let str = l[0];
  for (let i = 1; i < l.length; i += 1) {
    str += `_${l[i]}`;
  }
  return str;
}

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

  async asyncSetup() {
    await fetch(`${cosmosInfo.socket}/api/cosmos_agent/${this.agent}`)
      .then(response => response.json())
      .then((data) => {
        this.agentInfoReceived(data.result[0]);
      });
  }

  agentInfoReceived(info) {
    if (info) {
      this.archive = true;
      this.structure = info.structure;
      this.node = info.agent_node;
      this.generateStructureMap();
    } else {
      this.archive = false;
      this.structure = [];
    }

    this.live = false;
  }

  generateStructureMap() {
    const { structure } = this;
    const map = [];
    let str;
    let index;
    for (let i = 0; i < structure.length; i += 1) {
      for (let j = 0; j < structure[i].length; j += 1) {
        if (j === 0) str = structure[i][j];
        else str += `_${structure[i][j]}`;
        // index = map.findIndex(x => x.string === str);
        index = getIndex(map, str);
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

  getDataStructure(datanames) {
    const vals = { label: [], structure: [] };
    let temp;
    for (let i = 0; i < datanames.length; i += 1) {
      this.addvalue(datanames[i]);
      temp = this.mapName(datanames[i]);
      for (let j = 0; j < temp.length; j += 1) {
        vals.label.push(list2string(this.structure[temp[j]]));
        vals.structure.push(this.structure[temp[j]]);
      }
    }
    this.populateJsonValues();
    return vals;
  }

  addvalue(jsonName) {
    let newName = true;
    for (let i = 0; i < this.datanames.length; i += 1) {
      if (this.datanames[i] === jsonName) newName = false;
    }
    if (newName) {
      this.datanames.push(jsonName);
    }
  }

  populateJsonValues() {
    /* populate values array from jsonvalues list */
    const vals = { label: [], structure: [] };
    let temp;
    // console.log("jsonvalues:",this.jsonvalues)
    for (let i = 0; i < this.datanames.length; i += 1) {
      temp = this.mapName(this.datanames[i]);
      for (let j = 0; j < temp.length; j += 1) {
        vals.label.push(list2string(this.structure[temp[j]]));
        vals.structure.push(this.structure[temp[j]]);
      }
    }
    this.values = vals;
  }

  mapName(str) {
    const ind = this.map.findIndex(x => x.string === str);
    if (ind >= 0) {
      return this.map[ind].values;
    }
    return [];
  }
}

export default CosmosAgent;
