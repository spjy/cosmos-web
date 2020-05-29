import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function MyScheduler() {
  const state = {
    events: [
      {
        start: moment().toDate(),
        end: moment()
          .add(1, 'days')
          .toDate(),
        title: 'Some title',
      },
    ],
  };

  return (
    <div className="App">
      <Calendar
        localizer={localizer}
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
