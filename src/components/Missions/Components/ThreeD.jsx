import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import Worldview, {
  GLTFScene, Axes, Grid, Cubes,
} from 'regl-worldview';

import model from '../../../public/cubesat.glb';

import Content from './Content';
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
    <>
      {/* <div className="flex justify-between p-3 dragHandle cursor-move" style={{ backgroundColor: '#f1f1f1' }}>
        <div className="font-bold text-lg mr-4">
          {name}
        </div>
        {model}
      </div> */}
      <Worldview>
        <GLTFScene model={model}>
          {{
            pose: {
              position: { x: 0, y: -3, z: 0 },
              orientation: { x: 0, y: 0, z: 0, w: 1 },
            },
            scale: { x: 3, y: 3, z: 3 },
          }}
        </GLTFScene>
        <Axes />
        <Grid />
      </Worldview>
    </>
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
