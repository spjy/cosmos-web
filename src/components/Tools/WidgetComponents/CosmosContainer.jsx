import React, { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import CosmosAgent from './CosmosAgent';
import { parseLiveData } from './Utils';
import cosmosInfo from '../../Cosmos/CosmosInfo';

const socket = io(cosmosInfo.socket);


/* This component is the container component for a group of widgets
 - this component monitors COSMOS Agent data, and passes relevant data to each widget
  (does not store history, only one at a time )
*/


class CosmosContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agents: {}
    };
  }

  componentDidMount() {
    this.updateWidgetFromProps();
  }

  componentWillUnmount() {
    // remove listeners
    const agents = Object.keys(this.state.agents);
    for (let i = 0; i < agents.length; i += 1) {
      socket.removeAllListeners(`agent subscribe ${agents[i]}`);
      socket.emit('end record', agents[i]);
    }
  }


  removeWidget = (index) => {
    // function passed to widgets to delete a widget
    const { widgets } = this.props;
    widgets.splice(index.id, 1);
    this.props.updateWidgets(widgets);
  }

  addAgent = (widgetID, widget) => {
    if ('agent' in widget
      && 'data_name' in widget
      && widget.agent !== ''
      && widget.data_name.length > 0) {
      const agentName = widget.agent;
      const { agents } = this.state;
      const { widgets } = this.props;
      widgets[widgetID] = widget;
      if (agents[agentName]) {
        if (widgets[widgetID].data_name) {
          agents[widgets[widgetID].agent].widgets.push(widgetID);
          const v = agents[agentName].info
            .getDataStructure(widgets[widgetID].data_name);
          widgets[widgetID].values = v;
          this.setState({ agents });
          this.props.updateWidgets(widgets);
        }
      } else {
        agents[agentName] = {
          info: new CosmosAgent({ agent: agentName }),
          data: {},
          widgets: [widgetID]
        };
        agents[agentName].info.asyncSetup()
          .then(() => {
            if (widgets[widgetID].data_name) {
              widgets[widgetID].values = agents[agentName]
                .info.getDataStructure(widgets[widgetID].data_name);
              this.setState({ agents });
              this.props.updateWidgets(widgets);
              this.startListening(agentName);
            }
          });
      }
    } else {
      const { widgets } = this.props;
      widgets[widgetID] = widget;
      this.props.updateWidgets(widgets);
    }
  }

  updateWidget = (index, info) => {
    // called from child components when widgets are modified

    const { widgets } = this.props;
    let trackAgent = false;
    const changes = Object.keys(info);
    let key;
    for (let i = 0; i < changes.length; i += 1) {
      key = changes[i];
      widgets[index][key] = info[key];
      if (key === 'data_name') {
        widgets[index].values = { label: [], structure: [] };
        trackAgent = true;
      }
    }
    if (trackAgent) {
      this.addAgent(index, widgets[index]);
    } else {
      this.props.updateWidgets(widgets);
    }
  }

  updateWidgetFromProps() {
    // instantiate all agents, start listening for data

    const { widgets } = this.props;
    const agents = {};
    // create agents list
    for (let i = 0; i < widgets.length; i += 1) {
      if ('agent' in widgets[i]
        && 'data_name' in widgets[i]
        && widgets[i].agent !== ''
        && widgets[i].data_name.length > 0) {
        if (agents[widgets[i].agent]) {
          agents[widgets[i].agent].widgets.push(i);
        } else {
          agents[widgets[i].agent] = { widgets: [i] };
        }
      }
    }
    // setup agents
    const agentNames = Object.keys(agents);
    for (let i = 0; i < agentNames.length; i += 1) {
      agents[agentNames[i]].info = new CosmosAgent({ agent: agentNames[i] });
      agents[agentNames[i]].data = {};
      agents[agentNames[i]].info.asyncSetup().then(() => {
        const agentName = agentNames[i];
        const widgetIDs = agents[agentName].widgets;

        for (let j = 0; j < widgetIDs.length; j += 1) {
          const v = agents[agentName].info.getDataStructure(
            this.props.widgets[widgetIDs[j]].data_name
          );
          this.props.widgets[widgetIDs[j]].values = v;
        }
        this.startListening(agentName);
        this.setState({ agents });
        this.props.updateWidgets(widgets);
      });
    }
  }

  startListening(agentname) {
    socket.emit('start record', agentname);
    socket.on(`agent subscribe ${agentname}`, (data) => { // subscribe to agent
      if (data && this.state.agents[agentname]) {
        let e;
        const { agents } = this.state;
        if (agents[agentname].info.values.label.length > 0) {
          e = parseLiveData(data, agents[agentname].info.values);
          agents[agentname].data = e;
          this.setState({ agents });
        }
      }
    });
  }

  render() {
    const widgets = [];
    let WidgetComponent;
    for (let i = 0; i < this.props.widgets.length; i += 1) {
      WidgetComponent = this.props.imports[this.props.widgets[i].widgetClass];
      if (WidgetComponent) {
        if (this.props.widgets[i].agent
          && this.state.agents[this.props.widgets[i].agent]
          && this.props.widgets[i].data_name) {
          widgets.push(
            <WidgetComponent
              key={i}
              id={i}
              info={this.props.widgets[i]}
              data={this.state.agents[this.props.widgets[i].agent].data}
              mod={this.props.mod}
              min={this.props.min}
              selfDestruct={this.removeWidget}
              updateInfo={this.updateWidget}
            />
          );
        } else {
          widgets.push(
            <WidgetComponent
              key={i}
              id={i}
              info={this.props.widgets[i]}
              mod={this.props.mod}
              min={this.props.min}
              selfDestruct={this.removeWidget}
              updateInfo={this.updateWidget}
            />
          );
        }
      }
    }
    return (
      <div>
        {widgets}
      </div>
    );
  }
}


CosmosContainer.propTypes = {
  widgets: PropTypes.arrayOf(PropTypes.object).isRequired,
  imports: PropTypes.shape({}),
  mod: PropTypes.bool, // true: widgets can be modified
  min: PropTypes.bool, // true: minimal GUI
  // function to update parent component when widgets are modified
  // reloadWidgetsFlag: PropTypes.bool,
  updateWidgets: PropTypes.func
};

CosmosContainer.defaultProps = {
  imports: {},
  mod: true,
  min: false,
  // reloadWidgetsFlag: false,
  updateWidgets: () => {}

};
export default CosmosContainer;
