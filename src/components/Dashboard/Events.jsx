// import React, { useState, useRef, useEffect } from 'react';
// import Timeline, {
//   TodayMarker,
// } from 'react-calendar-timeline';
// import moment from 'moment-timezone';

// import Content from './Content';

// import 'react-calendar-timeline/lib/Timeline.css';

// function Events() {
// const [groups, setGroups] = useState([
//   {
//     id: 'Celestial Events', title: 'Celestial Events', stackItems: true,
//   },
//   {
//     id: 'Mission Plan', title: 'Mission Plan', stackItems: true,
//   },
// ]);

// const [items, setItems] = useState([
//   {
//     id: 1,
//     group: 'Celestial Events',
//     title: 'Umbra Time',
//     start_time: moment().add(2, 'hour'),
//     end_time: moment().add(3, 'hour'),
//     canMove: true,
//     canResize: true,
//   },
//   {
//     id: 2,
//     group: 'Celestial Events',
//     title: 'Sunset',
//     start_time: moment().add(2, 'hour'),
//     end_time: moment().add(4, 'hour'),
//     canMove: true,
//     canResize: true,
//   },
//   // {
//   //   id: 3,
//   //   group: 'Mission Plan',
//   //   title: 'Soak',
//   //   start_time: moment().add(2, 'hour'),
//   //   end_time: moment().add(3, 'hour'),
//   //   canMove: false,
//   //   canResize: true,
//   // },
//   {
//     id: 4,
//     group: 1,
//     title: 'item 33',
//     start_time: moment().add(2.5, 'hour'),
//     end_time: moment().add(3, 'hour'),
//     canMove: true,
//     canResize: true,
//   },
// ]);

//   const handleItemMove = (itemId, dragTime, newGroupOrder) => {
//     const group = groups[newGroupOrder];

//     const movedItems = items.map(item => (item.id === itemId
//       ? Object.assign({}, item, {
//         start: dragTime,
//         end: dragTime + (item.end - item.start),
//         group: group.id,
//       }) : item));

//     setItems(movedItems);

//     console.log('Moved', itemId, dragTime, newGroupOrder);
//   };

//   const handleItemResize = (itemId, time, edge) => {
//     const resizedItems = items.map(item => (item.id === itemId
//       ? Object.assign({}, item, {
//         start: edge === 'left' ? time : item.start,
//         end: edge === 'left' ? item.end : time,
//       })
//       : item));

//     setItems(resizedItems);

//     console.log('Resized', itemId, time, edge);
//   };

//   return (
//     <Content
//       name="Timeline"
//     >
//       <Timeline
//         className="h-full"
//         groups={groups}
//         items={items}
//         canMove
//         canResize="both"
//         defaultTimeStart={moment().add(-12, 'hour')}
//         defaultTimeEnd={moment().add(12, 'hour')}
//         onItemMove={handleItemMove}
//         onItemResize={handleItemResize}
//       >
//         <TodayMarker interval={1000} />
//       </Timeline>
//     </Content>
//   );
// }

// export default Events;

import React, { Component } from 'react';
// import moment from 'moment';

import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import { message } from 'antd';

const keys = {
  groupIdKey: 'id',
  groupTitleKey: 'title',
  groupRightTitleKey: 'rightTitle',
  itemIdKey: 'id',
  itemTitleKey: 'title',
  itemDivTitleKey: 'title',
  itemGroupKey: 'group',
  itemTimeStartKey: 'start',
  itemTimeEndKey: 'end',
  groupLabelKey: 'title',
};

export default class App extends Component {
  // constructor(props) {
  //   super(props);

  //   const defaultTimeStart = moment()
  //     .startOf('day')
  //     .toDate();
  //   const defaultTimeEnd = moment()
  //     .startOf('day')
  //     .add(1, 'day')
  //     .toDate();

  //   this.state = {
  //     groups: [
  //       {
  //         id: 1, title: 'Celestial Events', stackItems: true,
  //       },
  //       {
  //         id: 'Mission Plan', title: 'Mission Plan', stackItems: true,
  //       },
  //     ],
  //     items: [
  //       {
  //         id: 1,
  //         group: 1,
  //         title: 'Umbra Time',
  //         start_time: moment().add(2, 'hour'),
  //         end_time: moment().add(3, 'hour'),
  //         canMove: true,
  //         canResize: true,
  //       },
  //       {
  //         id: 2,
  //         group: 'Celestial Events',
  //         title: 'Sunset',
  //         start_time: moment().add(2, 'hour'),
  //         end_time: moment().add(4, 'hour'),
  //         canMove: true,
  //         canResize: true,
  //       },
  //       // {
  //       //   id: 3,
  //       //   group: 'Mission Plan',
  //       //   title: 'Soak',
  //       //   start_time: moment().add(2, 'hour'),
  //       //   end_time: moment().add(3, 'hour'),
  //       //   canMove: false,
  //       //   canResize: true,
  //       // },
  //       {
  //         id: 4,
  //         group: 1,
  //         title: 'item 33',
  //         start_time: moment().add(2.5, 'hour'),
  //         end_time: moment().add(3, 'hour'),
  //         canMove: true,
  //         canResize: true,
  //       },
  //     ],
  //     defaultTimeStart,
  //     defaultTimeEnd,
  //   };
  // }

  handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const { items, groups } = this.state;

    const group = groups[newGroupOrder];

    this.setState({
      items: items.map((item) => (item.id === itemId
        ? ({
          ...item,
          start: dragTime,
          end: dragTime + (item.end - item.start),
          group: group.id,
        })
        : item)),
    });

    message.error('Moved', itemId, dragTime, newGroupOrder);
  };

  handleItemResize = (itemId, time, edge) => {
    const { items } = this.state;

    this.setState({
      items: items.map((item) => (item.id === itemId
        ? ({
          ...item,
          start: edge === 'left' ? time : item.start,
          end: edge === 'left' ? item.end : time,
        })
        : item)),
    });

    message.error('Resized', itemId, time, edge);
  };

  render() {
    const {
      groups, items, defaultTimeStart, defaultTimeEnd,
    } = this.state;

    return (
      <Timeline
        groups={groups}
        items={items}
        keys={keys}
        fullUpdate
        itemTouchSendsClick={false}
        stackItems
        itemHeightRatio={0.75}
        canMove
        canResize="both"
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        onItemMove={this.handleItemMove}
        onItemResize={this.handleItemResize}
      />
    );
  }
}
