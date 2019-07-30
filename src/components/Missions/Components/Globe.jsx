import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import {
  Viewer, Entity, Model, Globe, Clock, CameraFlyTo, PathGraphics,
} from 'resium';
import Cesium from 'cesium';

import {
  Form, Input, Collapse, Button, Switch, DatePicker,
} from 'antd';

import BaseComponent from '../BaseComponent';
import { Context } from '../../../store/neutron1';
import model from '../../../public/cubesat.glb';
import socket from '../../../socket';

const { Panel } = Collapse;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

Cesium.Ion.defaultAccessToken = process.env.CESIUM_ION_TOKEN;

function getPos(lat, long, height) {
  const pos = Cesium.Cartesian3.fromArray([lat, long, height]);

  return Cesium.Transforms.eastNorthUpToFixedFrame(pos);
}

/**
 * Displays a specified value.
 */
function DisplayValue({
  name,
  orbits,
  showStatus,
  status,
}) {
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** Storage for form values */
  const [form, setForm] = useState({
    newOrbit: {
      live: true,
    },
  });

  const [formError, setFormError] = useState('');

  const { state } = useContext(Context);

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

  useEffect(() => {
    orbitsState.forEach((orbit, i) => {
      if (state[orbit.nodeProcess]
          && state[orbit.nodeProcess].node_loc_pos_eci
          && state[orbit.nodeProcess].node_loc_pos_eci.pos
          && orbit.live
      ) {
        const tempOrbit = [...orbitsState];

        if (!tempOrbit[i].path) {
          tempOrbit[i].path = new Cesium.SampledPositionProperty();
        }

        if (state[orbit.nodeProcess].utc && state[orbit.nodeProcess].node_loc_pos_eci) {
          const date = Cesium
            .JulianDate
            .fromDate(
              moment
                .unix((((state[orbit.nodeProcess].utc + 2400000.5) - 2440587.5) * 86400.0))
                .toDate(),
            );
          const pos = Cesium
            .Cartesian3
            .fromArray(
              [
                state[orbit.nodeProcess].node_loc_pos_eci.pos[0],
                state[orbit.nodeProcess].node_loc_pos_eci.pos[1],
                state[orbit.nodeProcess].node_loc_pos_eci.pos[2],
              ],
            );

          tempOrbit[i].path.addSample(date, pos);
        }

        tempOrbit[i].position = state[orbit.nodeProcess].node_loc_pos_eci.pos;
        tempOrbit[i].orientation = state[orbit.nodeProcess].node_loc_att_icrf.pos;

        setOrbitsState(tempOrbit);
      }
    });
  }, [state]);

  // useEffect(() => {
  //   const t = setTimeout(() => {
  //     const temp = [...orbitsState];

  //     temp[0].position = [
  //       temp[0].position[0] += 1,
  //       temp[0].position[1] += 1,
  //       temp[0].position[2] += 1,
  //     ];

  //     setOrbitsState(temp);
  //   }, 1000);

  //   console.log(orbitsState[0]);

  //   return () => {
  //     clearTimeout(t);
  //   };
  // }, [orbitsState]);

  const [start, setStart] = useState(Cesium.JulianDate.now);
  const [stop, setStop] = useState(null);
  const [cameraFlyTo, setCameraFlyTo] = useState(null);

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

  // ground track

  /** Handle the collection of historical data */
  useEffect(() => {
    if (retrieveOrbitHistory !== null) {
      const query = socket('query', '/query/');

      query.onopen = () => {
        // Check to see if user chose a range of dates
        if (form[retrieveOrbitHistory].dateRange.value.length === 2) {
          // Unix time to modified julian date
          const from = (form[retrieveOrbitHistory].dateRange.value[0].unix() / 86400.0)
            + 2440587.5 - 2400000.5;
          const to = (form[retrieveOrbitHistory].dateRange.value[1].unix() / 86400.0)
            + 2440587.5 - 2400000.5;

          query.send(
            `database=agent_dump?collection=${orbitsState[retrieveOrbitHistory].nodeProcess}?multiple=true?query={"utc": { "$gt": ${from}, "$lt": ${to} }}?options={"limit": 200}`,
          );
        }

        query.onmessage = ({ data }) => {
          try {
            const json = JSON.parse(data);

            const tempOrbit = [...orbitsState];

            let startOrbit;
            let stopOrbit;
            let startOrbitPosition;

            tempOrbit[retrieveOrbitHistory].live = false;

            if (json.length > 0) {
              startOrbit = Cesium
                .JulianDate
                .fromDate(
                  moment.unix((((json[0].utc + 2400000.5) - 2440587.5) * 86400.0)).toDate(),
                );
              stopOrbit = Cesium
                .JulianDate
                .fromDate(
                  moment.unix((((json[json.length - 1].utc + 2400000.5) - 2440587.5) * 86400.0)).toDate(),
                );
              startOrbitPosition = json[0].node_loc_pos_eci.pos;
            }

            const sampledPosition = new Cesium.SampledPositionProperty();

            json.forEach((orbit) => {
              const p = orbit.node_loc_pos_eci.pos;

              if (orbit.utc && orbit.node_loc_pos_eci) {
                const date = Cesium.JulianDate.fromDate(moment.unix((((orbit.utc + 2400000.5) - 2440587.5) * 86400.0)).toDate());
                const pos = Cesium.Cartesian3.fromArray(p);

                sampledPosition.addSample(date, pos);
              }
            });

            tempOrbit[retrieveOrbitHistory].position = sampledPosition;

            setStart(startOrbit);
            setStop(stopOrbit);
            setOrbitsState(tempOrbit);

            setCameraFlyTo(Cesium.Cartesian3.fromArray([
              startOrbitPosition[0] * 3,
              startOrbitPosition[1] * 3,
              startOrbitPosition[2] * 3,
            ]));

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
      subheader={orbitsState.length === 0 ? 'No orbits to display.' : null}
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
                        <span
                          onClick={(event) => {
                            event.stopPropagation();

                            setOrbitsState(orbitsState.filter((orbits, j) => j !== i));
                          }}
                        >
                          X
                        </span>
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
                        onChange={m => setForm({ ...form, [i]: { ...form[i], dateRange: { ...form[i].dateRange, value: m } } })}
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
                  </Panel>
                );
              })
            }
            <Panel header="Add Orbit" key="3">
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
                  onChange={m => setForm({ ...form, newOrbit: { ...form.newOrbit, dateRange: { ...form.newOrbit.dateRange, value: m } } })}
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
                  onBlur={({ target: { id: item } }) => {
                    setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], changed: true } } });
                  }}
                  value={form.newOrbit.name ? form.newOrbit.name.value : ''}
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
                  onBlur={({ target: { id: item } }) => {
                    setForm({ ...form, newOrbit: { ...form.newOrbit, [item]: { ...form.newOrbit[item], changed: true } } });
                  }}
                  value={form.newOrbit.nodeProcess ? form.newOrbit.nodeProcess.value : ''}
                />
              </Form.Item>

              <div className="text-red-500 mb-3">
                {formError}
              </div>

              <Button
                type="dashed"
                block
                onClick={() => {
                  // Check if required values are here
                  if (form.newOrbit.nodeProcess.value) {
                    setFormError('Check the "Node Process field. It is required.');
                    return;
                  }

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
                    modelFileName: form.newOrbit.modelFileName.value === '' ? form.newOrbit.modelFileName.value : 'cubesat1.glb',
                    processDataKey: form.newOrbit.processDataKey && form.newOrbit.processDataKey.value && (form.newOrbit.processDataKey.value.includes('return') || form.newOrbit.processDataKey.value.includes('=>')) ? form.newOrbit.processDataKey.value : x => x,
                    live: form.newOrbit.live,
                    position: [21.289373, 157.917480, 350000.0],
                    orientation: {
                      d: {
                        x: 0,
                        y: 0,
                        z: 0,
                      },
                      w: 0,
                    },
                  });

                  // Clear form values
                  form.newOrbit.name.value = '';
                  form.newOrbit.nodeProcess.value = '';

                  // If not live, retrieve the data from database
                  if (!form.newOrbit.live) {
                    setRetrieveOrbitHistory(orbitsState.length);
                  }
                }}
              >
                Add Orbit
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
        <Clock
          startTime={start}
          stopTime={stop}
          currentTime={start}
        />
        {/* <CzmlDataSource data={Attitude} /> */}
        {
          orbitsState.map((orbit) => {
            if (orbit.live) {
              return (
                <Entity
                  key={orbit.name}
                  position={orbit.path}
                >
                  <Model
                    modelMatrix={getPos(orbit.position[0], orbit.position[1], orbit.position[2])}
                    url={model}
                    minimumPixelSize={35}
                  />
                  <PathGraphics
                    width={3}
                    leadTime={86400}
                    trailTime={86400}
                    material={Cesium.Color.CHARTREUSE}
                  />
                </Entity>
              );
            }

            return (
              <span
                key={orbit.name}
              >
                {
                  cameraFlyTo ? <CameraFlyTo destination={cameraFlyTo} /> : null
                }
                <Entity
                  name={orbit.name}
                  position={orbit.position}
                  point={{ pixelSize: 10 }}
                >
                  <PathGraphics
                    width={3}
                    leadTime={600}
                    trailTime={600}
                    material={Cesium.Color.CRIMSON}
                  />
                </Entity>
              </span>
            );
          })
        }
      </Viewer>
      <table className="mt-4 w-full">
        <tbody>
          <tr className="bg-gray-200 border-b border-gray-400">
            <td className="p-2 pr-8">Name</td>
            <td className="p-2 pr-8">Latitude</td>
            <td className="p-2 pr-8">Longitude</td>
            <td className="p-2 pr-8">Altitude</td>
            <td className="p-2 pr-8">x</td>
            <td className="p-2 pr-8">y</td>
            <td className="p-2 pr-8">z</td>
            <td className="p-2 pr-8">w</td>
          </tr>
          {
          orbitsState.map(orbit => (
            <tr className="text-gray-700 border-b border-gray-400" key={orbit.name}>
              <td className="p-2 pr-8">{orbit.name}</td>
              <td className="p-2 pr-8">{orbit.position[0]}</td>
              <td className="p-2 pr-8">{orbit.position[1]}</td>
              <td className="p-2 pr-8">{orbit.position[2]}</td>
              <td className="p-2 pr-8">{orbit.orientation.d.x}</td>
              <td className="p-2 pr-8">{orbit.orientation.d.y}</td>
              <td className="p-2 pr-8">{orbit.orientation.d.z}</td>
              <td className="p-2 pr-8">{orbit.orientation.w}</td>
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
  /** Whether to show a circular indicator of the status of the component */
  showStatus: PropTypes.bool,
  /** The type of badge to show if showStatus is true (see the ant design badges component) */
  status: (props, propName, componentName) => {
    if (props.showStatus) {
      return new Error(
        `${propName} is required when showStatus is true in ${componentName}.`,
      );
    }
  },
};

DisplayValue.defaultProps = {
  name: '',
  orbits: [],
  showStatus: false,
  status: 'error',
};

export default DisplayValue;
