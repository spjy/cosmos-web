import React, { useState, useRef, useEffect } from 'react';
import Timeline from 'react-calendar-timeline';
import moment from 'moment-timezone';

import Content from './Content';

import 'react-calendar-timeline/lib/Timeline.css';

const groups = [
  {
    id: 'Celestial Events', title: 'Celestial Events', stackItems: true,
  },
  {
    id: 'Mission Plan', title: 'Mission Plan', stackItems: true,
  },
];

function Events() {
  const [events, setEvents] = useState([
    {
      id: 1,
      group: 'Celestial Events',
      title: 'Sunrise',
      start_time: moment('2019-10-31 06:45'),
      end_time: moment('2019-10-31 07:40'),
      canMove: false,
      canResize: true,
    },
    {
      id: 2,
      group: 'Celestial Events',
      title: 'Sunset',
      start_time: moment().add(-0.5, 'hour'),
      end_time: moment().add(0.5, 'hour'),
      canMove: false,
      canResize: true,
    },
    {
      id: 3,
      group: 'Mission Plan',
      title: 'Soak',
      start_time: moment().add(2, 'hour'),
      end_time: moment().add(3, 'hour'),
      canMove: false,
      canResize: true,
    },
    {
      id: 4,
      group: 1,
      title: 'item 33',
      start_time: moment().add(2.5, 'hour'),
      end_time: moment().add(3, 'hour'),
      canMove: false,
      canResize: true,
    },
  ]);

  return (
    <Content
      name="Timeline"
    >
      <Timeline
        className="h-full"
        groups={groups}
        items={events}
        defaultTimeStart={moment().add(-12, 'hour')}
        defaultTimeEnd={moment().add(12, 'hour')}
      />
    </Content>
  );
}

export default Events;
