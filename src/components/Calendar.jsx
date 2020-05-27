import React, { Component } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default class MyScheduler extends Component {
  state = {
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

  render() {
    return (
      <div className="App">
        <Calendar
          localizer={localizer}
          defaultDate={new Date()}
          defaultView="month"
          selectable
          events={this.state.events}
          style={{ height: '100vh' }}
        />
      </div>
    );
  }
}
