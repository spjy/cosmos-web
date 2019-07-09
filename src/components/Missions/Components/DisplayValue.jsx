import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

import BaseComponent from '../BaseComponent';

function DisplayValue({
  val,
  name,
  subheader,
  liveOnly,
  handleLiveSwitchChange,
  showStatus,
  status
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
      handleLiveSwitchChange={() => {}}
      showStatus={showStatus}
      status={status}
      formItems={(
        <div>
          <Form.Item label="Agent" key="title">
            <Input
              placeholder="Agent"
              id="agent"
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: value })}
              value={form.agent}
            />
          </Form.Item>
          <Form.Item label="Agent" key="agent">
            <Input
              placeholder="Agent"
              id="agent"
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: value })}
              value={form.agent}
            />
          </Form.Item>
          <Form.Item label="Key to display" key="key">
            <Input
              placeholder="Key to display"
              id="key"
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: value })}
              value={form.key}
            />
          </Form.Item>
        </div>
      )}
      handleLiveSwitchChange={checked => setLiveSwitch(checked)}
    >
      {val}
    </BaseComponent>
  );
}

DisplayValue.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** Value to display in card */
  val: PropTypes.node.isRequired,
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
  }
};

DisplayValue.defaultProps = {
  name: '',
  subheader: null,
  showStatus: false,
  liveOnly: true,
  handleLiveSwitchChange: () => {},
  status: 'error'
};

export default DisplayValue;
