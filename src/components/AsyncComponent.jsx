import React from 'react';
import PropTypes from 'prop-types';

import Activity from './Dashboard/Activity';
import Attitude from './Dashboard/Attitude';
import Clock from './Dashboard/Clock';
import Chart from './Dashboard/Chart';
import Commands from './Dashboard/Commands';
import Content from './Dashboard/Content';
import DisplayValue from './Dashboard/DisplayValue';
import Globe from './Dashboard/Globe';
import Macro from './Dashboard/Macro';
import MASDRCommands from './Dashboard/MASDRCommands';
import SatellitePasses from './Dashboard/SatellitePasses';
import SetValues from './Dashboard/SetValues';
import Status from './Dashboard/Status';
import ThreeD from './Dashboard/ThreeD';
import UploadFile from './Dashboard/UploadFile';

/** Store all of the components into an object */
const components = {
  Activity,
  Attitude,
  Clock,
  Chart,
  Commands,
  Content,
  DisplayValue,
  Globe,
  Macro,
  MASDRCommands,
  SatellitePasses,
  SetValues,
  Status,
  ThreeD,
  UploadFile,
};

/**
 * A wrapper component for dynamically rendering components into the layout.
 */
function AsyncComponent({ component, props }) {
  // Dynamically choose the component to render based on the component prop being passed in
  const Component = components[component];

  return <Component {...props} />;
}

AsyncComponent.propTypes = {
  /** The name of the component to render */
  component: PropTypes.string.isRequired,
  /** The props to pass into the component on render */
  props: PropTypes.shape({}),
};

AsyncComponent.defaultProps = {
  props: {},
};

export default AsyncComponent;
