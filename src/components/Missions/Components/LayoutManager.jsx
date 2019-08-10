import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Icon, Popover } from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';

import 'prismjs/components/prism-json';

import Attitude from './Attitude';
import Clock from './Clock';
import Chart from './Chart';
import Commands from './Commands';
import Content from './Content';
import DisplayValue from './DisplayValue';
import Globe from './Globe';
import SetValues from './SetValues';
import Status from './Status';

const ResponsiveGridLayout = WidthProvider(Responsive);

const components = {
  Attitude,
  Clock,
  Chart,
  Commands,
  Content,
  DisplayValue,
  Globe,
  SetValues,
  Status,
};

function AsyncComponent({ component, props }) {
  const Component = components[component];

  return <Component {...props} />;
}

AsyncComponent.propTypes = {
  component: PropTypes.string.isRequired,
  props: PropTypes.shape({}),
};

AsyncComponent.defaultProps = {
  props: {},
};

/**
 * Configurable editor that allows the user to set up the layout of the page
 */
function LayoutManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [layoutObject, setLayoutObject] = useState(null);
  const [layoutObjectForm, setLayoutObjectForm] = useState('');
  const [formError, setFormError] = useState('');

  const processLayoutObject = () => {
    try {
      const json = JSON.parse(layoutObjectForm);

      console.log(json);

      if (!json.length) {
        throw new Error('Outer container must be an array.');
      }

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

      setLayoutObject({
        lg: json,
      });

      setFormError('');
    } catch (error) {
      setFormError(error.message);
    }
  };

  return (
    <div>
      <Modal
        title="Manage Layout"
        width="100%"
        visible={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        style={{ padding: '2em', top: 20 }}
      >
        <pre
          className="language-json mb-2 h-64 overflow-y-scroll resize-y cursor-text text-white"
        >
          <Editor
            className="font-mono"
            value={layoutObjectForm}
            onValueChange={value => setLayoutObjectForm(value)}
            highlight={code => highlight(code, languages.json)}
            padding={10}
          />
        </pre>

        <div className="mb-2">
          Enter the layout array in JSON format.
          &nbsp;
          <Popover
            title="Information"
            placement="right"
            content={(
              <div className="text-gray-600">
                <p>
                  <span className="font-bold">
                    Sizing.&nbsp;
                  </span>
                  Each row has a length of twelve (12) on large screens
                  &nbsp;
                  (&gt;= 996 px) and a length of two (2) on small screens (&lt;= 996 px).
                </p>
                <p>
                  <span className="font-bold">
                    Formatting.&nbsp;
                  </span>
                  You must enter an array of objects. Each object contains a unique:
                </p>
                <ul className="list-disc list-inside ml-3">
                  <li>
                    Unique key (i)
                  </li>
                  <li>
                    Width (w)
                  </li>
                  <li>
                    Height (h)
                  </li>
                  <li>
                    Horiztonal position (w)
                  </li>
                  <li>
                    Vertical position (y)
                  </li>
                  <li>
                    Component name (component.name)
                  </li>
                  <li>
                    Component props (component.props)
                  </li>
                </ul>
                <p>
                  <strong>Example</strong>
                  .
                  &nbsp;
                  <br />
                  <pre
                    className="language-json"
                    dangerouslySetInnerHTML={{
                      __html: highlight(
                        '[\n  {\n    "i": "a",\n    "x": 0,\n    "y": 0,\n    "w": 4,\n    "h": 7,\n    "component": {\n      "name": "Status",\n      "props": {\n        "name": "Ok"\n      }\n    }\n  }\n]',
                        languages.json,
                        'json',
                      ),
                    }}
                  />
                </p>
              </div>
            )}
          >
            <Icon className="text-blue-500 cursor-pointer" type="question-circle" />
          </Popover>
        </div>

        <div className="text-red-500 mb-3">
          {formError}
        </div>

        <Button
          className="mr-2"
          onClick={() => processLayoutObject()}
        >
          Preview
        </Button>
        <Button
          type="primary"
          onClick={() => processLayoutObject()}
        >
          Save Layout
        </Button>
        <br />
        <br />
        <div>
          <ResponsiveGridLayout
            className="layout"
            breakpoints={{
              lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0,
            }}
            cols={{
              lg: 12, md: 12, sm: 2, xs: 2, xxs: 2,
            }}
            layouts={layoutObject ? layoutObject : {}}
            margin={[12, 12]}
            draggableHandle=".dragHandle"
            draggableCancel=".preventDragHandle"
            rowHeight={20}
          >
            {
              layoutObject !== null && layoutObject.lg !== null ? layoutObject.lg.map((layout) => {
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
      </Modal>
      <Button
        onClick={() => setModalOpen(true)}
      >
        Manage Layout
      </Button>
    </div>
  );
}

export default LayoutManager;
