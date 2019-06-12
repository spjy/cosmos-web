import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

import CosmosWidget from '../CosmosWidgetComponents/CosmosWidget';
import WidgetSettings from './WidgetSettings';

/**
 * Example COSMOS Web widget.
 */
function Example({
  id,
  info,
  selfDestruct,
  updateInfo,
  mod
}) {
  /** Handler for the widget settings modal */
  const [openSettings, setOpenSettings] = useState(false);
  /** Storage for form values */
  const [form, setForm] = useState({});

  return (
    <div>
      <WidgetSettings
        visible={openSettings}
        /** Closes the modal. */
        closeModal={() => setOpenSettings(false)}
        /** Handles form submission */
        submitForm={() => updateInfo(id, form)}
        updateInfo={updateInfo}
        validForm
      >
        {/* Insert form items here */}
        <Form.Item label="Title" key="title">
          <Input
            placeholder="Title"
            id="title"
            onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: value })}
            value={form.title}
          />
        </Form.Item>
      </WidgetSettings>

      <CosmosWidget
        id={id}
        title="Example Widget"
        mod={mod}
        selfDestruct={selfDestruct}
        editWidget={() => setOpenSettings(true)}
      >
        {/* Insert card content here */}
      </CosmosWidget>
    </div>
  );
}

Example.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.shape({
    widgetClass: PropTypes.string.isRequired
  }).isRequired,
  selfDestruct: PropTypes.func.isRequired,
  updateInfo: PropTypes.func.isRequired,
  mod: PropTypes.bool.isRequired
};

export default Example;
