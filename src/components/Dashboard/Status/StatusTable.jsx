import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'antd';

function StatusTable({
  list,
}) {
  return (
    <>
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
          </td>
          <td>
            {agent}
          </td>
        </tr>
      )) : null
    }
        </tbody>
      </table>
    </>
  );
}

StatusTable.propTypes = {
  list: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default StatusTable;
