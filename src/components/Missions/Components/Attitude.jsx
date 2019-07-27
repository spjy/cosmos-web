import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import {
  Viewer, Entity, Model, Globe, Clock, CameraFlyTo,
} from 'resium';
import Cesium from 'cesium';

import {
  Form, Input, Collapse, Button, Switch, DatePicker, Icon,
} from 'antd';

import BaseComponent from '../BaseComponent';
import AttitudeThreeD from './Babylon/AttitudeThreeD';
import { Context } from '../../../store/neutron1';
import model from '../../../public/cubesat.glb';
import socket from '../../../socket';

const { Panel } = Collapse;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

/**
 * Displays a specified value.
 */
function DisplayValue({
  name,
  attitudes,
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

  const [attitudesState, setAttitudesState] = useState(attitudes);

  const [retrieveOrbitHistory, setRetrieveOrbitHistory] = useState(null);

  /** Initialize form slots for each orbit */
  useEffect(() => {
    // Make an object for each plot's form
    for (let i = 0; i < attitudesState.length; i += 1) {
      form[i] = {
        live: attitudesState[i].live,
      };
    }
  }, []);

  useEffect(() => {
    attitudesState.forEach((attitude, i) => {
      if (state[attitude.nodeProcess] && state[attitude.nodeProcess].node_loc_att_icrf && state[attitude.nodeProcess].node_loc_att_icrf.pos && attitude.live) {
        const tempAttitude = [...attitudesState];

        tempAttitude[i].quaternions = state[attitude.nodeProcess].node_loc_att_icrf.pos;

        setAttitudesState(tempAttitude);
      }
    });
  }, [state]);

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
            `database=agent_dump?collection=${orbitsState[retrieveOrbitHistory].nodeProcess}?multiple=true?query={"utc": { "$gt": ${from}, "$lt": ${to} }}?options={"limit": 200}`,
          );
        }

        query.onmessage = ({ data }) => {
          try {
            const json = JSON.parse(data);

            console.log(json);

            const tempOrbit = [...orbitsState];

            let startOrbit;
            let stopOrbit;
            let startOrbitPosition;

            tempOrbit[retrieveOrbitHistory].live = false;

            if (json.length > 0) {
              startOrbit = Cesium.JulianDate.fromDate(moment.unix((((json[0].utc + 2400000.5) - 2440587.5) * 86400.0)).toDate());
              stopOrbit = Cesium.JulianDate.fromDate(moment.unix((((json[json.length - 1].utc + 2400000.5) - 2440587.5) * 86400.0)).toDate());
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
      subheader={attitudesState.length === 0 ? 'No orbits to display.' : null}
      liveOnly
      showStatus={showStatus}
      status={status}
      formItems={(
        <Form layout="vertical">
          ok
        </Form>
      )}
    >
      <AttitudeThreeD
        data={attitudesState[0].quaternions}
      />
      <table className="mt-4 w-full overflow-x-scroll">
        <tbody>
          <tr className="bg-gray-200 border-b border-gray-400">
            <td className="p-2 pr-8">Name</td>
            <td className="p-2 pr-8">x</td>
            <td className="p-2 pr-8">y</td>
            <td className="p-2 pr-8">z</td>
            <td className="p-2 pr-8">w</td>
          </tr>
          {
          attitudesState.map(attitude => (
            <tr className="text-gray-700 border-b border-gray-400" key={attitude.name}>
              <td className="p-2 pr-8">{attitude.name}</td>
              <td className="p-2 pr-8">{attitude.quaternions.d && attitude.quaternions.d.x ? attitude.quaternions.d.x : '-'}</td>
              <td className="p-2 pr-8">{attitude.quaternions.d && attitude.quaternions.d.y ? attitude.quaternions.d.y : '-'}</td>
              <td className="p-2 pr-8">{attitude.quaternions.d && attitude.quaternions.d.z ? attitude.quaternions.d.z : '-'}</td>
              <td className="p-2 pr-8">{attitude.quaternions.d && attitude.quaternions.w ? attitude.quaternions.w : '-'}</td>
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
  attitudes: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      nodeProcess: PropTypes.string,
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
        `${propName} is required when showStatus is true in ${componentName}.`,
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
  attitudes: [],
  nodeProc: null,
  showStatus: false,
  status: 'error',
  children: null,
  formItems: null,
};

export default DisplayValue;
