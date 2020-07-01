import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { Form, Select } from 'antd';

import BaseComponent from '../BaseComponent';

/**
 * Display a specified local time and UTC time from the year to the second.
 */
function Clock({
  timezone,
  height,
}) {
  /** Storage for form values */
  const [time, setTime] = useState('');
  /** Storage for form values */
  const [utcTime, setUtcTime] = useState('');
  /** Timezone */
  const [timezoneState, setTimezoneState] = useState(timezone);

  /** On mount, set the time and update each second */
  useEffect(() => {
    // Every second, update local and UTC time view
    const clock = setTimeout(() => {
      setTime(moment().tz(timezoneState).format('YYYY-MM-DDTHH:mm:ss'));
      setUtcTime(moment().utc().format('YYYY-MM-DDTHH:mm:ss'));
    }, 1000);

    // Stop timeout on unmount
    return () => {
      clearTimeout(clock);
    };
  }, [time, utcTime, timezoneState]);

  return (
    <BaseComponent
      name="Time"
      liveOnly
      showStatus
      height={height}
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
      <table className="text-2xl">
        <tbody>
          <tr>
            <td className="pr-4 text-gray-500 text-right">
              {timezoneState.split('/')[1]}
            </td>
            <td className="pr-2">
              {time}
            </td>
          </tr>
          <tr>
            <td className="pr-4 text-gray-500 text-right">
              UTC
            </td>
            <td className="pr-2">
              {utcTime}
            </td>
          </tr>
        </tbody>
      </table>
    </BaseComponent>
  );
}

Clock.propTypes = {
  /** The selected local timezone */
  timezone: PropTypes.string,
  height: PropTypes.number.isRequired,
};

Clock.defaultProps = {
  timezone: 'Pacific/Honolulu',
};

export default Clock;
