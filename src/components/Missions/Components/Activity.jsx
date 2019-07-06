import React, { useState } from 'react';
import { Form, Input } from 'antd';

import BaseComponent from '../BaseComponent';

function Activity() {
  /** Storage for form values */
  const [form, setForm] = useState({});

  return (
    <BaseComponent
      name="Last Message"
      subheader="06232019-1336Z"
      liveOnly
      showStatus
      status="error"
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
    >
      H
    </BaseComponent>
  );
}

export default Activity;
