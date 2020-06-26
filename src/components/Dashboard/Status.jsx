import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import BaseComponent from '../BaseComponent';
import StatusTable from './Status/StatusTable';

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
      <StatusTable
        list={list}
      />
    </BaseComponent>
  );
}

Status.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Status;
