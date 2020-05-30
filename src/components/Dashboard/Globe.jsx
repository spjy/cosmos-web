import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment-timezone';
import {
  Viewer, Entity, Model, Globe, Clock, CameraFlyTo, PathGraphics, GeoJsonDataSource,
} from 'resium';
import Cesium from 'cesium';

import {
  Form, Input, Collapse, Button, Switch, DatePicker, message,
} from 'antd';

import BaseComponent from '../BaseComponent';
import { Context } from '../../store/neutron1';
import model from '../../public/cubesat.glb';
import { query } from '../../socket';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// Set Cesium Ion token only if it is defined in the .env file
if (process.env.CESIUM_ION_TOKEN) {
  Cesium.Ion.defaultAccessToken = process.env.CESIUM_ION_TOKEN;
}

/**
 * Convert from x, y, z to Matrix 4x4
 * @param {*} x meters
 * @param {*} y meters
 * @param {*} z meters
 */
function getPos(x, y, z) {
  const pos = Cesium.Cartesian3.fromArray([x, y, z]);

  return Cesium.Transforms.northUpEastToFixedFrame(pos);
}

/**
 * Parse latitude, longtiude, altitude to map Matrix 4x4
 * @param {Number} longitude degrees
 * @param {Number} latitude degrees
 * @param {Number} altitude meters
 */
function getPosFromSpherical(longitude, latitude, altitude) {
  const pos = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

  return Cesium.Transforms.northUpEastToFixedFrame(pos);
}

/**
 * Displays a globe with the orbit and orbit history using Resium (Cesium).
 * Retrieves location data and displays a model in the location.
 * Stores the location data and displays the path taken by the model.
 * Can overlay shapes over an area of the globe.
 * At the bottom, displays the current location.
 */
function CesiumGlobe({
  name,
  orbits,
  overlays,
  showStatus,
  status,
  coordinateSystem,
  height,
}) {
  /** Accessing the neutron1 messages from the socket */
  const { state } = useContext(Context);

  /** Storage for global; form values */
  const [orbitsForm] = Form.useForm();
  /** Form for adding new values */
  const [newForm] = Form.useForm();
  /** Form for editing values */
  const [editForm] = Form.useForm();

  /** Initial form values for editForm */
  const [initialValues, setInitialValues] = useState({});
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** Storage for the current orbits being displayed */
  const [orbitsState, setOrbitsState] = useState(orbits);
  /** GeoJson objects */
  const [overlaysState] = useState(overlays);
  /** Store to retrieve orbit history by request from Mongo */
  const [retrieveOrbitHistory, setRetrieveOrbitHistory] = useState(null);
  /** Clock start time */
  const [start, setStart] = useState(Cesium.JulianDate.now);
  /** Clock end time */
  const [stop, setStop] = useState(null);
  /** Location for camera to fly to */
  const [cameraFlyTo, setCameraFlyTo] = useState(null);
  /** Variable to update to force component update */
  const [updateComponent, setUpdateComponent] = useState(false);
  /** State to store switch denoting whether added value is live or not */
  const [addOrbitLive, setAddOrbitLive] = useState(true);

  /** Initialize form slots for each orbit */
  useEffect(() => {
    // Make an object for each plot's form
    let accumulate = {};

    // Initialize form values for each value
    orbits.forEach(({
      name: nameVal, nodeProcess, dataKey: dataKeyVal, live,
    }, i) => {
      accumulate = {
        ...accumulate,
        [`name_${i}`]: nameVal,
        [`nodeProcess_${i}`]: nodeProcess,
        [`dataKey_${i}`]: dataKeyVal,
        [`live_${i}`]: live,
      };
    });

    setInitialValues(accumulate);
  }, []);

  /** Retrieve live orbit data */
  useEffect(() => {
    orbitsState.forEach(({
      nodeProcess, dataKey, live,
    }, i) => {
      if (state[nodeProcess]
        && state[nodeProcess][dataKey]
        && state[nodeProcess][dataKey].pos
        && live
      ) {
        const tempOrbit = [...orbitsState];

        if (!tempOrbit[i].path) {
          tempOrbit[i].path = new Cesium.SampledPositionProperty();
        }

        if (state[nodeProcess].utc
          && (state[nodeProcess][dataKey]
          || state[nodeProcess].target_loc_pos_geod_s_lat)
        ) {
          const date = Cesium
            .JulianDate
            .fromDate(
              moment
                .unix((((state[nodeProcess].utc + 2400000.5) - 2440587.5) * 86400.0))
                .toDate(),
            );

          let pos;

          if (coordinateSystem === 'cartesian') {
            pos = Cesium
              .Cartesian3
              .fromArray(
                [
                  state[nodeProcess][dataKey].pos[0],
                  state[nodeProcess][dataKey].pos[1],
                  state[nodeProcess][dataKey].pos[2],
                ],
              );
            tempOrbit[i].path.addSample(date, pos);
          }
          // else if (coordinateSystem === 'geodetic') {
          //   pos = Cesium.Cartesian3.fromDegrees(
          //     state[nodeProcess].target_loc_pos_geod_s_lat * (180 / Math.PI),
          //     state[nodeProcess].target_loc_pos_geod_s_lon * (180 / Math.PI),
          //     state[nodeProcess].target_loc_pos_geod_s_h,
          //   );
          // }
        }

        tempOrbit[i].position = state[nodeProcess][dataKey].pos;

        if (coordinateSystem === 'geodetic'
          && state[nodeProcess].target_loc_pos_geod_s_lat
          && state[nodeProcess].target_loc_pos_geod_s_lon
          && state[nodeProcess].target_loc_pos_geod_s_h
        ) {
          tempOrbit[i].geodetic = {
            latitude: state[nodeProcess].target_loc_pos_geod_s_lat,
            longitude: state[nodeProcess].target_loc_pos_geod_s_lon,
            altitude: state[nodeProcess].target_loc_pos_geod_s_h,
          };
        }

        setOrbitsState(tempOrbit);
      }
    });
  }, [state]);

  /** Handle the collection of historical data */
  /** TODO: UPDATE RETRIEVAL FOR GEODETIC COORDINATES */
  useEffect(() => {
    if (retrieveOrbitHistory !== null) {
      if (query.OPEN) {
        const fields = editForm.getFieldsValue();

        const dates = fields[`dateRange_${retrieveOrbitHistory}`];
        const dataKey = fields[`dataKey_${retrieveOrbitHistory}`];

        // Check to see if user chose a range of dates
        if (dates && dates.length === 2) {
          // Unix time to modified julian date
          const from = (dates[0].unix() / 86400.0) + 2440587.5 - 2400000.5;
          const to = (dates[1].unix() / 86400.0) + 2440587.5 - 2400000.5;

          query.send(
            `database=${process.env.MONGODB_COLLECTION}?collection=${orbitsState[retrieveOrbitHistory].nodeProcess}?multiple=true?query={"utc": { "$gt": ${from}, "$lt": ${to} }}?options={"projection": { "${dataKey}": 1, "utc": 1 }}`,
          );

          message.loading('Querying data...', 0);
        }

        query.onmessage = ({ data }) => {
          try {
            const json = JSON.parse(data);

            message.destroy();

            if (json.length === 0) {
              message.warning('No data for specified date range.');
            } else {
              message.success(`Retrieved ${json.length} records.`);
            }

            const tempOrbit = [...orbitsState];

            let startOrbit;
            let stopOrbit;
            let startOrbitPosition;

            tempOrbit[retrieveOrbitHistory].live = false;

            if (json.length > 0) {
              startOrbit = Cesium
                .JulianDate
                .fromDate(
                  moment
                    .unix((((json[0].utc + 2400000.5) - 2440587.5) * 86400.0))
                    .toDate(),
                );
              stopOrbit = Cesium
                .JulianDate
                .fromDate(
                  moment
                    .unix((((json[json.length - 1].utc + 2400000.5) - 2440587.5) * 86400.0))
                    .toDate(),
                );
              startOrbitPosition = json[0][dataKey].pos;
            }

            const sampledPosition = new Cesium.SampledPositionProperty();

            json.forEach((orbit) => {
              const p = orbit[dataKey].pos;

              if (orbit.utc && orbit[dataKey]) {
                const date = Cesium
                  .JulianDate
                  .fromDate(
                    moment
                      .unix((((orbit.utc + 2400000.5) - 2440587.5) * 86400.0))
                      .toDate(),
                  );
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
          } catch (err) {
            // console.log(err);
          }
        };

        query.onerror = () => {
          message.destroy();
          message.error('Error has occurred.');
        };

        // Reset state to null to allow for detection of future orbit history requests
        setRetrieveOrbitHistory(null);
      }
    }
  }, [retrieveOrbitHistory]);

  /** Process edit value form */
  const processForm = (id) => {
    // Destructure form, field, index to retrieve changed field
    const [form, field, index] = id.split('_');

    // Check type of form
    if (form === 'orbitsForm') {
      // Update name state
      setNameState(orbitsForm.getFieldsValue()[field]);
    } else if (form === 'editForm') {
      // Create function for processDataKey, O.W. for inputs just set value
      orbitsState[index][field] = editForm.getFieldsValue()[`${field}_${index}`];

      // Update state
      setUpdateComponent(!updateComponent);
    }
  };

  /** Process new value form */
  const onFinish = ({
    dateRange,
    name: nameVal,
    nodeProcess,
    dataKey,
    live,
  }) => {
    // Append new value to array
    orbitsState.push({
      name: nameVal || '',
      nodeProcess,
      dataKey,
      position: [0, 0, 0],
    });

    setUpdateComponent(!updateComponent);

    // Set edit value default form values
    const newIndex = orbitsState.length - 1;

    editForm.setFieldsValue({
      [`name_${newIndex}`]: nameVal,
      [`nodeProcess_${newIndex}`]: nodeProcess,
      [`dataKey_${newIndex}`]: dataKey,
      [`live_${newIndex}`]: live,
      [`dateRange_${newIndex}`]: dateRange,
    });

    // Clear form
    newForm.resetFields();

    message.success('Created new orbit path.');

    if (!addOrbitLive) {
      setRetrieveOrbitHistory(newIndex);
    }
  };

  return (
    <BaseComponent
      name={nameState}
      subheader={orbitsState.length === 0 ? 'No orbits to display.' : null}
      liveOnly
      height={height}
      showStatus={showStatus}
      status={status}
      formItems={(
        <>
          <Form
            form={orbitsForm}
            layout="vertical"
            name="orbitsForm"
            initialValues={{
              name,
            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>
          </Form>

          {/* Modify values forms */}
          <Form
            layout="vertical"
            initialValues={initialValues}
            name="editForm"
            form={editForm}
          >
            <Collapse
              bordered
            >
              {
                orbitsState.map((orbit, i) => (
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
                    key={`${orbit.name}${orbit.nodeProcess}${orbit.dataKey}`}
                    extra={(
                      <div
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={-1}
                      >
                        <Form.Item name={`live_${i}`} noStyle>
                          <Switch
                            checkedChildren="Live"
                            unCheckedChildren="Past"
                            checked={orbit.live}
                            onChange={(checked) => {
                              orbitsState[i].live = checked;

                              setUpdateComponent(!updateComponent);
                            }}
                          />
                        </Form.Item>
                        &nbsp;
                        <span
                          onClick={(event) => {
                            event.stopPropagation();

                            setOrbitsState(orbitsState.filter((o, j) => j !== i));
                          }}
                          onKeyPress={() => {}}
                          role="button"
                          tabIndex={-2}
                        >
                          X
                        </span>
                      </div>
                    )}
                  >
                    <Form.Item label="Historical Date Range" name={`dateRange_${i}`} hasFeedback noStyle>
                      <RangePicker
                        className="mr-1"
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        disabled={editForm && editForm.getFieldsValue()[`live_${i}`]}
                        onBlur={({ target: { id } }) => processForm(id)}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      onClick={() => setRetrieveOrbitHistory(i)}
                      disabled={editForm && editForm.getFieldsValue()[`live_${i}`]}
                    >
                      Show
                    </Button>

                    <br />
                    <br />

                    <Form.Item label="Name" name={`name_${i}`} hasFeedback>
                      <Input placeholder="Name" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Node Process" name={`nodeProcess_${i}`} hasFeedback>
                      <Input placeholder="Node Process" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Data Key" name={`dataKey_${i}`} hasFeedback>
                      <Input placeholder="Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>
                  </Panel>
                ))
              }
            </Collapse>
          </Form>

          <br />

          {/* Add forms */}
          <Form
            form={newForm}
            layout="vertical"
            name="newForm"
            onFinish={onFinish}
            initialValues={{
              live: true,
            }}
          >
            <Collapse>
              <Panel header="Add Value" key="add">
                <Switch
                  checkedChildren="Live"
                  unCheckedChildren="Past"
                  checked={addOrbitLive}
                  onChange={() => setAddOrbitLive(!addOrbitLive)}
                />

                <br />
                <br />

                <Form.Item label="Historical Date Range" name="dateRange" hasFeedback>
                  <RangePicker
                    className="mr-1"
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    disabled={addOrbitLive}
                  />
                </Form.Item>

                <Form.Item label="Name" name="name" hasFeedback>
                  <Input placeholder="Name" />
                </Form.Item>

                <Form.Item label="Node Process" name="nodeProcess" hasFeedback>
                  <Input placeholder="Node Process" />
                </Form.Item>

                <Form.Item label="Data Key" name="dataKey" hasFeedback>
                  <Input placeholder="Data Key" />
                </Form.Item>

                <Button
                  type="dashed"
                  block
                  htmlType="submit"
                >
                  Add Value
                </Button>
              </Panel>
            </Collapse>
          </Form>
        </>
      )}
    >
      <Viewer
        fullscreenButton={false}
      >
        {overlaysState.map((overlay, i) => (
          <GeoJsonDataSource
            data={overlay.geoJson}
            fill={Cesium.Color.fromAlpha(Cesium.Color[overlay.color ? overlay.color.toUpperCase() : 'BLACK'], 0.2)}
            stroke={Cesium.Color[overlay.color ? overlay.color.toUpperCase() : 'BLACK']}
            // eslint-disable-next-line
            key={i}
          />
        ))}
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
                    modelMatrix={
                      coordinateSystem === 'cartesian'
                        ? getPos(orbit.position[0], orbit.position[1], orbit.position[2])
                        : getPosFromSpherical(
                          orbit.geodetic.longitude * (180 / Math.PI),
                          orbit.geodetic.latitude * (180 / Math.PI),
                          1000,
                        )
                    }
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
      <div className="overflow-x-auto">
        <table className="mt-4 w-full">
          <tbody className="w-10">
            <tr className="bg-gray-200 border-b border-gray-400">
              <td className="p-2 pr-8">Name</td>
              <td className="p-2 pr-8">x (m)</td>
              <td className="p-2 pr-8">y (m)</td>
              <td className="p-2 pr-8">z (m)</td>
              <td className="p-2 pr-8">Latitude (rad)</td>
              <td className="p-2 pr-8">Longitude (rad)</td>
              <td className="p-2 pr-8">Altitude (m)</td>
            </tr>
            {
            orbitsState.map((orbit) => (
              <tr className="text-gray-700 border-b border-gray-400" key={orbit.name}>
                <td className="p-2 pr-8">{orbit.name}</td>
                <td className="p-2 pr-8">{orbit.position[0]}</td>
                <td className="p-2 pr-8">{orbit.position[1]}</td>
                <td className="p-2 pr-8">{orbit.position[2]}</td>
                <td className="p-2 pr-8">{orbit.geodetic ? orbit.geodetic.latitude : 0}</td>
                <td className="p-2 pr-8">{orbit.geodetic ? orbit.geodetic.longitude : 0}</td>
                <td className="p-2 pr-8">{orbit.geodetic ? orbit.geodetic.altitude : 0}</td>
              </tr>
            ))
          }
          </tbody>
        </table>
      </div>
    </BaseComponent>
  );
}

CesiumGlobe.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Default orbits to display */
  orbits: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      modelFileName: PropTypes.string,
      nodeProcess: PropTypes.string,
      dataKey: PropTypes.string,
      processDataKey: PropTypes.func,
      live: PropTypes.bool,
    }),
  ),
  /** Store overlays on map (geocoloring) */
  overlays: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string,
      geoJson: PropTypes.shape({}),
    }),
  ),
  /** Whether to show a circular indicator of the status of the component */
  showStatus: PropTypes.bool,
  /** The type of badge to show if showStatus is true (see the ant design badges component) */
  status: ({ showStatus }, propName, componentName) => {
    if (showStatus) {
      return new Error(
        `${propName} is required when showStatus is true in ${componentName}.`,
      );
    }

    return null;
  },
  coordinateSystem: PropTypes.string,
  height: PropTypes.number.isRequired,
};

CesiumGlobe.defaultProps = {
  name: '',
  orbits: [],
  overlays: [],
  showStatus: false,
  status: 'error',
  coordinateSystem: 'cartesian',
};

export default CesiumGlobe;
