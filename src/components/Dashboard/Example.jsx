import React, { useState } from 'react';
import { Form, Input } from 'antd';

import BaseComponent from '../BaseComponent';

function Example() {
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [, setLiveSwitch] = useState();

  return (
    <BaseComponent
      name="Last Message"
      subheader="06232019-1336Z"
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
      handleLiveSwitchChange={checked => setLiveSwitch(checked)}
    >
      Hi
    </BaseComponent>
  );
}

export default Example;
