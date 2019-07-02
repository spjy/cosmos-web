import React, { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import CosmosAgent from './CosmosAgent';
import { parseLiveData } from './Utils';
import cosmosInfo from '../Cosmos/CosmosInfo';

const socket = io(cosmosInfo.socket);


/* This component is the container component for a group of widgets
 - this component monitors COSMOS Agent data, and passes relevant data to each widget
  (does not store history, only one at a time )
*/


class CosmosContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      agents: {},
      widgets: []
    };
  }

  componentDidMount() {
    this.updateWidgetFromProps();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.widgets.length !== this.props.widgets.length) {
      if (this.state.widgets.length !== this.props.widgets.length) {
        this.updateWidgetFromProps();
      }
    }
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
    const { widgets } = this.state;
    widgets.splice(index.id, 1);
    this.setState({ widgets });
    this.props.updateWidgets(widgets);
  }

  addAgent = (widgetID, widget) => {
    const agentName = widget.agent;
    const { agents } = this.state;
    const { widgets } = this.state;
    widgets[widgetID] = widget;
    if (agents[agentName]) {
      if (widgets[widgetID].data_name) {
        widgets[widgetID].values = agents[agentName].info
          .getDataStructure(widgets[widgetID].data_name);
        this.setState({ agents, widgets });
        this.props.updateWidgets(widgets);
      }
    } else {
      agents[agentName] = { info: new CosmosAgent({ agent: agentName }), data: {} };
      agents[agentName].info.asyncSetup()
        .then(() => {
          if (widgets[widgetID].data_name) {
            widgets[widgetID].values = agents[agentName]
              .info.getDataStructure(widgets[widgetID].data_name);
            this.setState({ agents, widgets });
            this.props.updateWidgets(widgets);
            this.startListening(agentName);
          }
        });
    }
  }

  updateWidget = (index, info) => {
    // called from child components when widgets are modified
    // console.log(info)
    const { widgets } = this.state;
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
      this.setState({ widgets });
      this.props.updateWidgets(widgets);
    }
  }

  updateWidgetFromProps() {
    // instantiate all agents, start listening for data
    const { widgets } = this.props;
    const agents = {};
    for (let i = 0; i < widgets.length; i += 1) {
      if ('agent' in widgets[i] && widgets[i].agent !== '') {
        const agentName = widgets[i].agent;
        if (agents[agentName]) { // add json names to track
          if (widgets[i].data_name) {
            if (widgets[i].values.label.length === 0) {
              widgets[i].values = agents[agentName].info
                .getDataStructure(widgets[i].data_name);
              this.setState({ widgets });
            }
            this.startListening(agentName);
          }
        } else {
          agents[agentName] = { info: new CosmosAgent({ agent: agentName }), data: {} };
          agents[agentName].info.asyncSetup()
            .then(() => {
              if (widgets[i].data_name) {
                if (widgets[i].values.label.length === 0) {
                  widgets[i].values = agents[agentName].info
                    .getDataStructure(widgets[i].data_name);
                }
                this.setState({ widgets, agents });
                this.startListening(agentName);
              }
            });
        }
      }
    }
    console.log(agents)
  }

  startListening(agentname) {
    console.log('startlistening: ', agentname);
    socket.emit('start record', agentname);
    socket.on(`agent subscribe ${agentname}`, (data) => { // subscribe to agent
      if (data && this.state.agents[agentname]) {
        // console.log(data)
        let e;
        const { agents } = this.state;
        // console.log(agents[agentname]);
        if (agents[agentname].info.values.label.length > 0) {
          e = parseLiveData(data, agents[agentname].info.values);
          agents[agentname].data = e;
          console.log(e);
          this.setState({ agents });
        }
      }
    });
  }

  render() {
    const widgets = [];
    let WidgetComponent;
    for (let i = 0; i < this.state.widgets.length; i += 1) {
      WidgetComponent = this.props.imports[this.state.widgets[i].widgetClass];
      if (WidgetComponent) {
        if (this.state.widgets[i].agent
          && this.state.agents[this.state.widgets[i].agent]
          && this.state.widgets[i].data_name) {
          widgets.push(
            <WidgetComponent
              key={i}
              id={i}
              info={this.state.widgets[i]}
              data={this.state.agents[this.state.widgets[i].agent].data}
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
              info={this.state.widgets[i]}
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
  reloadWidgetsFlag: PropTypes.bool,
  updateWidgets: PropTypes.func
};

CosmosContainer.defaultProps = {
  imports: {},
  mod: true,
  min: false,
  reloadWidgetsFlag: false,
  updateWidgets: () => {}

};
export default CosmosContainer;
