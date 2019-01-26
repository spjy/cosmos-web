import cosmosInfo from './../Cosmos/CosmosInfo'

export const widgetType = {
  NONE: 0,
  LIVE_PLOT: 1,
  AGENT_COMMAND: 2,
  COSMOS_DATA:3
};

class CosmosWidgetInfo  {

  constructor(obj){
    this.agent = obj.agent ? obj.agent : "";
    this.widget_type = obj.widget_type ? obj.widget_type : widgetType.NONE;
    this.title = obj.title ? obj.title: "";
    this.data_name = obj.data_name ? obj.data_name : [];
    this.plot_labels = obj.plot_labels? obj.plot_labels : ["",""];
    this.plot_range = obj.plot_range? obj.plot_range : [100,100];
    this.command_string = obj.command_string ? obj.command_string: "";
    this.values={};
  }


}


export default CosmosWidgetInfo;
