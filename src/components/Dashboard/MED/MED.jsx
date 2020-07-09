import React from 'react';
import PropTypes from 'prop-types';

import {
  Row, Col,
} from 'antd';

import { mjdToString } from '../../../utility/time';

/**
 * Displays a specified live value from an agent.
 * Updates values every agent heartbeat.
 */
function MED({
  info,
}) {
  // const [selectedNode, setSelectedNode] = useState(node);

  // const [timeline] = useState([]);

  // const [init, setInit] = useState(true);
  // useEffect(() => {
  //   setSelectedNode(node);
  // }, [node]);

  // useEffect(() => {
  //   if (init) {
  //     const currDate = dayjs().subtract(1, 'day');
  //     const endDate = dayjs().add(1, 'day');
  //     for (; currDate < endDate; currDate.add(1, 'second')) {
  //       timeline.push(new Date(currDate));
  //     }
  //     setInit(false);
  //   }
  // });

  return (
    // <Row>
    //   <Col span={4}>Orbital Events</Col>
    //   <Col span={5}>Ground Station</Col>
    //   <Col span={5}>
    //     {
    //       timeline.forEach((date) => <Row>{date}</Row>)
    //     }
    //   </Col>
    //   <Col span={5}>Scheduled Events</Col>
    //   <Col span={5}>Executed Events</Col>
    //   {selectedNode}
    // </Row>
    <>
      { info != null && info.length !== 0
        ? info.map((event) => (
          <tr className="w-full" key={event.event_name + event.event_utc}>
            <td className="w-1/4">
              {mjdToString(event.event_utc)}
            </td>
            <td className="w-1/4">
              {event.event_name}
            </td>
            <td className="w-1/4">
              {event.event_utcexec != null ? 'Done.' : 'Pending...'}
            </td>
            <td className="w-1/4">
              Empty
            </td>
          </tr>
        ))
        : null }
    </>
  );
}

MED.propTypes = {
  /** Name of the component to display at the time */
  info: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default MED;
