import React, { useState, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { message } from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  Context, actions, reducer,
} from '../store/neutron1';

import socket from '../socket';

import AsyncComponent from '../components/Missions/Components/AsyncComponent';
import LayoutSelector from '../components/Missions/Components/LayoutSelector';

const ResponsiveGridLayout = WidthProvider(Responsive);

function Dashboard({
  defaultLayout,
  path,
}) {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  const [layouts, setLayouts] = useState(defaultLayout);

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

  const selectLayout = (layout) => {
    setLayouts(layout);
    message.success('Successfully changed layout.');
  };

  return (
    <Context.Provider value={{ state, dispatch }}>
      <div className="m-3 mb-32">
        <div className="mx-3">
          <LayoutSelector
            path={path}
            selectLayout={value => selectLayout(value)}
          />
        </div>
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{
            lg: 996,
          }}
          cols={{
            lg: 12,
          }}
          layouts={layouts}
          margin={[12, 12]}
          draggableHandle=".dragHandle"
          draggableCancel=".preventDragHandle"
          rowHeight={20}
        >
          {
            layouts !== null
              && layouts.lg !== null
              ? layouts.lg.map((layout) => {
                if (layout && layout.i && layout.component && layout.component.name) {
                  return (
                    <div key={layout.i} className="shadow overflow-x-auto" style={{ backgroundColor: '#fbfbfb' }}>
                      <AsyncComponent
                        component={layout.component.name}
                        props={layout.component.props}
                      />
                    </div>
                  );
                }
              }) : null
          }
        </ResponsiveGridLayout>
      </div>
    </Context.Provider>
  );
}

Dashboard.propTypes = {
  path: PropTypes.string.isRequired,
  defaultLayout: PropTypes.shape({}).isRequired,
};

export default Dashboard;
