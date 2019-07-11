import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

import BaseComponent from '../BaseComponent';

/**
 * A general purpose component.
 */
function Content({
  name,
  subheader,
  liveOnly,
  showStatus,
  status,
  children,
  formItems
}) {
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();

  return (
    <BaseComponent
      name={name}
      subheader={subheader}
      liveOnly={liveOnly}
      showStatus={showStatus}
      status={status}
      formItems={formItems}
      handleLiveSwitchChange={checked => setLiveSwitch(checked)}
    >
      {children}
    </BaseComponent>
  );
}

Content.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** Whether the component can display only live data. Hides/shows the live/past switch. */
  liveOnly: PropTypes.bool,
  /** Function is run when the live/past switch is toggled. */
  handleLiveSwitchChange: PropTypes.func,
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
  formItems: PropTypes.node
};

Content.defaultProps = {
  name: '',
  subheader: null,
  showStatus: false,
  liveOnly: true,
  handleLiveSwitchChange: () => {},
  status: 'error',
  children: null,
  formItems: null
};

export default Content;
