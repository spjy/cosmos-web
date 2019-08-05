import React, { useState, useEffect, useReducer } from 'react';
import moment from 'moment-timezone';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  Context, actions, reducer,
} from '../../store/neutron1';

import socket from '../../socket';

import Clock from '../../components/Missions/Components/Clock';
import DisplayValue from '../../components/Missions/Components/DisplayValue';
import Content from '../../components/Missions/Components/Content';
import Commands from '../../components/Missions/Components/Commands';
import Status from '../../components/Missions/Components/Status';
import Chart from '../../components/Missions/Components/Chart';
import Globe from '../../components/Missions/Components/Globe';
import Attitude from '../../components/Missions/Components/Attitude';
import SetValues from '../../components/Missions/Components/SetValues';

const ResponsiveGridLayout = WidthProvider(Responsive);

function Neutron1() {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  const [layouts] = useState({
    lg: [
      {
        i: 'a',
        x: 0,
        y: 0,
        w: 4,
        h: 7,
      },
      {
        i: 'b',
        x: 4,
        y: 0,
        w: 4,
        h: 7,
      },
      {
        i: 'c',
        x: 8,
        y: 0,
        w: 4,
        h: 7,
      },
      {
        i: 'd',
        x: 0,
        y: 1,
        w: 12,
        h: 9,
      },
      {
        i: 'e',
        x: 0,
        y: 2,
        w: 12,
        h: 38,
      },
      {
        i: 'f',
        x: 0,
        y: 3,
        w: 12,
        h: 18,
      },
      {
        i: 'g',
        x: 0,
        y: 4,
        w: 12,
        h: 18,
      },
      {
        i: 'h',
        x: 0,
        y: 5,
        w: 12,
        h: 18,
      },
      {
        i: 'i',
        x: 0,
        y: 6,
        w: 12,
        h: 18,
      },
      {
        i: 'j',
        x: 6,
        y: 2,
        w: 6,
        h: 34,
      },
    ],
  });

  useEffect(() => {
    const all = socket('live', '/live/all');

    /** Get latest data from neutron1_exec */
    all.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);

        dispatch(actions.get(json.node_type, json));
      } catch (err) {
        // console.log(err);
      }
    };

    return () => {
      all.close(1000);
    };
  }, []);

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="m-3 mb-32">
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{
            lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0,
          }}
          cols={{
            lg: 12, md: 10, sm: 6, xs: 4, xxs: 2,
          }}
          layouts={layouts}
          margin={[12, 12]}
          draggableHandle=".dragHandle"
          draggableCancel=".preventDragHandle"
          rowHeight={20}
        >
          <div key="a" className="shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Content
              name="Agent Statuses"
            >
              <Status
                statuses={[]}
              />
            </Content>
          </div>
          <div key="b" className="shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <DisplayValue
              name="Ground Station Values"
              displayValues={
                [
                  {
                    name: 'Doppler Shift',
                    nodeProcess: 'masdir:groundstation',
                    dataKey: '',
                    unit: 'Hz',
                    processDataKey: x => x.toFixed(2),
                  },
                ]
              }
              subheader="06231999-1630Z"
            />
          </div>
          <div key="c" className="shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Clock />
          </div>
          <div key="d" className="shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <SetValues
              name="Set Parameters"
            />
          </div>
          <div key="e" className="shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
            <Globe
              name="Orbit"
              nodeProc="beagle1:adcs"
              orbits={[
                {
                  name: 'neutron1',
                  modelFileName: 'cubesat1.glb',
                  nodeProcess: 'cubesat1:propagator_simple',
                  live: true,
                  position: [21.289373, 157.917480, 350000.0],
                  orientation: {
                    d: {
                      x: 0,
                      y: 0,
                      z: 0,
                    },
                    w: 0,
                  },
                },
              ]}
            />
          </div>
        </ResponsiveGridLayout>
      </div>
    </Context.Provider>
  );
}

export default Neutron1;
