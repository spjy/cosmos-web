import React, { useEffect, useState, useContext } from 'react';
import { Badge } from 'antd';
// import moment from 'moment-timezone';

import { Context } from '../../store/neutron1';
import Content from './Content';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Status() {
  /** Get agent list state from the Context */
  const { state } = useContext(Context);
  /** Component's agent list storage */
  const [list, setList] = useState([]);

  /** Upon the state.list updating, update the store's list */
  useEffect(() => {
    if (state.list) {
      setList(state.list.agent_list);
    }
  }, [state.list]);

  return (
    <Content
      name="Agent List"
    >
      {
        list.length === 0 ? 'No agents.' : null
      }
      <table>
        <tbody>
          {
            list.map(({
              agent, utc,
            }) => (
              <tr key={agent}>
                <td>
                  {<Badge status="success" />}
                </td>
                <td className="text-gray-500 pr-2">
                  {utc}
                  {/* {
                    moment
                      .unix((((utc + 2400000.5) - 2440587.5) * 86400.0))
                      .format('YYYY-MM-DD HH:mm:ss')
                  } */}
                </td>
                <td>
                  {agent}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </Content>
  );
}

export default Status;
