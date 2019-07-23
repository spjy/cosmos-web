import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Viewer, Entity, Model, Globe,
} from 'resium';
import Cesium from 'cesium';

import {
  Form, Input, Collapse, Button, Switch, DatePicker, Icon,
} from 'antd';

import BaseComponent from '../BaseComponent';
import { Context } from '../../../store/neutron1';
import model from '../../../public/cubesat.glb';
import socket from '../../../socket';

const { Panel } = Collapse;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const origin = Cesium.Cartesian3.fromDegrees(-90.0, 40.0, 200000.0);
const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);

function getPos(lat, long, height) {
  const pos = Cesium.Cartesian3.fromDegrees(lat, long, height);

  return Cesium.Transforms.eastNorthUpToFixedFrame(pos);
}

/**
 * Displays a specified value.
 */
function DisplayValue({
  name,
  orbits,
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
    newOrbit: {
      live: true,
    },
  });

  const { state } = useContext(Context);

  const [latitude, setLatitude] = useState(21.289373);
  const [longitude, setLongitude] = useState(157.917480);
  const [altitude, setAltitude] = useState(350000.0);

  const [orbitsState, setOrbitsState] = useState(orbits);

  const [retrieveOrbitHistory, setRetrieveOrbitHistory] = useState(null);

  /** Initialize form slots for each orbit */
  useEffect(() => {
    // Make an object for each plot's form
    for (let i = 0; i < orbitsState.length; i += 1) {
      form[i] = {
        live: orbitsState[i].live,
      };
    }
  }, []);

  useState(() => {
    orbitsState.forEach((orbit, i) => {
      if (state[orbit.nodeProcess] && state[orbit.nodeProcess].node_loc_pos_eci && state[orbit.nodeProcess].node_loc_pos_eci.pos) {
        orbitsState[i].position = state[orbit.nodeProcess].node_loc_pos_eci.pos;
      }
    });
  }, [state]);

  const [availability, setAvailability] = useState(null);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setX(x + 0.5);
  //     setY(y + 0.5);

  //     console.log(x, y);
  //   }, 100);

  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, [x]);

  /** Handle the collection of historical data */
  useEffect(() => {
    if (retrieveOrbitHistory !== null) {
      const query = socket('query', '/query/');

      query.onopen = () => {
        // Check to see if user chose a range of dates
        if (form[retrieveOrbitHistory].dateRange.value.length === 2) {
          // Unix time to modified julian date
          const from = ((form[retrieveOrbitHistory].dateRange.value[0].unix() / 86400.0) + 2440587.5 - 2400000.5);
          const to = ((form[retrieveOrbitHistory].dateRange.value[1].unix() / 86400.0) + 2440587.5 - 2400000.5);

          query.send(
            `database=agent_dump?collection=${orbitsState[retrieveOrbitHistory].nodeProcess}?multiple=true?query={"utc": { "$gt": ${from}, "$lt": ${to} }}?options={"limit": 20}`,
          );
        }

        query.onmessage = ({ data }) => {
          try {
            const json = JSON.parse(data);


            let start;
            let stop;

            orbitsState[retrieveOrbitHistory].live = false;

            if (json.length > 0) {
              start = new Cesium.JulianDate(json[0].utc + 2400000.5);
              stop = new Cesium.JulianDate(json[json.length - 1].utc + 2400000.5);
            }

            const sampledPosition = new Cesium.SampledPositionProperty();

            json.forEach((orbit) => {
              const [x, y, z] = orbit.node_loc_pos_eci.pos;

              if (orbit.utc && orbit.node_loc_pos_eci) {
                const date = new Cesium.JulianDate(orbit.utc + 2400000.5);
                const position = new Cesium.Cartesian3(x, y, z);

                sampledPosition.addSample(date, position);
              }
            });

            orbitsState[retrieveOrbitHistory].history = {
              availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                start, stop,
              })]),
              position: sampledPosition,
            };

            setAvailability(new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
              start, stop,
            })]));

            query.close();

            // Reset state to null to allow for detection of future plot history requests
            setRetrieveOrbitHistory(null);
          } catch (err) {
            // console.log(err);
          }
        };
      };
    }
  }, [retrieveOrbitHistory]);

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
              orbitsState.map((orbit, i) => {
                return (
                  <Panel
                    header={(
                      <span className="text-gray-600">
                        <strong>
                          {orbit.nodeProcess}
                        </strong>
                        &nbsp;
                        <span>
                          {orbit.dataKey}
                        </span>
                      </span>
                    )}
                    key={i}
                    extra={(
                      <div
                        onClick={event => event.stopPropagation()}
                      >
                        <Switch
                          checkedChildren="Live"
                          unCheckedChildren="Past"
                          defaultChecked={orbit.live}
                          onChange={(checked) => {
                            orbitsState[i].live = checked;

                            setForm({
                              ...form,
                              [i]: {
                                ...form[i], live: checked,
                              },
                            });
                          }}
                        />
                        &nbsp;
                        <Icon className="text-lg" type="close" />
                      </div>
                    )}
                  >
                    <Form.Item
                      className="w-auto"
                      label="Historical Date Range"
                      key="dateRange"
                      hasFeedback={form[i] && form[i].dateRange && form[i].dateRange.touched}
                      validateStatus={form[i] && form[i].dateRange && form[i].dateRange.changed ? 'success' : ''}
                    >
                      <RangePicker
                        className="mr-1"
                        id="dateRange"
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        disabled={form[i] && form[i].live}
                        onChange={moment => setForm({ ...form, [i]: { ...form[i], dateRange: { ...form[i].dateRange, value: moment } } })}
                      />
                      <Button
                        type="primary"
                        onClick={() => setRetrieveOrbitHistory(i)}
                        disabled={form[i] && form[i].live}
                      >
                        Show
                      </Button>
                    </Form.Item>

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
                          orbitsState[i].name = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={orbit.name}
                      />
                    </Form.Item>


                    <Form.Item
                      label="Model File Name"
                      key="modelFilename"
                      hasFeedback={form[i] && form[i].modelFilename && form[i].modelFilename.touched}
                      validateStatus={form[i] && form[i].modelFilename && form[i].modelFilename.changed ? 'success' : ''}
                    >
                      <Input
                        placeholder="Model File Name"
                        id="modelFilename"
                        onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                        onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                        onBlur={({ target: { id: item, value } }) => {
                          orbitsState[i].type = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={orbit.modelFileName}
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
                          orbitsState[i].nodeProcess = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={orbit.nodeProcess}
                      />
                    </Form.Item>
{/* 
                    <Form.Item
                      label="Y Data Key"
                      key="YDataKey"
                      hasFeedback={form[i] && form[i].YDataKey && form[i].YDataKey.touched}
                      validateStatus={form[i] && form[i].YDataKey && form[i].YDataKey.changed ? 'success' : ''}
                    >
                      <Input
                        placeholder="Y Data Key"
                        id="YDataKey"
                        onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                        onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                        onBlur={({ target: { id: item, value } }) => {
                          orbitsState[i].YDataKey = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={plot.YDataKey}
                      />
                    </Form.Item> */}

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
                            orbitsState[i].processDataKey = new Function('x', value);

                            setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true, help: null } } });
                          } else {
                            setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: false, help: 'You must return at least the variable "x".' } } });
                          }
                        }}
                        defaultValue={orbit.processDataKey ? orbit.processDataKey.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') : 'return x;'}
                      />
                    </Form.Item>
                  </Panel>
                );
              })
            }
            <Panel header="Add Chart" key="3">
              <Switch
                checkedChildren="Live"
                unCheckedChildren="Past"
                defaultChecked
                onChange={checked => setForm({
                  ...form,
                  newOrbit: {
                    ...form.newOrbit,
                    live: checked,
                  },
                })}
              />
              <br />
              <br />
              <Form.Item
                className="w-auto"
                label="Historical Date Range"
                key="dateRange"
                hasFeedback={form.newOrbit.dateRange && form.newOrbit.dateRange.touched}
                validateStatus={form.newOrbit.dateRange && form.newOrbit.dateRange.changed ? 'success' : ''}
              >
                <RangePicker
                  className="mr-1"
                  id="dateRange"
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  disabled={form.newOrbit.live}
                  onChange={moment => setForm({ ...form, newOrbit: { ...form.newOrbit, dateRange: { ...form.newOrbit.dateRange, value: moment } } })}
                />
              </Form.Item>

              <Form.Item
                label="Name"
                key="name"
                hasFeedback={form.newOrbit.name && form.newOrbit.name.touched}
                validateStatus={form.newOrbit.name && form.newOrbit.name.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Name"
                  id="name"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], changed: true } } });
                  }}
                  value={form.newOrbit.name ? form.newOrbit.name.value : ''}
                />
              </Form.Item>

              <Form.Item
                required
                label="Model File Name"
                key="modelFileName"
                hasFeedback={form.newOrbit.modelFileName && form.newOrbit.modelFileName.touched}
                validateStatus={form.newOrbit.modelFileName && form.newOrbit.modelFileName.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Model File Name"
                  id="modelFileName"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], changed: true } } });
                  }}
                  value={form.newOrbit.modelFileName ? form.newOrbit.modelFileName.value : ''}
                />
              </Form.Item>

              <Form.Item
                required
                label="Node Process"
                key="nodeProcess"
                hasFeedback={form.newOrbit.nodeProcess && form.newOrbit.nodeProcess.touched}
                validateStatus={form.newOrbit.nodeProcess && form.newOrbit.nodeProcess.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Node Process"
                  id="nodeProcess"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], changed: true } } });
                  }}
                  value={form.newOrbit.nodeProcess ? form.newOrbit.nodeProcess.value : ''}
                />
              </Form.Item>

              {/* <Form.Item
                required
                label="Data Keys"
                key="dataKey"
                hasFeedback={form.newOrbit.dataKey && form.newOrbit.dataKey.touched}
                validateStatus={form.newOrbit.dataKey && form.newOrbit.dataKey.changed ? 'success' : ''}
              >
                <Collapse bordered={false} defaultActiveKey={['1']}>
                  <Panel header="This is panel header 1" key="1">
                    ok
                  </Panel>
                  <Panel header="This is panel header 2" key="2">
                    ok
                  </Panel>
                  <Panel header="This is panel header 3" key="3">
                    ok
                  </Panel>
                </Collapse>
              </Form.Item>

              <Form.Item
                required
                label="Data Key"
                key="dataKey"
                hasFeedback={form.newOrbit.dataKey && form.newOrbit.dataKey.touched}
                validateStatus={form.newOrbit.dataKey && form.newOrbit.dataKey.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Data Key"
                  id="dataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], changed: true } } });
                  }}
                  value={form.newOrbit.dataKey ? form.newOrbit.dataKey.value : ''}
                />
              </Form.Item> */}

              <Form.Item
                label="Process Data Key"
                key="processDataKey"
                hasFeedback={form.newOrbit.processDataKey && form.newOrbit.processDataKey.touched}
                validateStatus={form.newOrbit.processDataKey && form.newOrbit.processDataKey.changed ? 'success' : ''}
                help={form.newOrbit.processDataKey && form.newOrbit.processDataKey.help ? form.newOrbit.processDataKey.help : 'Define the function body (in JavaScript) here to process the variable "x".'}
              >
                <TextArea
                  rows={4}
                  placeholder="Process Data Key"
                  id="processDataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    if (value.includes('return')) {
                      setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], value: new Function('x', value), changed: true, help: null } } });
                    } else {
                      setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], changed: false, help: 'You must return at least the variable "x".' } } });
                    }
                  }}
                  value={form.newOrbit.processDataKey && form.newOrbit.processDataKey.value ? form.newOrbit.processDataKey.value.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') : ''}
                />
              </Form.Item>

              <Button
                type="dashed"
                block
                onClick={() => {
                  // Check if required values are here
                  if (form.newOrbit.modelFileName.value && form.newOrbit.nodeProcess.value && form.newOrbit.DataKey.value) {
                    // Make form slots for new plot
                    setForm({
                      ...form,
                      newOrbit: {
                        live: form.newOrbit.live,
                      },
                      [orbitsState.length]: {},
                    });

                    // Create chart
                    orbitsState.push({
                      name: form.newOrbit.name.value,
                      nodeProcess: form.newOrbit.nodeProcess.value,
                      modelFileName: form.newOrbit.modelFileName.value,
                      dataKey: form.newOrbit.dataKey.value,
                      processDataKey: form.newValue.processDataKey.value.includes('return') || form.newValue.processDataKey.value.includes('=>') ? form.newOrbit.processDataKey.value : x => x,
                      live: form.newOrbit.live,
                    });

                    // Clear form values
                    form.newOrbit.name.value = '';
                    form.newOrbit.nodeProcess.value = '';
                    form.newOrbit.modelFileName.value = '';
                    form.newOrbit.dataKey.value = '';
                    form.newOrbit.processDataKey.value = '';

                    // If not live, retrieve the data from database
                    if (!form.newOrbit.live) {
                      setRetrieveOrbitHistory(orbitsState.length);
                    }
                  }
                }}
              >
                Add Chart
              </Button>
            </Panel>
          </Collapse>
        </Form>
      )}
    >
      <Viewer
        fullscreenButton={false}
      >
        <Globe enableLighting />
        {
          orbitsState.map(orbit => (
            <Entity
              name={orbit.name}
              availability={availability}
              position={orbit.history ? orbit.history.position : null}
            >
              <Model
                modelMatrix={getPos(orbit.position[0], orbit.position[1], orbit.position[2])}
                url={model}
                minimumPixelSize={15}
              />
            </Entity>
          ))
        }

      </Viewer>
      <table className="mt-4 w-full">
        <tbody>
          <tr className="bg-gray-200 border-b border-gray-400">
            <td className="p-2 pr-8">Name</td>
            <td className="p-2 pr-8">Latitude</td>
            <td className="p-2 pr-8">Longitude</td>
            <td className="p-2 pr-8">Altitude</td>
          </tr>
          {
          orbitsState.map(orbit => (
            <tr className="text-gray-700 border-b border-gray-400">
              <td className="p-2 pr-8">{orbit.name}</td>
              <td className="p-2 pr-8">{orbit.position[0]}</td>
              <td className="p-2 pr-8">{orbit.position[1]}</td>
              <td className="p-2 pr-8">{orbit.position[2]}</td>
            </tr>
          ))
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
  orbits: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      dataKeys: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          modelFileName: PropTypes.string,
          nodeProcess: PropTypes.string,
          dataKey: PropTypes.string,
          processDataKey: PropTypes.func,
          live: PropTypes.bool,
        }),
      ),
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
  formItems: PropTypes.node,
};

DisplayValue.defaultProps = {
  name: '',
  orbits: [],
  nodeProc: null,
  showStatus: false,
  status: 'error',
  children: null,
  formItems: null,
};

export default DisplayValue;
