import React, { useState } from 'react';
import {
  Select, Button, Card, Icon, Checkbox
} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from './Cosmos/CosmosInfo';
import Navbar from './Global/Navbar';
import CosmosContainer from './CosmosWidgetComponents/CosmosContainer';
import { SelectWidgetConfigForm, SaveWidgetConfigForm } from './CosmosWidgetComponents/WidgetConfig';

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

export default function CosmosTools() {
  const [newWidgetType, setNewWidgetType] = useState(-1);

  const [showDBConfigModal, setShowDBConfigModal] = useState(false);
  const [showDBSaveModal, setShowDBSaveModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [widgets, setWidgets] = useState([]);
  const [min, setMin] = useState(false);

  const [dbConfigInfo, setDBConfigInfo] = useState({
    name: '',
    description: '',
    author: '',
    id: ''
  });


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


  return (
    <div>
      <Navbar current="cosmostools" />
      <div style={{ margin: '10px' }}>
        {(widgets.length === 0) && (
          [
            <Button
              key="config"
              type="default"
              onClick={() => setShowDBConfigModal(true)}
            >
              Select Configuration from Database
            </Button>,
            <Button
              key="save"
              type="default"
              onClick={() => setEdit(true)}
            >
              New Configuration
            </Button>
          ]
        )
        }
      </div>
      {(widgets.length > 0 || edit) && (
        <Card
          size="small"
          title={dbConfigInfo.name}
          extra={(
            <Button.Group size="small" style={{ display: 'inline', float: 'right' }}>
              {edit && <Button onClick={() => setShowDBSaveModal(true)}><Icon type="save" /></Button>}
              {!edit && <Button onClick={() => setEdit(true)}><Icon type="setting" /></Button>}
              <Button onClick={() => {
                setNewWidgetType(-1);
                setShowDBSaveModal(false);
                setShowDBConfigModal(false);
                setEdit(false);
                setWidgets([]);
                setDBConfigInfo({
                  name: '',
                  description: '',
                  author: '',
                  id: ''
                });
              }}
              >
                <Icon type="delete" />
              </Button>
            </Button.Group>
          )}
          style={{ margin: '10px' }}
        >
          <CosmosContainer
            mod={edit}
            widgets={widgets}
            imports={imports}
            min={min}
            updateWidgets={() => setWidgets(widgets)}
          />
          {edit
            && (
              <div>
                <br />
                <h3>Add Widget </h3>
                <Select
                  value={newWidgetType}
                  onChange={val => setNewWidgetType(val)}
                  style={{ minWidth: '200px' }}
                >
                  {widgetOptions}
                </Select>
                {(newWidgetType >= 0 && edit) && (
                  <Button
                    onClick={() => {
                      const w = widgets;
                      w.push(widgetDefault(newWidgetType));
                      setWidgets(w);
                    }}
                  >
                    <Icon type="plus" />
                  </Button>
                )}
              </div>
            )
          }
          {edit && (
            <div>
              <br />
              <h3>Settings </h3>
              <Checkbox
                onChange={e => setMin(e.target.checked)}
                checked={min}
              >
                Hide Widget Header
              </Checkbox>
            </div>
          )}
        </Card>
      )
      }

      {showDBConfigModal && (
        <SelectWidgetConfigForm
          close={(selection) => {
            if (selection.id !== '') {
              const w = [];
              for (let i = 0; i < selection.widgets.length; i += 1) {
                w.push(selection.widgets[i]);
              }
              setWidgets(w);
              setDBConfigInfo({
                id: selection._id,
                name: selection.name,
                author: selection.author,
                description: selection.description
              });
            }
            setShowDBConfigModal(false);
          }}
        />
      )}
      {showDBSaveModal && (
        <SaveWidgetConfigForm
          update={(dbInfo) => {
            setDBConfigInfo({
              id: dbInfo.id,
              name: dbInfo.name,
              author: dbInfo.author,
              description: dbInfo.description
            });
            if (dbInfo.id === '') {
              const data = {
                name: dbInfo.name,
                description: dbInfo.description,
                author: dbInfo.author,
                created: new Date(),
                edited: new Date(),
                widgets
              };

              socket.emit('save widget_config', data, msg => setDBConfigInfo({
                id: msg.id,
                name: dbInfo.name,
                author: dbInfo.author,
                description: dbInfo.description
              }));
            } else {
              socket.emit('update widget_config', {
                id: dbInfo.id,
                data: {
                  name: dbInfo.name,
                  description: dbInfo.description,
                  author: dbInfo.author,
                  edited: new Date(),
                  widgets
                }
              });
            }
            setShowDBSaveModal(false);
            setEdit(false);
          }}
          close={() => {
            setShowDBSaveModal(false);
            setEdit(false);
          }
          }
          dbInfo={dbConfigInfo}
        />
      )
      }

    </div>
  );
}
