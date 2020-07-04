import React from 'react';
import { Calendar } from 'react-big-calendar';
import dayjs from 'dayjs';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// const localizer = momentLocalizer(moment);

function MyScheduler() {
  const state = {
    events: [
      {
        start: dayjs().toDate(),
        end: dayjs()
          .add(1, 'days')
          .toDate(),
        title: 'Some title',
      },
    ],
  };

  return (
    <div className="App">
      <Calendar
        defaultDate={new Date()}
        defaultView="month"
        selectable
        events={state.events}
        style={{ height: '100vh' }}
      />
    </div>
  );
}

export default MyScheduler;
