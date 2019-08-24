import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, Button, Select, message, Card,
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
  node,
  proc,
}) {
  /** Form storage */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [, setLiveSwitch] = useState();

  const [commandHistory, setCommandHistory] = useState([]);

  const [selectedComponent, setSelectedComponent] = useState(Object.keys(values)[0]);

  const [selectedProperty, setSelectedProperty] = useState(values[Object.keys(values)[0]][0]);

  const [liveValues, setLiveValues] = useState([]);

  const cliEl = useRef(null);

  ws.onmessage = ({ data }) => {
    setCommandHistory([
      ...commandHistory,
      data,
    ]);

    cliEl.current.scrollTop = cliEl.current.scrollHeight;
  };

  const setParameter = () => {
    try {
      if (!selectedComponent) {
        throw new Error('A component is required.');
      }

      if (!selectedProperty) {
        throw new Error('A property is required.');
      }

      if (!form.value || form.value === '') {
        throw new Error('A value is required.');
      }

      ws.send(`${node} ${proc} configure_component PropCubeWaveform ${selectedComponent} ${selectedProperty} ${form.value}`);

      setCommandHistory([
        ...commandHistory,
        `➜ agent ${node} ${proc} configure_component PropCubeWaveform ${selectedComponent} ${selectedProperty} ${form.value}`,
      ]);

      cliEl.current.scrollTop = cliEl.current.scrollHeight;

      setForm({
        ...form,
        value: '',
        success: true,
      });
    } catch (error) {
      setForm({
        ...form,
        success: false,
      });

      message.error(error.message);
    }
  };

  const getValue = () => {
    const components = socket('query', '/command/');

    components.onopen = () => {
      components.send(`${node} ${proc} component PropCubeWaveform ${selectedComponent}`);

      components.onmessage = ({ data }) => {
        try {
          const json = JSON.parse(data);

          if (json.output && json.output.properties) {
            setLiveValues(json.output.properties);
          }
        } catch (error) {
          console.log(error);
        }

        components.close();
      };
    };
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      getValue();
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [liveValues, selectedComponent]);

  /** Close ws on unmount */
  useEffect(() => () => ws.close(), []);

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
      <div
        className="border border-gray-300 rounded mb-2 p-4 bg-white font-mono h-32 max-h-full resize-y overflow-y-scroll"
        ref={cliEl}
      >
        {
          // eslint-disable-next-line
          commandHistory.map((command, i) => (<div key={i}>{ command }</div>))
        }
      </div>
      <Form layout="vertical">
        <div className="flex w-full flex-wrap">
          <div className="flex-initial flex-grow pr-2">
            <Form.Item
              hasFeedback={form.value ? true : false}
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
                onChange={({ target: { value } }) => {
                  setForm({
                    ...form,
                    value,
                  });
                }}
                value={form.value}
                onPressEnter={() => setParameter()}
              />
            </Form.Item>
          </div>

          <Button
            type="danger"
            onClick={() => setParameter()}
          >
            Set Value
          </Button>
        </div>
      </Form>

      <Card className="my-1">
        <table>
          <tbody>
            {
              liveValues.map(({ id, type, value }) => (
                <div key={id}>
                  {
                    type === 'sequence'
                      ? value.map(val => (
                        <tr key={`${id}${val.id}`}>
                          <td className="pr-2">
                            {id}:{val.id}
                          </td>
                          <td className="text-gray-500">
                            {val.value}
                          </td>
                        </tr>
                      ))
                      : (
                        <tr key={id}>
                          <td className="pr-2">
                            {id}
                          </td>
                          <td className="text-gray-500">
                            {value}
                          </td>
                        </tr>
                      )
                  }
                </div>
              ))
            }
          </tbody>
        </table>
      </Card>
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
  node: PropTypes.string.isRequired,
  proc: PropTypes.string.isRequired,
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
