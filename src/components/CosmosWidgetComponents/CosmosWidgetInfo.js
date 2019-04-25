import cosmosInfo from './../Cosmos/CosmosInfo'

export const widgetType = {
  NONE: 0,
  LIVE_PLOT: 1,
  AGENT_COMMAND: 2,
  COSMOS_DATA:3,
  AGENT_LIST:4,
  ARCHIVE_PLOT:5,
  ORBIT:6
};

class CosmosWidgetInfo  {

  constructor(obj){
    this.agent = obj.agent ? obj.agent : "";
    this.node = obj.node ? obj.node : "";
    this.widget_type = obj.widget_type ? obj.widget_type : widgetType.NONE;

    this.title = obj.title ? obj.title: "";
    this.data_name = obj.data_name ? obj.data_name : [];
    this.plot_labels = obj.plot_labels? obj.plot_labels : ["",""];
    this.xRange = obj.xRange? obj.xRange : 60;
    this.command = obj.command ? obj.command: ["",""];
    this.values={};
    this.widgetClass=obj.widgetClass ? obj.widgetClass : "";
  }


}


export default CosmosWidgetInfo;
