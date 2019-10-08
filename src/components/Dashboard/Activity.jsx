import React, { useState, useContext, useEffect } from 'react';
import { Badge, Form, Button } from 'antd';
import moment from 'moment-timezone';
import { highlight, languages } from 'prismjs/components/prism-core';

import { Context } from '../../store/neutron1';
import BaseComponent from '../BaseComponent';

/**
 * Retrieves data from a web socket. Displays an event along with the timestamp.
 */
function Activity() {
  /** Get agent list state from the Context */
  const { state } = useContext(Context);
  /** Component's agent list storage */
  const [activity, setActivity] = useState([]);

  const [packets, setPackets] = useState('');

  const [exportPackets, setExportPackets] = useState(null);

  useEffect(() => {
    if (exportPackets !== null) {
      setPackets('');

      let savedPackets = '';

      activity.forEach((packet) => {
        savedPackets = `${savedPackets}\n${packet.activity}`;
      });

      setPackets(savedPackets);
      setExportPackets(null);
    }
  }, [exportPackets]);

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
    <BaseComponent
      name="Activity"
      liveOnly
      formItems={(
        <div>
          <Form layout="vertical">
            <Button onClick={() => setExportPackets(true)}>
              Export Packets
            </Button>
          </Form>
          <pre
            className="language-json"
            dangerouslySetInnerHTML={{
              __html: highlight(
                packets,
                languages.json,
                'json',
              ),
            }}
          />
        </div>
      )}
    >
      {
        activity.length === 0 ? 'No activity.' : null
      }
      <table>
        <tbody>
          {
            activity.map(({ activity: event, utc }) => (
              <tr className="truncate ..." key={utc}>
                <td>
                  {<Badge status="default" />}
                </td>
                <td className="pr-4 text-gray-500">
                  {
                    moment
                      .unix((((utc + 2400000.5) - 2440587.5) * 86400.0))
                      .format('YYYY-MM-DDTHH:mm:ss')
                  }
                </td>
                <td>
                  {event}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </BaseComponent>
  );
}

export default Activity;
