import React, { useEffect, useState } from 'react';
import { Badge } from 'antd';
import moment from 'moment-timezone';

import socket from '../../../socket';

const ws = socket('live', '/live/list');

function Status() {
  const [list, setList] = useState([]);

  ws.onmessage = ({ data }) => {
    try {
      const json = JSON.parse(data);

      setList(json.agent_list);

      console.log(json);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => () => ws.close(1000), []);

  return (
    <div>
      {
        list.length === 0 ? 'No agents.' : null
      }
      <table className="">
        <tbody>
          {
            list.map(({
              agent, utc,
            }) => (
              <tr key={agent}>
                <td>
                  {<Badge status="success" />}
                </td>
                <td className="pr-4">
                  {agent}
                </td>
                <td className="text-gray-500">
                  {utc}
                  {moment.unix((((utc + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss')}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

export default Status;
