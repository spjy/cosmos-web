import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

import BaseComponent from '../BaseComponent';

function Activity({
  name,
  subheader,
  val,
}) {
  /** Storage for form values */
  const [form, setForm] = useState({});

  return (
    <BaseComponent
      name={name}
      subheader={subheader}
      liveOnly
      showStatus
      status="error"
      formItems={(
        <Form layout="vertical">
          <Form.Item label="Title" key="title">
            <Input
              placeholder="Form Title"
              id="title"
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: value })}
              value={form.title}
            />
          </Form.Item>
        </Form>
      )}
    >
      {val}
    </BaseComponent>
  );
}

Activity.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** Value to display in card */
  val: PropTypes.node.isRequired,
};

Activity.defaultProps = {
  name: '',
  subheader: null,
};

export default Activity;
