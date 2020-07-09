import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  Select, message,
} from 'antd';

import dayjs from 'dayjs';
import BaseComponent from '../BaseComponent';
import MED from './MED/MED';
import { axios } from '../../api';
import { dateToMJD } from '../../utility/time';

function MissionEventsDisplay({
  nodes,
  height,
}) {
  const live = useSelector((s) => s.data);

  const [node, setNode] = useState(nodes[0]);
  const [info, setInfo] = useState([]);

  const queryEventLog = async (dates) => {
    try {
      const from = dateToMJD(dates[0]);
      const to = dateToMJD(dates[1]);

      const { data } = await axios.post(`/query/${process.env.MONGODB_COLLECTION}/${node}:executed`, {
        multiple: true,
        query: {
          // event_utc: {
          //   $gt: from,
          //   $lt: to,
          // },
        },
      });
      setInfo(data);
    } catch {
      message.error(`Error retrieving event logs for ${node}`);
    }
  };

  useEffect(() => {
    const dates = [dayjs().startOf('day'), dayjs().endOf('day')];
    queryEventLog(dates);
  }, []);

  useEffect(() => {
    if (Object.keys(live).length !== 0) {
      const executed = Object.keys(live).find((item) => item.split(':')[1] === 'executed');
      if (live[executed] != null) {
        const idx = info.findIndex((event) => event.event_name === live[executed].event_name);
        info[idx] = live[executed];
      }
    }
  }, [live]);

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
      <table className="flex w-full">
        <tbody className="w-full">
          <tr className="flex w-full">
            <td className="w-1/4">UTC</td>
            <td className="w-1/4">Event Name</td>
            <td className="w-1/4">Status</td>
            <td className="w-1/4">Event Output</td>
          </tr>
          {/* <Col span={4}>Orbital Events</Col>
          <Col span={5}>Ground Station</Col>
          <Col span={5}>UTC</Col>
          <Col span={5}>Scheduled Events</Col>
          <Col span={5}>Executed Events</Col> */}
          <hr />
          <MED
            className="w-full"
            info={info}
          />
        </tbody>
      </table>
    </BaseComponent>
  );
}

MissionEventsDisplay.propTypes = {
  /** Name of the component to display at the time */
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  height: PropTypes.number.isRequired,
};

export default MissionEventsDisplay;
