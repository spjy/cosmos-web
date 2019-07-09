import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Form, Input } from 'antd';

import BaseComponent from '../BaseComponent';

function Clock({
  timezone
}) {
  /** Storage for form values */
  const [time, setTime] = useState('');
  /** Settings for component */
  const [form, setForm] = useState({});

  /** On mount, set the time and update each second */
  useEffect(() => {
    setTime(moment().tz(timezone).format('HH:mm:ss'));

    setInterval(() => {
      setTime(moment().tz(timezone).format('HH:mm:ss'));
    }, 1000);
  }, []);

  return (
    <BaseComponent
      name="Time"
      subheader="America/Honolulu"
      liveOnly
      showStatus
      status="success"
      formItems={(
        <div>
          <Form.Item label="Timezone" key="title">
            <Input
              placeholder="Timezone"
              id="timezone"
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: value })}
              value={form.timezone}
            />
          </Form.Item>
        </div>
      )}
    >
      <div className="text-center text-lg font-bold">
        {time}
      </div>
    </BaseComponent>
  );
}

Clock.propTypes = {
  timezone: PropTypes.string
};

Clock.defaultProps = {
  timezone: 'America/Honolulu'
};

export default Clock;
