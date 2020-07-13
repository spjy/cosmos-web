import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import BaseComponent from '../BaseComponent';
import StatusTable from './Status/StatusTable';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Status({
  node,
  height,
}) {
  /** Get agent list state from the Context */
  const list = useSelector((s) => s.list.agent_list);
  const state = useSelector((s) => s);
  const [agentList, setAgentList] = useState([]);

  useEffect(() => {
    console.log(list, state);
    setAgentList([]);
    if (node && list != null) {
      setAgentList(list.filter((item) => item.agent.split(':')[0] === node));
    } else if (list != null) {
      setAgentList(list.filter((item) => item.utc !== -1));
    }
  }, [list]);

  return (
    <BaseComponent
      name="Agent List"
      movable
      height={height}
    >
      <StatusTable
        list={agentList || []}
        node={node}
      />
    </BaseComponent>
  );
}

Status.propTypes = {
  node: PropTypes.string,
  height: PropTypes.number.isRequired,
};

Status.defaultProps = {
  node: null,
};

export default Status;
