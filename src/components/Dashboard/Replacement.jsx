import React from 'react';
import PropTypes from 'prop-types';

import { Badge } from 'antd';
import { useSelector } from 'react-redux';
// import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Replacement({
  height,
}) {
  /** Get agent list state from the Context */
  const list = useSelector((s) => s.file_list);

  return (
    <BaseComponent
      name="Replacement"
      movable
      height={height}
    >
      {
        !list || list.length === 0 ? 'No files.' : null
      }
      <table>
        <tbody>
          {
            list ? list.map(({
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
            )) : null
          }
        </tbody>
      </table>
    </BaseComponent>
  );
}

Replacement.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Replacement;
