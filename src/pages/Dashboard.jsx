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
// eslint-disable-next-line
import routes from '../routes';

import AsyncComponent from '../components/Dashboard/AsyncComponent';
import LayoutSelector from '../components/Dashboard/LayoutSelector';

const ResponsiveGridLayout = WidthProvider(Responsive);

function Dashboard({
  id,
  defaultLayout,
  path,
}) {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  const [defaultPageLayout, setDefaultPageLayout] = useState({
    lg: [],
  });

  const [layouts, setLayouts] = useState({
    lg: [],
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

  /** Retrieve default layout for page */
  useEffect(() => {
    // By default, set the defaultLayout prop as a fallback if child doesn't have a layout set
    let layout = defaultLayout;

    // Find child route of dashboard and retrieve default layout
    routes.forEach((route) => {
      if (route.path === path && route.children) {
        route.children.forEach((child) => {
          if (child.path.split('/')[1] === id && child.defaultLayout) {
            layout = child.defaultLayout;
            setDefaultPageLayout(child.defaultLayout);
          }
        });
      }
    });

    // Set timeout to let the grid initialize; won't work otherwise.
    setTimeout(() => {
      setLayouts(layout);
    }, 100);
  }, [id, path]);

  /** Set the layout based on using the LayoutSelector function */
  const selectLayout = (layout) => {
    if (layout === 'defaultRouteLayout') {
      setLayouts(defaultLayout);
    } else if (layout === 'defaultPageLayout') {
      setLayouts(defaultPageLayout);
    } else {
      setLayouts(layout);
    }

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
              ? layouts.lg
                .filter(layout => layout && layout.i && layout.component && layout.component.name)
                .map(layout => (
                  <div key={layout.i} className="shadow overflow-y-auto" style={{ backgroundColor: '#fbfbfb' }}>
                    <AsyncComponent
                      component={layout.component.name}
                      props={layout.component.props}
                    />
                  </div>
                )) : null
          }
        </ResponsiveGridLayout>
      </div>
    </Context.Provider>
  );
}

Dashboard.propTypes = {
  id: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  defaultLayout: PropTypes.shape({}).isRequired,
};

export default Dashboard;
