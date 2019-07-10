import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'antd';
import moment from 'moment-timezone';

function Status({
  statuses
}) {
  return (
    <table>
      <tbody>
        <tr>
          <td>
            <Badge status="success" />
          </td>
          <td className="pr-4">
            neutron1:adcs
          </td>
          <td className="text-gray-500">
            06231999-1630Z
          </td>
        </tr>
        {
          statuses.map(({ agent_node: node, agent_proc: proc, agent_utc: utc }) => {
            return (
              <tr>
                <td>
                  <Badge status="success" />
                </td>
                <td className="pr-4">
                  {node}
                  :
                  {proc}
                </td>
                <td className="text-gray-500">
                  {moment.unix(utc).format('MMDDYYYY-HHmmss')}
                </td>
              </tr>
            );
          })
        }
        <tr>
          <td>
            <Badge status="success" />
          </td>
          <td className="pr-4">
            neutron1:obc
          </td>
          <td className="text-gray-500">
            06231999-1630Z
          </td>
        </tr>
        <tr>
          <td>
            <Badge status="default" />
          </td>
          <td className="pr-4">
            neutron1:file
          </td>
          <td className="text-gray-500">
            06231999-1630Z
          </td>
        </tr>
        <tr>
          <td>
            <Badge status="default" />
          </td>
          <td className="pr-4">
            neutron1:exec
          </td>
          <td className="text-gray-500">
            06231999-1630Z
          </td>
        </tr>
        <tr>
          <td>
            <Badge status="success" />
          </td>
          <td className="pr-4">
            neutron1:cpu
          </td>
          <td className="text-gray-500">
            06231999-1630Z
          </td>
        </tr>
        <tr>
          <td>
            <Badge status="default" />
          </td>
          <td className="pr-4">
            neutron1:motion
          </td>
          <td className="text-gray-500">
            06231999-1630Z
          </td>
        </tr>
      </tbody>
    </table>
  );
}

Status.propTypes = {
  statuses: PropTypes.array.isRequired
};

export default Status;
