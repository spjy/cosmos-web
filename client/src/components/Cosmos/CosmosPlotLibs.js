export function parse_live_data(data, fields) {
  var values = {};
  var p, val;
  values.agent_utc=Number(data.agent_utc);
  for(var i = 0; i < fields.label.length; i++){
    p = fields.structure[i];
    val = data;
    for(var j = 0; j <p.length; j++ ){
      val=val[p[j]];
    }

    values[fields.label[i]]=Number(val);
  }

  return values;
}
export async function update_agent_info(cosmos_widget_config, info) {
  await cosmos_widget_config.update(info);
}

export async function get_all_agent_info(cosmos_widgets) {
  for (let i = 0; i < cosmos_widgets.length; i++) {
    await cosmos_widgets[i].setup_agent();
  }
}

export async function setup_agent(agent) {
  await agent.setup_agent();
}
