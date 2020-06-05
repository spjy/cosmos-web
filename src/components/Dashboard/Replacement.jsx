import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { Badge } from 'antd';
// import moment from 'moment-timezone';

import { Context } from '../../store/dashboard';
import BaseComponent from '../BaseComponent';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Status({
  height,
}) {
  /** Get agent list state from the Context */
  const { state } = useContext(Context);
  /** Component's agent list storage */
  const [list, setList] = useState([]);

  /** Upon the state.list updating, update the store's list */
  useEffect(() => {
    if (state.file_list) {
      setList(state.file_list.output.outgoing);
    }
  }, [state.file_list]);

  return (
    <BaseComponent
      name="Radio"
      movable
      height={height}
    >
      {
        list.length === 0 ? 'No files.' : null
      }
      <table>
        <tbody>
          {
            list.map(({
              node, count, files,
            }) => (
              count > 0
                ? files.map(({
                  name, bytes, size,
                }) => (
                  <tr key={node + name + count + size}>
                    <td>
                      <Badge status={bytes / size < 1 ? 'processing' : 'success'} />
                    </td>
                    <td className="text-gray-500 pr-1">
                      {Math.round((bytes / size) * 100) / 100}
                      %
                    </td>
                    <td>
                      {name}
                    </td>
                  </tr>
                )) : null
            ))
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
