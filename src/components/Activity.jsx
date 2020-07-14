import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Badge } from 'antd';
import dayjs from 'dayjs';

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
    <>
      <style jsx>
        {`
        .grow {
          height: 36px;
        }

        .grow:hover {
          height: 100px;
          overflow: scroll;
        }
      `}
      </style>
      <div className={`bg-${color}-200 rounded p-2 overflow-hidden grow absolute z-10 transition-all ease-in duration-100`}>
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
    </>
  );
}

Activity.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Activity;
