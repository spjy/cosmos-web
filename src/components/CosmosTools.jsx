import React, { Component } from 'react';
import {
  Select, Button, Card, Icon, Checkbox
} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo';
import Navbar from './Global/Navbar';
import CosmosContainer from './CosmosWidgetComponents/CosmosContainer';
import SelectWidgetConfigDBForm from './CosmosWidgetComponents/SelectWidgetConfigDBForm';
import WidgetConfigDBFormSave from './CosmosWidgetComponents/WidgetConfigDBFormSave';

import { DefaultPlot } from './CosmosWidgets/LivePlotWidget';
import { DefaultTable } from './CosmosWidgets/LiveDataTable';
import { DefaultAgentRequest } from './CosmosWidgets/AgentRequest';

const socket = io(cosmosInfo.socket);

/* COSMOS Widgets that need to be imported */
const plotWidget = require('./CosmosWidgets/LivePlotWidget').default;
const dataTableWidget = require('./CosmosWidgets/LiveDataTable').default;
const agentListWidget = require('./CosmosWidgets/AgentList').default;
const agentRequestWidget = require('./CosmosWidgets/AgentRequest').default;

const imports = {
  LivePlotWidget: plotWidget,
  LiveDataTable: dataTableWidget,
  AgentListWidget: agentListWidget,
  AgentRequest: agentRequestWidget
};

/* Widget Type options to select from */
const allWidgets = [
  'Live Plot',
  'Table',
  'Agent List',
  'Agent Request'
];

/* widgetDefault():
 *  returns default info object for the widgetType
 */
function widgetDefault(widgetType) {
  const widgetName = allWidgets[widgetType];
  switch (widgetName) {
    case 'Live Plot':
      return DefaultPlot();
    case 'Table':
      return DefaultTable();
    case 'Agent List':
      return { widgetClass: 'AgentListWidget' };
    case 'Agent Request':
      return DefaultAgentRequest();
    default:
      return {};
  }
}

/* This component allows the user to create a widget interface
 *  - configurations of widgets can be loaded from saved in DB
 */

class CosmosTools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newWidgetType: -1,
      showDBConfigModal: false,
      showDBSaveModal: false,
      edit: false,
      widgets: [],
      dbConfigInfo: {
        name: '',
        description: '',
        author: '',
        id: ''
      },
      min: false
    };
  }

  addWidget = () => {
    const { widgets } = this.state;
    widgets.push(widgetDefault(this.state.newWidgetType));
    this.setState({ widgets });
  }

  onChangeNewWidgetType = (val) => {
    this.setState({ newWidgetType: val });
  }

  onClickEdit = () => {
    /* changes prop of all widgets to 'mod'
     *   - allows user to modify widget configurations
    */
    this.setState({ edit: true });
  }

  onClickSave = () => {
    /* opens WidgetConfigDBFormSave Modal
     *  to save configurations to widget_configurations in DB
     */
    this.setState({ showDBSaveModal: true });
  }

  onClickLoadWidgets = () => {
    this.setState({ showDBConfigModal: true });
  }

  closeDBConfigModal = (selection) => {
    if (selection.id === '') {
      this.setState({ showDBConfigModal: false });
    } else {
      const w = [];
      for (let i = 0; i < selection.widgets.length; i += 1) {
        w.push(selection.widgets[i]);
      }
      this.setState({
        showDBConfigModal: false,
        dbConfigInfo: {
          id: selection._id,
          name: selection.name,
          author: selection.author,
          description: selection.description
        },
        widgets: w
      });
    }
  }

  closeDBSaveModal = () => {
    this.setState({ showDBSaveModal: false, edit: false });
  }

  onClickNewConfig = () => {
    this.setState({ edit: true });
  }

  updateConfigID = (msg) => {
    this.setState((prevState) => {
      const { dbConfigInfo } = prevState;
      dbConfigInfo.id = msg.id;
      return { dbConfigInfo, showDBSaveModal: false, edit: false };
    });
  }

  updateWidgets = (widgets) => {
    /* function to pass to CosmosContainer to update *this* state
     *   when widgets are modified
    */
    // console.log(widgets)
    this.setState({ widgets });
  }

  onChangeShowHeader = (e) => {
    this.setState({ min: e.target.checked });
  }

  deleteConfig = () => {
    this.setState({
      newWidgetType: -1,
      showDBConfigModal: false,
      showDBSaveModal: false,
      edit: false,
      widgets: [],
      dbConfigInfo: {
        name: '',
        description: '',
        author: '',
        id: ''
      },
      min: false
    });
  }

  updateDBConfig = (dbInfo) => {
    const db = {
      id: dbInfo.id,
      name: dbInfo.name,
      author: dbInfo.author,
      description: dbInfo.description
    };
    this.setState({ dbConfigInfo: db });
    if (dbInfo.id === '') {
      const data = {
        name: dbInfo.name,
        description: dbInfo.description,
        author: dbInfo.author,
        created: new Date(),
        edited: new Date(),
        widgets: this.state.widgets
      };

      socket.emit('save widget_config', data, this.updateConfigID);
    } else {
      socket.emit('update widget_config', {
        id: dbInfo.id,
        data: {
          name: dbInfo.name,
          description: dbInfo.description,
          author: dbInfo.author,
          edited: new Date(),
          widgets: this.state.widgets
        }
      });

      this.setState({ showDBSaveModal: false, edit: false });
    }
  }

  render() {
    const showAdd = this.state.newWidgetType >= 0 && this.state.edit;
    const widgetOptions = [
      <Select.Option value={-1} key={-1}>
        Select Widget Type
      </Select.Option>];
    for (let i = 0; i < allWidgets.length; i += 1) {
      widgetOptions.push(
        <Select.Option key={i} value={i}>
          {allWidgets[i]}
        </Select.Option>
      );
    }
    let action; // action button: 'Edit' or 'Save'
    if (this.state.edit) {
      action = (
        <Button.Group size="small" style={{ display: 'inline', float: 'right' }}>
          <Button onClick={this.onClickSave}><Icon type="save" /></Button>
          <Button onClick={this.deleteConfig}><Icon type="delete" /></Button>
        </Button.Group>
      );
    } else {
      action = (
        <Button.Group size="small" style={{ display: 'inline', float: 'right' }}>
          <Button onClick={this.onClickEdit}><Icon type="setting" /></Button>
          <Button onClick={this.deleteConfig}><Icon type="delete" /></Button>
        </Button.Group>
      );
    }

    return (
      <div>
        <Navbar current="cosmostools" />
        <div style={{ margin: '10px' }}>
          {(this.state.widgets.length === 0) && (
            [
              <Button key="config" type="default" onClick={this.onClickLoadWidgets}> Select Configuration from Database </Button>,
              <Button key="save" type="default" onClick={this.onClickNewConfig}> New Configuration</Button>
            ]
          )
          }
        </div>
        {(this.state.widgets.length > 0 || this.state.edit) && (
          <Card size="small" title={this.state.dbConfigInfo.name} extra={action} style={{ margin: '10px' }}>
            <CosmosContainer
              mod={this.state.edit}
              widgets={this.state.widgets}
              imports={imports}
              min={this.state.min}
              updateWidgets={this.updateWidgets}
            />
            {this.state.edit
              && (
                <div>
                  <br />
                  <h3>Add Widget </h3>
                  <Select
                    value={this.state.newWidgetType}
                    onChange={this.onChangeNewWidgetType}
                    style={{ minWidth: '200px' }}
                  >
                    {widgetOptions}
                  </Select>
                  {showAdd && <Button onClick={this.addWidget}><Icon type="plus" /></Button>}
                </div>
              )
            }
            {this.state.edit && (
              <div>
                <br />
                <h3>Settings </h3>
                <Checkbox onChange={this.onChangeShowHeader} checked={this.state.min}>
                  Hide Widget Header
                </Checkbox>
              </div>
            )}
          </Card>
        )
        }

        <SelectWidgetConfigDBForm
          close={this.closeDBConfigModal}
          visible={this.state.showDBConfigModal}
        />
        <WidgetConfigDBFormSave
          update={this.updateDBConfig}
          close={this.closeDBSaveModal}
          dbInfo={this.state.dbConfigInfo}
          visible={this.state.showDBSaveModal}
        />
      </div>
    );
  }
}

export default CosmosTools;
