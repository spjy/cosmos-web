import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Badge, Form, Button } from 'antd';
import moment from 'moment-timezone';
import { highlight, languages } from 'prismjs/components/prism-core';

import { Context } from '../../store/dashboard';
import BaseComponent from '../BaseComponent';

/**
 * Retrieves data from a web socket. Displays an event along with the timestamp in a table.
 */
function Activity({
  height,
}) {
  /** Get agent list state from the Context */
  const { state } = useContext(Context);
  /** Component's agent list storage */
  const [activity, setActivity] = useState([]);
  /** Packets currently sent in this session */
  const [packets, setPackets] = useState('');
  /** Option to export packets */
  const [exportPackets, setExportPackets] = useState(null);

  /** Handle the packet saving */
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportPackets]);

  /** Upon the state.list updating, update the store's list */
  useEffect(() => {
    if (state.activity) {
      const { activity: event, node_utc } = state.activity; // eslint-disable-line camelcase

      setActivity([
        {
          activity: event,
          node_utc,
        },
        ...activity,
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activity]);

  return (
    <BaseComponent
      name="Activity"
      liveOnly
      height={height}
      formItems={(
        <div>
          <Form layout="vertical">
            <Button onClick={() => setExportPackets(true)}>
              Export Packets
            </Button>
          </Form>
          <pre
            className="language-json"
            // eslint-disable-next-line react/no-danger
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
            activity.map(({ activity: event, node_utc }) => ( // eslint-disable-line camelcase
              // eslint-disable-next-line camelcase
              <tr className="truncate ..." key={node_utc}>
                <td>
                  <Badge status="default" />
                </td>
                <td className="pr-4 text-gray-500">
                  {
                    moment
                      // eslint-disable-next-line camelcase
                      .unix((((node_utc + 2400000.5) - 2440587.5) * 86400.0))
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

Activity.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Activity;
