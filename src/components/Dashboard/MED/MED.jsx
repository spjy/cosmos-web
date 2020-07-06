import React from 'react';
import PropTypes from 'prop-types';

import {
  Row, Col,
} from 'antd';

// import dayjs from 'dayjs';

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
      {
        info.forEach((event) => (
          <Row>
            <Col>
              {event.event_utc}
            </Col>
            <Col>
              {event.event_name}
            </Col>
            <Col>
              {event.event_utcexec != null ? 'Done.' : 'Pending...'}
            </Col>
            <Col>
              {event}
            </Col>
          </Row>
        ))
      }
    </>
  );
}

MED.propTypes = {
  /** Name of the component to display at the time */
  info: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default MED;
