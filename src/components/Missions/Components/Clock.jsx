import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
// import { Form, Select } from 'antd';

import BaseComponent from '../BaseComponent';

function Clock({
  timezone
}) {
  /** Storage for form values */
  const [time, setTime] = useState('');
  /** Settings for component */
  // const [form, setForm] = useState({});
  /** Timezone */
  // const [tz, setTz] = useState(timezone);

  const updateTime = () => {
    setTime(moment().tz(timezone).format('MMDDYYYY-HH:mm:ss'));
  };

  /** On mount, set the time and update each second */
  useEffect(() => {
    // clearInterval(interval);

    // updateTime();

    setInterval(updateTime, 1000);
  }, []);

  return (
    <BaseComponent
      name="Time"
      subheader={timezone}
      liveOnly
      showStatus
      status="success"
      // formItems={(
      //   <div>
      //     <Form.Item label="Timezone" key="title">
      //       <Select
      //         className="w-auto"
      //         defaultValue="Pacific/Honolulu"
      //         dropdownMatchSelectWidth={false}
      //         onChange={(value) => {
      //           setTz(value);
      //           clearInterval(interval);
      //         }}
      //       >
      //         <Select.Option value="Pacific/Honolulu">Pacific/Honolulu</Select.Option>
      //         <Select.Option value="America/Los_Angeles">America/Los_Angeles</Select.Option>
      //         <Select.Option value="America/New_York">America/New_York</Select.Option>
      //         <Select.Option value="America/Phoenix">America/Phoenix</Select.Option>
      //         <Select.Option value="Europe/London">Europe/London</Select.Option>
      //       </Select>
      //     </Form.Item>
      //   </div>
      // )}
    >
      <div className="text-center text-xl font-bold">
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
