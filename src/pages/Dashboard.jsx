import React, {
  useState, useEffect, useReducer, useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  Button, message, Typography, PageHeader, Drawer, Form, Input, Modal, Tabs,
} from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  CloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import _ from 'lodash';
import {
  Context, actions, reducer,
} from '../store/neutron1';

import { socket } from '../socket';
// eslint-disable-next-line
import routes from '../routes';
import project from '../../package.json';

import AsyncComponent from '../components/AsyncComponent';
import LayoutSelector from '../components/LayoutSelector';


const ResponsiveGridLayout = WidthProvider(Responsive);

const { TabPane } = Tabs;

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

  /** Control the visibility of the layout editor on dashboard */
  const [visible, setVisible] = useState(false);

  /** State for editing JSON of the layout */
  const [jsonEdit, setJsonEdit] = useState({});

  /** Control visibility of the save layout form */
  const [formVisible, setFormVisible] = useState(false);

  const [socketStatus, setSocketStatus] = useState('error');

  const componentRefs = useRef([]);

  /** Form for saving layout */
  const [formSave] = Form.useForm();

  const [formError, setFormError] = useState('');

  const [updateLayoutSelector, setUpdateLayoutSelector] = useState(false);
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

  /** Save layout */
  const saveLayout = (dashname) => {
    const route = path.split('/')[1];
    // Store the layout into localStorage
    try {
      try {
        setUpdateLayoutSelector(true);
        // Check if the route already has an object to store the saved layout
        if (!(typeof JSON.parse(localStorage.getItem(route)) === 'object')
          && JSON.parse(localStorage.getItem(route) !== null)
        ) {
          throw new Error(`${route} is not an array.`);
        }
      } catch (error) {
        // If not, set it to an empty object
        localStorage.setItem(route, JSON.stringify({}));
      }

      // Store the layout based on the name given
      localStorage.setItem(route, JSON.stringify({
        ...JSON.parse(localStorage.getItem(route)),
        [dashname]: layouts,
      }));

      setUpdateLayoutSelector(false);
      message.success('Layout saved successfully.', 10);
    } catch {
      message.error('Error saving layout.', 10);
    }
  };

  /**
   * Checks to see if the layout array's objects contain all of the correct keys
   */
  const processLayoutObject = () => {
    try {
      const json = JSON.parse(jsonEdit);

      // Check if pass in an array of objects
      if (!json.length) {
        throw new Error('Outer container must be an array.');
      }

      // Validate the required fields
      json.forEach((component, i) => {
        if (!component
          || !('i' in component)
          || !('x' in component)
          || !('y' in component)
          || !('w' in component)
          || !('h' in component)
          || !('component' in component)
          || !('name' in component.component)
        ) {
          throw new Error(`Object number ${i} object must contain a key (i), width (x), height (y) and component (component.name)`);
        }
      });

      // If all valid, set the layout object
      setLayouts({
        lg: json,
      });

      message.success('Successfully updated layout.');

      // Reset form error message
      setFormError('');
    } catch (error) {
      setFormError(error.message);
    }
  };

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

  const deleteComponent = (e) => {
    const key = e.currentTarget.getAttribute('layoutkey');
    console.log(_.reject(layouts.lg, { i: key }), layouts, key);
    setLayouts({
      lg: _.reject(layouts.lg, { i: key }),
    });
  };

  useEffect(() => {
    setJsonEdit(JSON.stringify(layouts.lg));
  }, [layouts]);

  return (
    <div className="mt-5 mx-16 mb-16">
      <PageHeader
        className="component-color sticky z-10"
        style={{
          border: '1px solid rgb(235, 237, 240)',
          top: 1,
        }}
        title={`Web ${project.version}`}
        subTitle={(
          <Typography.Text type="secondary">
            {
              socketStatus === 'success'
                ? (
                  <span>
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                    &nbsp;Socket is connected and operational.
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
        )}
        extra={[
          <div className="float-left relative">
            <Button
              className="mr-3"
              type="primary"
              onClick={() => setFormVisible(true)}
            >
              Save Layout
            </Button>
            <Modal
              visible={formVisible}
              title="Save Current Layout"
              onCancel={() => setFormVisible(false)}
              okText="Save"
              cancelText="Cancel"
              onOk={() => {
                formSave.validateFields()
                  .then((values) => {
                    saveLayout(values.dashname);
                    setFormVisible(false);
                    formSave.resetFields();
                  });
              }}
            >
              <Form
                layout="vertical"
                form={formSave}
              >
                <Form.Item
                  name="dashname"
                  required
                  label="Dashboard Name"
                  rules={[{ required: true, message: 'Please enter a name for the layout.' }]}
                >
                  <Input
                    placeholder="Dashboard Name"
                  />
                </Form.Item>
              </Form>
            </Modal>
          </div>,
          <LayoutSelector
            className="absolute"
            path={path}
            updateLayout={updateLayoutSelector}
            selectLayout={(value) => selectLayout(value)}
          />,
        ]}
      />
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
                .filter((layout) => layout && layout.i && layout.component && layout.component.name)
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
                    <Button
                      style={{ display: (visible) ? 'block' : 'none' }}
                      className="absolute bottom-0 left-0 z-50 mb-1 ml-1"
                      shape="circle"
                      layoutkey={layout.i}
                      icon={<CloseOutlined />}
                      onClick={(e) => deleteComponent(e)}
                    />
                  </div>
                )) : null
          }
        </ResponsiveGridLayout>
        <Drawer
          placement="bottom"
          onClose={() => setVisible(false)}
          visible={visible}
          key="bottom"
          mask={false}
          height={400}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Add Components" key="1">
              Content
            </TabPane>
            <TabPane tab="JSON Editor" key="2">
              <Button
                onClick={() => processLayoutObject()}
              >
                Update Layout
              </Button>
              <span className="text-red-500 ml-3 mb-3">
                {formError}
              </span>
              <pre
                className="language-json mb-2 h-64 overflow-y-scroll overflow-x-scroll resize-y cursor-text text-white"
              >
                <Editor
                  className="font-mono"
                  value={jsonEdit}
                  onValueChange={(value) => setJsonEdit(value)}
                  highlight={(code) => highlight(code, languages.json)}
                  padding={10}
                />
              </pre>
            </TabPane>
          </Tabs>
        </Drawer>
      </Context.Provider>
      <Button
        className="fixed right-0 bottom-0 mb-5 mr-5"
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => setVisible(true)}
        shape="circle"
        size="large"
      />
    </div>
  );
}

Dashboard.propTypes = {
  id: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  defaultLayout: PropTypes.shape({}).isRequired,
};

export default Dashboard;
