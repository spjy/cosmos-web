import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Viewer, Entity, Model, EntityDescription, PointGraphics, Clock, Globe
} from 'resium';
import Cesium from 'cesium';

import {
  Form, Input, Collapse,
} from 'antd';
import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';
import { Context } from '../../../store/neutron1';
import model from '../../../public/cubesat.glb';

const { Panel } = Collapse;
const { TextArea } = Input;

const origin = Cesium.Cartesian3.fromDegrees(-90.0, 40.0, 200000.0);
const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
const position = Cesium.Cartesian3.fromDegrees(-74.0707383, 100.7117244, 100);

// let lon = 20;
// let lat = -123;

function getPosition(time, result) {

  lon = lon + 0.1;
  lat = lat + 0.1;
  
  return Cesium.Cartesian3.fromDegrees(lon, lat, 1000);
}

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
    newChart: {}
  });

  const { state } = useContext(Context);

  const [latitude, setLatitude] = useState(-90.0);
  const [longitude, setLongitude] = useState(40.0);
  const [altitude, setAltitude] = useState(200000.0);

  const [orbitsState, setOrbitsState] = useState(orbits);

  useState(() => {
    if (state[nodeProcessState] && state[nodeProcessState].node_loc_pos_eci && state[nodeProcessState].node_loc_pos_eci.pos) {
      const [x, y, z] = state[nodeProcessState].node_loc_pos_eci.pos;

      setLatitude(x);
      setLongitude(y);
      setAltitude(z);
    }
  }, [state[nodeProcessState]]);

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

  return (
    <BaseComponent
      name={nameState}
      liveOnly
      showStatus={showStatus}
      status={status}
      formItems={(
        <Form layout="vertical">
          hi
        </Form>
      )}
    >
      <Viewer>
        <Globe enableLighting />
        <Entity name="neutron1">
          <Model
            modelMatrix={getPos(latitude, longitude, altitude)}
            url={model}
            minimumPixelSize={20}
            onReady={() => console.log('ok')}
          />
        </Entity>
        <Entity position={position} name="Tokyo">
          <PointGraphics pixelSize={10} />
          <EntityDescription>
            <h1>Hello, world.</h1>
            <p>JSX is available here!</p>
          </EntityDescription>
        </Entity>
      </Viewer>
      <table className="mt-4 w-full">
        <tbody>
          <tr className="bg-gray-200 border-b border-gray-400">
            <td className="p-2 pr-8">Latitude</td>
            <td className="p-2 pr-8">Longitude</td>
            <td className="p-2 pr-8">Altitude</td>
          </tr>
          <tr className="text-gray-700 border-b border-gray-400">
            <td className="p-2 pr-8">102</td>
            <td className="p-2 pr-8">306</td>
            <td className="p-2 pr-8">200000</td>
          </tr>
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
      nodeProcess: PropTypes.string,
      dataKey: PropTypes.string,
      processDataKey: PropTypes.func,
      unit: PropTypes.string,
      live: PropTypes.bool,
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
