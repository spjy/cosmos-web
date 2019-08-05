import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button } from 'antd';

import BaseComponent from '../BaseComponent';
import socket from '../../../socket';

const ws = socket('query', '/command/');

const transmitApplication = [
  {
    application: 'Transmit Application',
    component: 'File Source',
    displayName: 'Destination Call Sign',
    propertyName: 'destination_call_sign',
    unit: 'dB',
    validate: (x) => {
      if (x || x === '') {
        return true;
      }
      return false;
    },
    processValue: x => x,
    error: 'Must be an integer from 0-20.',
    comment: 'Only applies to HiakaSat Trasmit Application',
  },
  {
    application: 'Transmit Application',
    component: 'FIR Filter',
    displayName: 'Sampling Frequency',
    propertyName: 'sampling_frequency',
    unit: 'kHz',
    validate: (x) => {
      if (Number(x) >= 0 && Number(x) <= 5000) {
        return true;
      }
      return false;
    },
    processValue: x => x / 1000,
    error: 'Must be float from 0-5000.',
    comment: 'Reads kHz but passes Hz',
  },
];

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
}) {
  /** Form storage */
  const [form, setForm] = useState({
    'Transmit Application': {},
  });
  /** Status of the live switch */
  const [, setLiveSwitch] = useState();

  const setParameter = (application, component, property, value) => {
    ws.send(`agent masdr ${application} ${component} ${property} ${value}`);
  };

  ws.onmessage = ({ data }) => {

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
      <Form layout="vertical">
        {
          transmitApplication.map(({
            application,
            component,
            displayName,
            propertyName,
            unit,
            validate,
            error,
            comment,
            processValue,
          }) => (
            <div key={`${application}`} className="flex w-full flex-wrap">
              <div className="flex-initial flex-grow p-1">
                <Form.Item
                  key={propertyName}
                  hasFeedback={form[application] && form[application][propertyName] && form[application][propertyName].touched}
                  validateStatus={form[application] && form[application][propertyName] && form[application][propertyName].changed ? 'success' : ''}
                  className="-mb-1"
                  help={comment}
                >
                  <Input
                    placeholder={`${displayName}${unit && unit !== '' ? ` (${unit})` : ''}`}
                    id={propertyName}
                    onFocus={({ target: { id: item } }) => setForm({
                      ...form,
                      [application]: {
                        ...form[application],
                        [item]: {
                          ...form[application][item],
                          touched: true,
                          changed: false,
                        },
                      },
                    })}
                    onChange={({ target: { id: item, value } }) => setForm({
                      ...form,
                      [item]: {
                        ...form[item],
                        value,
                        changed: false,
                      },
                      [application]: {
                        ...form[application],
                        [item]: {
                          ...form[application][item],
                          value,
                          changed: false,
                        },
                      },
                    })}
                  />
                </Form.Item>
              </div>
              <div className="p-1">
                <Button
                  type="danger"
                  onClick={() => {
                    if (form[application]
                      && form[application][propertyName]
                      && validate(form[application][propertyName].value)
                    ) {
                      setParameter(application, component, propertyName, processValue(form[application][propertyName].value));
                      setForm({
                        ...form,
                        [application]: {
                          ...form[application],
                          [propertyName]: {
                            ...form[application][propertyName],
                            changed: true,
                            error: null,
                          },
                        },
                      });
                    } else {
                      setForm({
                        ...form,
                        [application]: {
                          ...form[application],
                          [propertyName]: {
                            ...form[application][propertyName],
                            changed: false,
                            error,
                          },
                        },
                      });
                    }
                  }}
                >
                  Set
                  &nbsp;
                  {displayName}
                  &nbsp;
                  {
                    unit && unit !== '' ? `(${unit})` : null
                  }
                </Button>
              </div>
              <div className="text-red-500 w-full ml-1">
                {form[application] && form[application][propertyName] && form[application][propertyName].error ? form[application][propertyName].error : null}
              </div>
            </div>
          ))
        }
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
