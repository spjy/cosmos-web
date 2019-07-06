import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

import BaseComponent from '../BaseComponent';

function DisplayValue({
  val,
  name,
  subheader
}) {
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();

  return (
    <BaseComponent
      name={name}
      subheader={subheader}
      liveOnly
      showStatus={false}
      formItems={(
        <div>
          <Form.Item label="Title" key="title">
            <Input
              placeholder="Form Title"
              id="title"
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: value })}
              value={form.title}
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
  name: PropTypes.string.isRequired,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** Value to display in card */
  val: PropTypes.node.isRequired
};

DisplayValue.defaultProps = {
  subheader: null
};

export default DisplayValue;
