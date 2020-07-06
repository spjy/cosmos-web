import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  Select, Row, Col,
} from 'antd';

import satellites from '../../routes/satellite';

import BaseComponent from '../BaseComponent';
import MED from './MED/MED';

/**
 * Displays a specified live value from an agent.
 * Updates values every agent heartbeat.
 */
function MissionEventsDisplay({
  name,
  height,
}) {
  const [node, setNode] = useState(name);

  const [satelliteList] = useState([name]);

  const [init, setInit] = useState(true);

  // Change here to retrieve events
  const info = useSelector((s) => s.event);

  useEffect(() => {
    if (init) {
      satellites.children.forEach((child) => satelliteList.push(child.name));
      setInit(false);
    }
  }, [init, satelliteList]);

  return (
    <BaseComponent
      name="Mission Events Display"
      height={height}
      toolsSlot={(
        <>
          <Select
            defaultValue={node}
            style={{ width: 120 }}
            onSelect={(val) => setNode(val)}
          >
            {
              satelliteList.map((satellite) => (
                <Select.Option
                  key={satellite}
                >
                  {satellite}
                </Select.Option>
              ))
            }
          </Select>
        </>
      )}
    >
      <Row>
        <Col span={6}>UTC</Col>
        <Col span={6}>Event Name</Col>
        <Col span={6}>Status</Col>
        <Col span={6}>Event Output</Col>
        {/* <Col span={4}>Orbital Events</Col>
        <Col span={5}>Ground Station</Col>
        <Col span={5}>UTC</Col>
        <Col span={5}>Scheduled Events</Col>
        <Col span={5}>Executed Events</Col> */}
      </Row>
      <hr />
      <MED
        info={info}
      />
    </BaseComponent>
  );
}

MissionEventsDisplay.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  height: PropTypes.number.isRequired,
};

MissionEventsDisplay.defaultProps = {
  name: 'All',
};

export default MissionEventsDisplay;
