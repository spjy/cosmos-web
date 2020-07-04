import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

function Clock() {
  /** Storage for local time */
  const [time, setTime] = useState('');
  /** Storage for utc time */
  const [utcTime, setUtcTime] = useState('');

  /** On mount, set the time and update each second */
  useEffect(() => {
    // Every second, update local and UTC time view
    const clock = setTimeout(() => {
      setTime(DateTime.local().toFormat('yyyy-mm-dd\'T\'TTZZZ'));
      setUtcTime(DateTime.utc().toFormat('yyyy-mm-dd\'T\'TTZZZ'));
    }, 1000);

    // Stop timeout on unmount
    return () => {
      clearTimeout(clock);
    };
  }, [time, utcTime]);

  return (
    <table>
      <tbody>
        <tr>
          <td className="pr-4 text-gray-500">
            Local
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
