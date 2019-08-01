import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Form,
} from 'antd';

import BaseComponent from '../BaseComponent';
import AttitudeThreeD from './Babylon/AttitudeThreeD';
import { Context } from '../../../store/neutron1';

/**
 * Displays a specified value.
 */
function DisplayValue({
  name,
  attitudes,
  showStatus,
  status,
}) {
  /** The state that manages the component's title */
  const [nameState] = useState(name);
  /** Storage for form values */
  const [form] = useState({
    newOrbit: {
      live: true,
    },
  });

  const { state } = useContext(Context);

  const [attitudesState, setAttitudesState] = useState(attitudes);

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
      if (state[attitude.nodeProcess]
          && state[attitude.nodeProcess].node_loc_att_icrf
          && state[attitude.nodeProcess].node_loc_att_icrf.pos
          && attitude.live
      ) {
        const tempAttitude = [...attitudesState];

        tempAttitude[i].quaternions = state[attitude.nodeProcess].node_loc_att_icrf.pos;

        setAttitudesState(tempAttitude);
      }
    });
  }, [state]);

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
      <div className="overflow-x-scroll">
        <table className="mt-4 w-full">
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
      </div>
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
};

DisplayValue.defaultProps = {
  name: '',
  attitudes: [],
  showStatus: false,
  status: 'error',
};

export default DisplayValue;
