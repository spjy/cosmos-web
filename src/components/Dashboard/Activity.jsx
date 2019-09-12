import React, { useState, useContext, useEffect } from 'react';
import { Badge } from 'antd';
import moment from 'moment-timezone';

import { Context } from '../../store/neutron1';
import Content from './Content';

/**
 * Retrieves data from a web socket. Displays an event along with the timestamp.
 */
function Activity() {
  /** Get agent list state from the Context */
  const { state } = useContext(Context);
  /** Component's agent list storage */
  const [activity, setActivity] = useState([]);

  /** Upon the state.list updating, update the store's list */
  useEffect(() => {
    if (state.activity) {
      const { activity: event, utc } = state.activity;

      setActivity([
        {
          activity: event,
          utc,
        },
        ...activity,
      ]);
    }
  }, [state.activity]);

  return (
    <Content
      name="Activity"
      movable
    >
      {
        activity.length === 0 ? 'No activity.' : null
      }
      <table>
        <tbody>
          {
            activity.map(({ activity: event, utc }) => (
              <tr key={utc}>
                <td>
                  {<Badge status="default" />}
                </td>
                <td className="pr-4">
                  {event}
                </td>
                <td className="text-gray-500">
                  {
                    moment
                      .unix((((utc + 2400000.5) - 2440587.5) * 86400.0))
                      .format('YYYY-MM-DDTHH:mm:ss')
                  }
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </Content>
  );
}

export default Activity;
