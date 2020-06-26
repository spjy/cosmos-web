import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { Badge } from 'antd';
// import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Status({
  height,
}) {
  /** Get agent list state from the Context */
  const list = useSelector((s) => s.list.agent_list);

  return (
    <BaseComponent
      name="Agent List"
      movable
      height={height}
    >
      {
        !list || list.length === 0 ? 'No agents.' : null
      }
      <table>
        <tbody>
          {
            list ? list.map(({
              agent, utc,
            }) => (
              <tr key={agent}>
                <td>
                  <Badge status="success" />
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
            )) : null
          }
        </tbody>
      </table>
    </BaseComponent>
  );
}

Status.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Status;
