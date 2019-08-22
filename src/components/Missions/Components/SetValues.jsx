import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, Button, Select, message,
} from 'antd';

import BaseComponent from '../BaseComponent';
import socket from '../../../socket';

const ws = socket('query', '/command/');

/**
 * A general purpose component.
 */
function SetValues({
  name,
  subheader,
  liveOnly,
  showStatus,
  status,
  formItems,
  values,
}) {
  /** Form storage */
  const [form, setForm] = useState({
    'Transmit Application': {},
  });
  /** Status of the live switch */
  const [, setLiveSwitch] = useState();

  const [commandHistory, setCommandHistory] = useState([
    '➜ agent',
  ]);

  const [selectedComponent, setSelectedComponent] = useState(Object.keys(values)[0]);

  const [selectedProperty, setSelectedProperty] = useState(values[Object.keys(values)[0]][0]);

  const setParameter = () => {
    try {
      if (!selectedComponent) {
        message.error('A component is required.');
      }

      if (!selectedProperty) {
        message.error('A property is required.');
      }

      if (!form.value) {
        message.error('A value is required.');
      }

      ws.send(`agent masdr configure_component PropCubeWaveform ${selectedComponent} ${selectedProperty} ${form.value}`);

      setForm({
        ...form,
        success: true,
      });

      message.success('Successfully sent value!');
    } catch (error) {
      setForm({
        ...form,
        success: false,
      });
      message.error(error.message);
    }
  };

  ws.onmessage = ({ data }) => {
    setCommandHistory([
      ...commandHistory,
      data,
    ]);
  };

  return (
    <BaseComponent
      name={name}
      subheader={subheader}
      liveOnly={liveOnly}
      showStatus={showStatus}
      status={status}
      formItems={formItems}
      handleLiveSwitchChange={checked => setLiveSwitch(checked)}
    >
      <div className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-scroll">
        {
          // eslint-disable-next-line
          commandHistory.map((command, i) => (<div key={i}>{ command }</div>))
        }
      </div>
      <Form layout="vertical">
        <div className="flex w-full flex-wrap">
          <div className="flex-initial flex-grow p-1">
            <Form.Item
              hasFeedback={form.value}
              validateStatus={form.value && form.success ? 'success' : ''}
              className="-mb-1"
            >
              <Input
                addonBefore={(
                  <Input.Group compact>
                    <Select
                      defaultValue={selectedComponent}
                      dropdownMatchSelectWidth={false}
                      onChange={(value) => {
                        setSelectedComponent(value);
                        setSelectedProperty(values[value][0]);
                      }}
                    >
                      {
                        Object.keys(values).map(value => (
                          <Select.Option
                            key={value}
                            value={value}
                          >
                            {value}
                          </Select.Option>
                        ))
                      }
                    </Select>
                    &nbsp;&nbsp;&nbsp;
                    <Select
                      value={selectedProperty}
                      dropdownMatchSelectWidth={false}
                      onChange={value => setSelectedProperty(value)}
                    >
                      {
                        values[selectedComponent].map(property => (
                          <Select.Option
                            key={property}
                            value={property}
                          >
                            {property}
                          </Select.Option>
                        ))
                      }
                    </Select>
                  </Input.Group>
                )}
                placeholder="Value"
                id="value"
                onChange={({ target: { id: item, value } }) => setForm({
                  ...form,
                  [item]: value,
                  success: false,
                })}
                value={form.value}
              />
            </Form.Item>
          </div>

          <div className="p-1">
            <Button
              type="danger"
              onClick={() => setParameter()}
            >
              Set Value
            </Button>
          </div>
        </div>
      </Form>
    </BaseComponent>
  );
}

SetValues.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** Whether the component can display only live data. Hides/shows the live/past switch. */
  liveOnly: PropTypes.bool,
  /** Function is run when the live/past switch is toggled. */
  // handleLiveSwitchChange: PropTypes.func,
  /** Whether to show a circular indicator of the status of the component */
  showStatus: PropTypes.bool,
  /** The type of badge to show if showStatus is true (see the ant design badges component) */
  status: ({ showStatus }, propName, componentName) => {
    if (showStatus) {
      return new Error(
        `${propName} is required when showStatus is true in ${componentName}.`,
      );
    }

    return null;
  },
  /** Form node */
  formItems: PropTypes.node,
  values: PropTypes.shape({}).isRequired,
};

SetValues.defaultProps = {
  name: '',
  subheader: null,
  showStatus: false,
  liveOnly: true,
  // handleLiveSwitchChange: () => {},
  status: 'error',
  formItems: null,
};

export default SetValues;
