import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Badge } from 'antd';
import dayjs from 'dayjs';

import BaseComponent from '../BaseComponent';

/**
 * Retrieves data from a web socket. Displays an event along with the timestamp in a table.
 */
function Activity({
  height,
}) {
  /** Get agent list state from the Context */
  const activities = useSelector((s) => s.activity);
  const lastDate = useSelector((s) => s.lastDate);

  const [color, setColor] = useState('red');

  const timerYellow = useRef(null);
  const timerRed = useRef(null);

  // Get lastDate (last retrieved date) and compare with current time)
  // Compare. If <2 min, green, <5min, yellow, < 10min, red

  useEffect(() => {
    if (lastDate) {
      const minuteDifference = lastDate.diff(dayjs(), 'minute');
      if (-minuteDifference <= 2) {
        setColor('green');

        if (timerYellow.current != null && timerRed.current != null) {
          clearTimeout(timerYellow.current);
          clearTimeout(timerRed.current);
        }

        timerYellow.current = setTimeout(() => {
          setColor('orange');
        }, 300000);
        timerRed.current = setTimeout(() => {
          setColor('red');
        }, 600000);
      }
    }
  }, [lastDate]);

  return (
    <BaseComponent
      name="Activity"
      liveOnly
      toolsSlot={(
        <>
          <span className="mr-3">
            <Badge status="success" />
            {'< 5 min'}
          </span>
          <span className="mr-3">
            <Badge status="warning" />
            {'< 10 min'}
          </span>
          <span className="mr-3">
            <Badge status="error" />
            {'> 10 min'}
          </span>
        </>
      )}
      height={height}
    >
      <style jsx>
        {
          `
            .activity {
              min-height: 350px;
            }
          `
        }
      </style>
      <div className={`bg-${color}-200 transition ease-in duration-500 rounded p-3 activity overflow-auto`}>
        <table>
          <tbody>
            {
              // eslint-disable-next-line camelcase
              activities ? activities.map(({
                status, summary, scope, time,
              }) => (
                // eslint-disable-next-line camelcase
                <tr className="truncate ..." key={summary + time + scope}>
                  <td>
                    <Badge status={status} />
                  </td>
                  <td className="pr-4 text-gray-600">
                    {
                      time
                    }
                  </td>
                  <td>
                    {summary}
                    &nbsp;
                    <span className="text-gray-600">
                      {scope}
                    </span>
                  </td>
                </tr>
              )) : 'No activity.'
            }
          </tbody>
        </table>
      </div>
    </BaseComponent>
  );
}

Activity.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Activity;
