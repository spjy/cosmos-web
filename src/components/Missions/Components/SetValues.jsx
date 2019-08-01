import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

import BaseComponent from '../BaseComponent';

/**
 * A general purpose component.
 */
function SetValues({
  name,
  subheader,
  liveOnly,
  showStatus,
  status,
  formItems,
}) {
  /** Form storage */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [, setLiveSwitch] = useState();

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
      <Form layout="vertical">
        <Form.Item
          label="Doppler Shift"
          key="nameState"
          hasFeedback={form.nameState && form.nameState.touched}
          validateStatus={form.nameState && form.nameState.changed ? 'success' : ''}
        >
          <Input
            placeholder="Doppler Shift"
            id="nameState"
            onFocus={({ target: { id: item } }) => setForm({
              ...form,
              [item]: {
                ...form[item],
                touched: true,
                changed: false,
              },
            })}
            onChange={({ target: { id: item, value } }) => setForm({
              ...form,
              [item]: {
                ...form[item],
                value,
                changed: false,
              },
            })}
            onBlur={({ target: { id: item, value } }) => {
              setForm({
                ...form,
                [item]: {
                  ...form[item],
                  changed: true,
                },
              });
            }}
            defaultValue={name}
          />

        </Form.Item>
      </Form>
    </BaseComponent>
  );
}

SetValues.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** Whether the component can display only live data. Hides/shows the live/past switch. */
  liveOnly: PropTypes.bool,
  /** Function is run when the live/past switch is toggled. */
  // handleLiveSwitchChange: PropTypes.func,
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
  /** Form node */
  formItems: PropTypes.node,
};

SetValues.defaultProps = {
  name: '',
  subheader: null,
  showStatus: false,
  liveOnly: true,
  // handleLiveSwitchChange: () => {},
  status: 'error',
  formItems: null,
};

export default SetValues;
