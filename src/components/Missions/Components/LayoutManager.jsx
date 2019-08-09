import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Input } from 'antd';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';

import Attitude from './Attitude';
import Clock from './Clock';
import Chart from './Chart';
import Commands from './Commands';
import Content from './Content';
import DisplayValue from './DisplayValue';
import Globe from './Globe';
import SetValues from './SetValues';
import Status from './Status';

const { TextArea } = Input;
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

      if (!json.length) {
        throw new Error('Outer container must be an array.');
      }

      json.forEach((component, i) => {
        if (!component
          || !component.i
          || !component.x
          || !component.y
          || !component.w
          || !component.h
          || !component.component
          || !component.component.name
        ) {
          throw new Error(`Object number ${i} object must contain a key (i), width (x), height (y) and component (component.name)`);
        }
      });

      setLayoutObject({
        lg: json,
      });

      setFormError('');
    } catch (error) {
      console.log(error);
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
        style={{ padding: '2em' }}
      >
        <Editor
          className="bg-gray-300 mb-3"
          value={layoutObjectForm}
          onValueChange={value => setLayoutObjectForm(value)}
          highlight={code => highlight(code, languages.js)}
          padding={10}
        />
        {/* <TextArea
          className="mb-3"
          rows={4}
          placeholder="Layout Array"
          onChange={({ target: { value } }) => setLayoutObjectForm(value)}
        /> */}

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
            layouts={layoutObject ? layoutObject : []}
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
