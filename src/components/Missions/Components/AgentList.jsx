import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Select, Button } from 'antd';

import BaseComponent from '../BaseComponent';

function DisplayValue() {
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();

  return (
    <BaseComponent
      name="Agent Commands"
      subheader=""
      liveOnly
      showStatus={false}
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
          <Form.Item label="Agent" key="title">
            <Input
              placeholder="Agent"
              id="agent"
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: value })}
              value={form.agent}
            />
          </Form.Item>
          <Form.Item label="Key to display" key="title">
            <Input
              placeholder="Key to display"
              id="key"
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: value })}
              value={form.key}
            />
          </Form.Item>
        </div>
      )}
    >
      <div className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-scroll">
      ➜ agent list
      </div>
      <div className="flex">
        <Input
          addonBefore={(
            <Select
              className="w-auto"
              defaultValue="agent"
              dropdownMatchSelectWidth={false}
            >
              <Select.Option value="agent">➜ agent</Select.Option>
              <Select.Option value="help">help</Select.Option>
              <Select.Option value="shutdown">shutdown</Select.Option>
              <Select.Option value="diskFreePercent">diskFreePercent</Select.Option>
              <Select.Option value="getvalue">getvalue</Select.Option>
            </Select>
          )}
          addonAfter={(
            <div className="cursor-pointer text-blue-600 hover:text-blue-400">
              Send
            </div>
          )}
          placeholder="Arguments"
        />
      </div>
    </BaseComponent>
  );
}

DisplayValue.propTypes = {};

DisplayValue.defaultProps = {};

export default DisplayValue;
