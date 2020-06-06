import React, {
  useState, useEffect, useReducer, useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  message, Typography, DatePicker, Button,
} from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import moment from 'moment-timezone';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  Context, actions, reducer,
} from '../store/dashboard';

import { socket } from '../socket';
// eslint-disable-next-line
import routes from '../routes';
import project from '../../package.json';

import AsyncComponent from '../components/AsyncComponent';
import LayoutSelector from '../components/LayoutSelector';

const { RangePicker } = DatePicker;

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

  /** Store the default page layout in case user wants to switch to it */
  const [defaultPageLayout, setDefaultPageLayout] = useState({
    lg: [],
  });

  const [defaultPageLayoutSimple, setDefaultPageLayoutSimple] = useState({
    lg: [],
  });

  /** Currently selected layout in use */
  const [layouts, setLayouts] = useState({
    lg: [],
  });

  const [socketStatus, setSocketStatus] = useState('error');

  const componentRefs = useRef([]);

  /** Storage for form values */
  const [time, setTime] = useState('');
  /** Storage for form values */
  const [utcTime, setUtcTime] = useState('');
  /** Timezone */
  const [timezoneState] = useState('Pacific/Honolulu');

  const [globalHistoricalDate, setGlobalHistoricalDate] = useState(null);

  /** On mount, set the time and update each second */
  useEffect(() => {
    // Every second, update local and UTC time view
    const clock = setTimeout(() => {
      setTime(moment().tz(timezoneState).format('YYYY-MM-DDTHH:mm:ss'));
      setUtcTime(moment().tz('Europe/London').format('YYYY-MM-DDTHH:mm:ss'));
    }, 1000);

    // Stop timeout on unmount
    return () => {
      clearTimeout(clock);
    };
  }, [time, utcTime, timezoneState]);

  /** Get socket data from the agent */
  useEffect(() => {
    const live = socket('live', '/live/all');

    /** Get latest data from neutron1_exec */
    live.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);

        dispatch(actions.get(json.node_type, json));
      } catch (err) {
        // console.log(err);
      }
    };

    /** Update statuses on error/connection */
    live.onclose = () => {
      setSocketStatus('error');
    };

    live.onerror = () => {
      setSocketStatus('error');
    };

    live.onopen = () => {
      setSocketStatus('success');
    };

    return () => {
      live.close(1000);
    };
  }, []);

  /** Retrieve default layout for page */
  useEffect(() => {
    // By default, set the defaultLayout prop as a flive.ack if child doesn't have a layout set
    let layout = defaultLayout;

    // Find child route of dashboard and retrieve default layout
    routes.forEach((route) => {
      if (route.path === path && route.children) {
        route.children.forEach((child) => {
          // Get page layout from route config and save it into the state
          if (child.path.split('/')[1] === id && child.defaultLayout) {
            layout = child.defaultLayout;
            setDefaultPageLayout(child.defaultLayout);
          }

          // Get page layout simple from route config and save it into the state
          if (child.path.split('/')[1] === id && child.defaultLayoutSimple) {
            setDefaultPageLayoutSimple(child.defaultLayoutSimple);
          }
        });
      }
    });

    // Set timeout to let the grid initialize; won't work otherwise.
    setTimeout(() => {
      setLayouts(layout);
    }, 100);
  }, [defaultLayout, id, path]);

  /** Set the layout based on using the LayoutSelector function */
  const selectLayout = (layout) => {
    if (layout === 'defaultRouteLayout') {
      setLayouts(defaultLayout);
    } else if (layout === 'defaultPageLayout') {
      setLayouts(defaultPageLayout);
    } else if (layout === 'defaultPageLayoutSimple') {
      setLayouts(defaultPageLayoutSimple);
    } else {
      setLayouts(layout);
    }

    message.success('Successfully changed layout.');
  };

  return (
    <div>
      <div className="component-color sticky z-10 py-2 px-5 border-gray-200 border-solid border-b top-0">
        <div
          className="flex justify-between"
        >
          <div className="pt-2">
            <span className="text-2xl">
              Web&nbsp;
              {project.version}
            </span>
            &nbsp;&nbsp;
          </div>
          <div className="pt-4">
            <Typography.Text type="secondary">
              {
                socketStatus === 'success'
                  ? (
                    <span>
                      <CheckCircleTwoTone twoToneColor="#52c41a" />
                      &nbsp;Connected and operational.
                    </span>
                  )
                  : (
                    <span>
                      <CloseCircleTwoTone twoToneColor="#d80000" />
                      &nbsp;&nbsp;No connection available. Attempting to reconnect.
                    </span>
                  )
              }
            </Typography.Text>
          </div>
          <div>
            <table className="">
              <tbody>
                <tr>
                  <td className="pr-4 text-gray-500">
                    {timezoneState.split('/')[1]}
                  </td>
                  <td className="pr-2 text-gray-500 ">
                    UTC
                  </td>
                </tr>
                <tr>
                  <td className="pr-4">
                    {time}
                  </td>
                  <td className="pr-2">
                    {utcTime}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="pt-2">
            <LayoutSelector
              path={path}
              selectLayout={(value) => selectLayout(value)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-5">
        <RangePicker
          className="mr-3"
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          onChange={(m) => setGlobalHistoricalDate(m)}
          value={globalHistoricalDate}
        />
        <Button
          disabled={!globalHistoricalDate}
          onClick={() => dispatch(actions.get('globalHistoricalDate', globalHistoricalDate))}
        >
          Set Global Historical Date
        </Button>
      </div>
      <div className="mt-5 mx-16 mb-16">
        <Context.Provider value={{ state, dispatch }}>
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
                  .filter(
                    (layout) => layout && layout.i && layout.component && layout.component.name,
                  )
                  .map((layout, i) => (
                    <div
                      className="shadow overflow-y-scroll rounded component-color"
                      ref={(el) => {
                        componentRefs.current[i] = el;
                      }}
                      key={layout.i}
                    >
                      <AsyncComponent
                        component={layout.component.name}
                        props={layout.component.props}
                        height={
                          componentRefs && componentRefs.current[i]
                            ? componentRefs.current[i].clientHeight
                            : 100
                        }
                      />
                    </div>
                  )) : null
            }
          </ResponsiveGridLayout>
        </Context.Provider>
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  id: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  defaultLayout: PropTypes.shape({}).isRequired,
};

export default Dashboard;
