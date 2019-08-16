import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import Worldview, { Cubes, Axes, Text } from 'regl-worldview';

import {
  Form,
} from 'antd';

import BaseComponent from '../BaseComponent';
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
  /** Accessing the neutron1 messages from the socket */
  const { state } = useContext(Context);

  /** The state that manages the component's title */
  const [nameState] = useState(name);
  /** Storage for form values */
  const [form] = useState({
    newOrbit: {
      live: true,
    },
  });
  /** Currently displayed attitudes */
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

  /** Update the live attitude display */
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
    <Worldview>
      <Cubes>
        {[
          {
            pose: {
              orientation: { x: 0, y: 0, z: 0, w: 1 },
              // position the cube at the center
              position: { x: 0, y: 0, z: 0 },
            },
            scale: { x: 10, y: 10, z: 10 },
            // rgba values are between 0 and 1 (inclusive)
            color: { r: 1, g: 0, b: 0, a: 1 },
          },
        ]}
      </Cubes>
      <Axes />
      <Text autoBackgroundColor>
        {[
          {
            text: "Hello, Worldview!",
            color: { r: 1, g: 1, b: 1, a: 1 },
            pose: {
              orientation: { x: 0, y: 0, z: 0, w: 1 },
              position: { x: 0, y: 5, z: 10 },
            },
            scale: { x: 1, y: 1, z: 1 },
          },
        ]}
      </Text>
    </Worldview>
  );
}

DisplayValue.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Currently displayed attitudes */
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
