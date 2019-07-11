import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Form, Select } from 'antd';

import BaseComponent from '../BaseComponent';

function Clock({
  timezone
}) {
  /** Storage for form values */
  const [time, setTime] = useState('');
  /** Settings for component */
  const [form, setForm] = useState({});
  /** Timezone */
  const [timezoneState, setTimezoneState] = useState(timezone);

  /** On mount, set the time and update each second */
  useEffect(() => {
    const clock = setTimeout(() => {
      setTime(moment().tz(timezoneState).format('MMDDYYYY-HH:mm:ss'));
    }, 1000);

    return () => {
      clearTimeout(clock);
    };
  }, [time]);

  return (
    <BaseComponent
      name="Time"
      subheader={timezoneState}
      liveOnly
      showStatus
      status="success"
      formItems={(
        <Form layout="vertical">
          <Form.Item label="Timezone" key="title">
            <Select
              className="w-full"
              defaultValue="Pacific/Honolulu"
              dropdownMatchSelectWidth={false}
              onChange={(value) => {
                setTimezoneState(value);
              }}
            >
              <Select.Option value="Pacific/Honolulu">Pacific/Honolulu</Select.Option>
              <Select.Option value="America/Los_Angeles">America/Los_Angeles</Select.Option>
              <Select.Option value="America/New_York">America/New_York</Select.Option>
              <Select.Option value="America/Phoenix">America/Phoenix</Select.Option>
              <Select.Option value="Europe/London">Europe/London</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      )}
    >
      <div className="text-center text-xl">
        {time}
      </div>
    </BaseComponent>
  );
}

Clock.propTypes = {
  timezone: PropTypes.string
};

Clock.defaultProps = {
  timezone: 'Pacific/Honolulu'
};

export default Clock;
