import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Collapse, Button } from 'antd';
import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';
import { Context } from '../../../store/neutron1';

const { Panel } = Collapse;
const { TextArea } = Input;

/**
 * Displays a specified value.
 */
function DisplayValue({
  name,
  displayValues,
  nodeProc,
  showStatus,
  status,
  children,
  formItems
}) {
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state that manages the node process */
  const [nodeProcessState, setNodeProcessState] = useState(nodeProc);
  /** Storage for form values */
  const [form, setForm] = useState({
    newChart: {}
  });

  const [displayValuesState, setDisplayValuesState] = useState(displayValues);
  /** Accessing the neutron1 node process context and drilling down to the specified node process to look at */
  const { state } = useContext(Context);

  useEffect(() => {
    // Make an object for each plot's form
    for (let i = 0; i < displayValuesState.length; i += 1) {
      form[i] = {};
    }
  }, []);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    displayValuesState.forEach((v, i) => {
      if (state[v.nodeProcess] && state[v.nodeProcess][v.dataKey]) {
        displayValuesState[i].value = state[v.nodeProcess][v.dataKey];
      }

      if (state[v.nodeProcess] && state[v.nodeProcess][v.dataKey] && state[v.nodeProcess].utc) {
        displayValuesState[i].utc = moment.unix((((state[v.nodeProcess].utc + 2400000.5) - 2440587.5) * 86400.0)).format('YYYYMMDDTHH:mm:ss');
      }
    });
  }, [state]);

  return (
    <BaseComponent
      name={nameState}
      liveOnly
      showStatus={showStatus}
      status={status}
      formItems={(
        <Form layout="vertical">

          <Form.Item
            label="Name"
            key="nameState"
            hasFeedback={form.nameState && form.nameState.touched}
            validateStatus={form.nameState && form.nameState.changed ? 'success' : ''}
          >
            <Input
              placeholder="Name"
              id="nameState"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setNameState(value);
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={name}
            />
          </Form.Item>

          <Collapse
            bordered
          >
            {
              displayValuesState.map((displayValue, i) => (
                <Panel
                  header={(
                    <span className="text-gray-600">
                      <span className="inline-block rounded-full mr-2 indicator" style={{ height: '6px', width: '6px', marginBottom: '2px' }} />
                      <strong>
                        {displayValue.nodeProcess}
                      </strong>
                      &nbsp;
                      <span>
                        {displayValue.name}
                      </span>
                    </span>
                  )}
                  key={`${displayValue.nodeProcess}${displayValue.dataKey}`}
                >
                  <Form.Item
                    label="Name"
                    key="name"
                    hasFeedback={form[i] && form[i].name && form[i].name.touched}
                    validateStatus={form[i] && form[i].name && form[i].name.changed ? 'success' : ''}
                  >
                    <Input
                      placeholder="Name"
                      id="name"
                      onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        displayValuesState[i].name = value;
                        setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                      }}
                      defaultValue={displayValue.name}
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label="Node Process"
                    key="nodeProcess"
                    hasFeedback={form[i] && form[i].nodeProcess && form[i].nodeProcess.touched}
                    validateStatus={form[i] && form[i].nodeProcess && form[i].nodeProcess.changed ? 'success' : ''}
                  >
                    <Input
                      placeholder="Node Process"
                      id="nodeProcess"
                      onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        displayValuesState[i].nodeProcess = value;
                        setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                      }}
                      defaultValue={displayValue.nodeProcess}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Data Key"
                    key="dataKey"
                    hasFeedback={form[i] && form[i].dataKey && form[i].dataKey.touched}
                    validateStatus={form[i] && form[i].dataKey && form[i].dataKey.changed ? 'success' : ''}
                  >
                    <Input
                      placeholder="Data Key"
                      id="dataKey"
                      onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        displayValuesState[i].dataKey = value;
                        setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                      }}
                      defaultValue={displayValue.dataKey}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Process Data Key"
                    key="processDataKey"
                    hasFeedback={form[i] && form[i].processDataKey && form[i].processDataKey.touched}
                    validateStatus={form[i] && form[i].processDataKey && form[i].processDataKey.changed ? 'success' : ''}
                    help={form[i] && form[i].processDataKey && form[i].processDataKey.help ? form[i].processDataKey.help : 'Define the function body (in JavaScript) here to process the variable "x".'}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Process Data Key"
                      id="processDataKey"
                      onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        if (value.includes('return')) {
                          displayValuesState[i].processDataKey = new Function('x', value);
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true, help: null } } });
                        } else {
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: false, help: 'You must return at least the variable "x".' } } });
                        }
                      }}
                      defaultValue={displayValue.processDataKey ? displayValue.processDataKey.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') : 'return x;'}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Unit"
                    key="unit"
                    hasFeedback={form[i] && form[i].unit && form[i].unit.touched}
                    validateStatus={form[i] && form[i].unit && form[i].unit.changed ? 'success' : ''}
                  >
                    <Input
                      placeholder="Unit"
                      id="unit"
                      onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        displayValuesState[i].unit = value;
                        setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                      }}

                      defaultValue={displayValue.unit}
                    />
                  </Form.Item>
                </Panel>
              ))
            }
            <Panel header="Add Value" key="3">
              <Form.Item
                label="Name"
                key="name"
                hasFeedback={form.newChart.name && form.newChart.name.touched}
                validateStatus={form.newChart.name && form.newChart.name.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Name"
                  id="name"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                  value={form.newChart.name ? form.newChart.name.value : ''}
                />
              </Form.Item>

              <Form.Item
                required
                label="Node Process"
                key="nodeProcess"
                hasFeedback={form.newChart.nodeProcess && form.newChart.nodeProcess.touched}
                validateStatus={form.newChart.nodeProcess && form.newChart.nodeProcess.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Node Process"
                  id="nodeProcess"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                  value={form.newChart.nodeProcess ? form.newChart.nodeProcess.value : ''}
                />
              </Form.Item>

              <Form.Item
                required
                label="Data Key"
                key="dataKey"
                hasFeedback={form.newChart.dataKey && form.newChart.dataKey.touched}
                validateStatus={form.newChart.dataKey && form.newChart.dataKey.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Data Key"
                  id="dataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                  value={form.newChart.dataKey ? form.newChart.dataKey.value : ''}
                />
              </Form.Item>

              <Form.Item
                label="Process Data Key"
                key="processDataKey"
                hasFeedback={form.newChart.processDataKey && form.newChart.processDataKey.touched}
                validateStatus={form.newChart.processDataKey && form.newChart.processDataKey.changed ? 'success' : ''}
                help={form.newChart.processDataKey && form.newChart.processDataKey.help ? form.newChart.processDataKey.help : 'Define the function body (in JavaScript) here to process the variable "x".'}
              >
                <TextArea
                  rows={4}
                  placeholder="Process Data Key"
                  id="processDataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    if (value.includes('return')) {
                      setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value: new Function('x', value), changed: true, help: null } } });
                    } else {
                      setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: false, help: 'You must return at least the variable "x".' } } });
                    }
                  }}
                  value={form.newChart.processDataKey && form.newChart.processDataKey.value ? form.newChart.processDataKey.value.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') : ''}
                />
              </Form.Item>

              <Form.Item
                label="Unit"
                key="unit"
                hasFeedback={form.newChart.unit && form.newChart.unit.touched}
                validateStatus={form.newChart.unit && form.newChart.unit.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Unit"
                  id="unit"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                  value={form.newChart.unit ? form.newChart.unit.value : ''}
                />
              </Form.Item>

              <Button
                type="dashed"
                block
                onClick={() => {
                  if (form.newChart.nodeProcess.value && form.newChart.dataKey.value) {
                    setForm({
                      ...form,
                      newChart: {},
                      [displayValuesState.length]: {}
                    });

                    displayValuesState.push({
                      name: form.newChart.name.value,
                      nodeProcess: form.newChart.nodeProcess.value,
                      dataKey: form.newChart.dataKey.value,
                      processDataKey: form.newChart.processDataKey.value,
                      unit: form.newChart.unit.value
                    });

                    form.newChart.name.value = '';
                    form.newChart.nodeProcess.value = '';
                    form.newChart.dataKey.value = '';
                    form.newChart.processDataKey.value = '';
                    form.newChart.unit.value = '';
                  }
                }}
              >
                Add Value
              </Button>
            </Panel>
          </Collapse>
        </Form>
      )}
    >
      <table style={{ tableLayout: 'fixed' }}>
        <tbody>
          {
            displayValuesState.length === 0 ? 'No values.' : null
          }
          {
            displayValuesState.map(({ name: label, unit: u }, i) => {
              return (
                <tr key={label}>
                  <td className="pr-2 text-gray-500">
                    {label}
                  </td>
                  <td className="pr-2">
                    {displayValuesState[i].value ? `${displayValuesState[i].processDataKey ? displayValuesState[i].processDataKey(displayValuesState[i].value) : displayValuesState[i].value}${u}` : '-'}
                  </td>
                  <td className="text-gray-500">
                    {displayValuesState[i].utc ? displayValuesState[i].utc : '-'}
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </BaseComponent>
  );
}

DisplayValue.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** */
  displayValues: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      nodeProcess: PropTypes.string,
      dataKey: PropTypes.string,
      processDataKey: PropTypes.func,
      unit: PropTypes.string,
    }),
  ),
  /** JSON object of data */
  nodeProc: PropTypes.string,
  /** Whether to show a circular indicator of the status of the component */
  showStatus: PropTypes.bool,
  /** The type of badge to show if showStatus is true (see the ant design badges component) */
  status: (props, propName, componentName) => {
    if (props.showStatus) {
      return new Error(
        `${propName} is required when showStatus is true in ${componentName}.`
      );
    }
  },
  /** Children node */
  children: PropTypes.node,
  /** Form node */
  formItems: PropTypes.node
};

DisplayValue.defaultProps = {
  name: '',
  displayValues: [],
  nodeProc: null,
  showStatus: false,
  status: 'error',
  children: null,
  formItems: null
};

export default DisplayValue;
