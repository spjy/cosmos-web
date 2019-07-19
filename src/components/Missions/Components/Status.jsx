import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'antd';
import moment from 'moment-timezone';

import socket from '../../../socket';

const ws = socket('query', '/command/');

function Status({
  statuses
}) {
  const [list, setList] = useState([]);

  ws.onmessage = ({ data }) => {
    try {
      const json = JSON.parse(data);

      setList(json.agent_list);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   if (ws) {
  //     const timeout = setTimeout(() => {
  //       ws.send('list_json');
  //     }, 5000);

  //     return () => {
  //       clearTimeout(timeout);
  //     };
  //   }
  //   return () => {};
  // }, [list]);

  return (
    <table>
      <tbody>
        {
          list.length === 0 ? 'No agents.' : null
        }
        {
          list.map(({ agent_node: node, agent_proc: proc, agent_utc: utc, status }) => {
            return (
              <tr key={`${node}:${proc}`}>
                <td>
                  {status === 'OK' ? <Badge status="success" /> : <Badge status="default" />}
                </td>
                <td className="pr-4">
                  {node}
                  :
                  {proc}
                </td>
                <td className="text-gray-500">
                  {moment.unix((((utc + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DD HH:mm:ss')}
                </td>
              </tr>
            );
          })
        }
      </tbody>
    </table>
  );
}

Status.propTypes = {
  statuses: PropTypes.array.isRequired
};

export default Status;
