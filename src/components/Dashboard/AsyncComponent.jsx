import React from 'react';
import PropTypes from 'prop-types';

import Activity from './Activity';
import Attitude from './Attitude';
import Clock from './Clock';
import Chart from './Chart';
import Commands from './Commands';
import Content from './Content';
import DisplayValue from './DisplayValue';
import Globe from './Globe';
import SetValues from './SetValues';
import Status from './Status';
import ThreeD from './ThreeD';
import UploadFile from './UploadFile';

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
  SetValues,
  Status,
  ThreeD,
  UploadFile,
};

/**
 * A wrapper component for dynamically rendering components into the layout.
 * @param {String} component The string representation of the component
 * @param {Object} props The props to pass into the component to render
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
