import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';

function Clock() {
  /** Storage for form values */
  const [time, setTime] = useState('');
  /** Storage for form values */
  const [utcTime, setUtcTime] = useState('');
  /** Timezone */
  const [timezoneState] = useState('Pacific/Honolulu');

  /** On mount, set the time and update each second */
  useEffect(() => {
    // Every second, update local and UTC time view
    const clock = setTimeout(() => {
      setTime(moment().tz(timezoneState).format('YYYY-MM-DDTHH:mm:ss'));
      setUtcTime(moment().tz('Europe/London').format('YYYY-MM-DDTHH:mm:ss'));
    }, 1000);

    // Stop timeout on unmount
    return () => {
      clearTimeout(clock);
    };
  }, [time, utcTime, timezoneState]);

  return (
    <table>
      <tbody>
        <tr>
          <td className="pr-4 text-gray-500">
            {timezoneState.split('/')[1]}
          </td>
          <td className="pr-2 text-gray-500 ">
            UTC
          </td>
        </tr>
        <tr>
          <td className="pr-4">
            {time}
          </td>
          <td className="pr-2">
            {utcTime}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default Clock;
