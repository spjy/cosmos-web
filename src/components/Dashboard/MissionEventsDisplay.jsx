import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  Select, message,
} from 'antd';

import BaseComponent from '../BaseComponent';
import MED from './MED/MED';
import { axios } from '../../api';

function MissionEventsDisplay({
  nodes,
  height,
}) {
  const live = useSelector((s) => s.data);

  const [node, setNode] = useState(nodes[0]);
  const [info, setInfo] = useState([]);

  const queryEventLog = async () => {
    try {
      const { data } = await axios.post(`/query/${process.env.MONGODB_COLLECTION}/${node}:executed`);
      setInfo(data);
    } catch {
      message.error(`Error retrieving event logs for ${node}`);
    }
  };

  useEffect(() => {
    queryEventLog();
  }, []);

  return (
    <BaseComponent
      name="Mission Events Display"
      height={height}
      toolsSlot={(
        <>
          <Select
            defaultValue={node}
            style={{ width: 120 }}
            onChange={(val) => setNode(val)}
          >
            {
              nodes.map((el) => (
                <Select.Option
                  key={el}
                >
                  {el}
                </Select.Option>
              ))
            }
          </Select>
        </>
      )}
    >
      <table className="flex">
        <tbody>
          <tr>
            <th>UTC</th>
            <th>Event Name</th>
            <th>Status</th>
            <th>Event Output</th>
          </tr>
          {/* <Col span={4}>Orbital Events</Col>
          <Col span={5}>Ground Station</Col>
          <Col span={5}>UTC</Col>
          <Col span={5}>Scheduled Events</Col>
          <Col span={5}>Executed Events</Col> */}
          <hr />
          <tr>
            <MED
              info={info}
            />
          </tr>
        </tbody>
      </table>
    </BaseComponent>
  );
}

MissionEventsDisplay.propTypes = {
  /** Name of the component to display at the time */
  nodes: PropTypes.array.string.isRequired,
  height: PropTypes.number.isRequired,
};

export default MissionEventsDisplay;
