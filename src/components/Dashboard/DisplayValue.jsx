import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Form, Input, Collapse, Button,
} from 'antd';
import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';
import { Context } from '../../store/neutron1';

const { Panel } = Collapse;
const { TextArea } = Input;

/**
 * Displays a specified live value from an agent.
 * Updates values every agent heartbeat.
 */
function DisplayValue({
  name,
  displayValues,
  height,
}) {
  /** Accessing the neutron1 messages from the socket */
  const { state } = useContext(Context);

  /** Storage for global form values */
  const [displayValuesForm] = Form.useForm();
  /** Form for adding new values */
  const [newForm] = Form.useForm();
  /** Form for editing values */
  const [editForm] = Form.useForm();

  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state that manages the global node process */
  const [np, setNp] = useState('');
  /** Initial form values for editForm */
  const [initialValues, setInitialValues] = useState({});

  /** Store the display values here */
  const [displayValuesState, setDisplayValuesState] = useState(displayValues);

  /** Initialize form components for each display value */
  useEffect(() => {
    let accumulate = {};

    let check = displayValues[0].nodeProcess;
    // Initialize form values for each value
    displayValues.forEach(({
      name: nameVal, nodeProcess, dataKey, processDataKey, unit,
    }, i) => {
      accumulate = {
        ...accumulate,
        [`name_${i}`]: nameVal,
        [`nodeProcess_${i}`]: nodeProcess,
        [`dataKey_${i}`]: dataKey,
        [`processDataKey_${i}`]: processDataKey
          ? processDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
          : 'return x',
        [`unit_${i}`]: unit,
      };

      if (check !== nodeProcess && check !== ' ') {
        check = ' ';
      }
    });

    if (check !== ' ') {
      setNp(check);
    } else {
      setNp('');
    }

    setInitialValues(accumulate);
  }, []);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    // Loop through the currently displayed values
    displayValuesState.forEach((v, i) => {
      // Check if the state change involves any of the displayed values
      // by checking the node process and the key it is watching
      if (state[v.nodeProcess]
        && state[v.nodeProcess][v.dataKey] !== undefined
        && state[v.nodeProcess].utc
      ) {
        // If it does, change the value
        displayValuesState[i].value = state[v.nodeProcess][v.dataKey];
        displayValuesState[i].utc = moment.unix((((state[v.nodeProcess].utc + 2400000.5) - 2440587.5) * 86400.0)).format('YYYY-MM-DDTHH:mm:ss');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  /** Process edit value form */
  const processForm = (id) => {
    // Destructure form, field, index to retrieve changed field
    const [form, field, index] = id.split('_');
    console.log(form, field, index);
    // Check type of form
    if (form === 'displayValuesForm') {
      // Update name state
      setNameState(displayValuesForm.getFieldsValue()[field]);
    } else if (form === 'editForm') {
      // Copy display values to replace index and field value
      const displayValuesCopy = displayValuesState;

      // Create function for processDataKey, O.W. for inputs just set value
      displayValuesCopy[index][field] = field !== 'processDataKey'
        ? editForm.getFieldsValue()[`${field}_${index}`]
        : new Function('x', editForm.getFieldsValue()[`${field}_${index}`]); // eslint-disable-line no-new-func

      // Update state
      setDisplayValuesState(displayValuesCopy);
    }

    if (field === 'np') {
      const displayValuesCopy = displayValuesState;
      displayValuesCopy.forEach((area) => {
        // eslint-disable-next-line no-param-reassign
        area.nodeProcess = displayValuesForm.getFieldsValue()[field];
      });
      setDisplayValuesState(displayValuesCopy);
      // eslint-disable-next-line no-plusplus
      for (let x = 0; x < displayValuesCopy.length; x++) {
        editForm.setFieldsValue({
          [`nodeProcess_${x}`]: displayValuesForm.getFieldsValue()[field],
        });
      }
    }
  };

  /** Process new value form */
  const onFinish = ({
    name: nameVal,
    nodeProcess,
    dataKey,
    processDataKey,
    unit,
  }) => {
    // Append new value to array
    const displayValuesCopy = displayValuesState;

    displayValuesCopy.push({
      name: nameVal || '',
      nodeProcess,
      dataKey,
      processDataKey: processDataKey
        ? new Function('x', processDataKey) // eslint-disable-line no-new-func
        : (x) => x,
      unit: unit || '',
    });

    setDisplayValuesState(displayValuesCopy);

    // Set edit value default form values
    const newIndex = displayValuesCopy.length - 1;

    editForm.setFieldsValue({
      [`name_${newIndex}`]: nameVal,
      [`nodeProcess_${newIndex}`]: nodeProcess,
      [`dataKey_${newIndex}`]: dataKey,
      [`processDataKey_${newIndex}`]: processDataKey.replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim(),
      [`unit_${newIndex}`]: unit,
    });

    // Clear form
    newForm.resetFields();
  };

  return (
    <BaseComponent
      name={nameState}
      liveOnly
      showStatus
      height={height}
      status={displayValuesState.length === 0 ? 'default' : 'success'}
      formItems={(
        <>
          {/* Global forms */}
          <Form
            form={displayValuesForm}
            layout="vertical"
            name="displayValuesForm"
            initialValues={{
              name,
              np,
            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>
            <Form.Item label="<node>:<process>" name="np" hasFeedback>
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>
          </Form>

          {/* Modify values forms */}
          <Form
            layout="vertical"
            initialValues={initialValues}
            name="editForm"
            form={editForm}
          >
            <Collapse
              bordered
            >
              {
                displayValuesState.map((displayValue, i) => (
                  <Panel
                    header={(
                      <span className="text-gray-600">
                        <span className="inline-block rounded-full mr-2 indicator" style={{ height: '6px', width: '6px', marginBottom: '2px' }} />
                        <strong>
                          {displayValue.nodeProcess}
                        </strong>
                        &nbsp;
                        <span>
                          {displayValue.name}
                        </span>
                      </span>
                    )}
                    key={`${displayValue.name}${displayValue.nodeProcess}${displayValue.dataKey}`}
                    extra={(
                      <span
                        onClick={(event) => {
                          event.stopPropagation();

                          setDisplayValuesState(displayValuesState.filter((values, j) => j !== i));
                        }}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={i}
                      >
                        X
                      </span>
                    )}
                  >
                    <Form.Item label="Name" name={`name_${i}`} hasFeedback>
                      <Input placeholder="Name" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Node Process" name={`nodeProcess_${i}`} hasFeedback>
                      <Input placeholder="Node Process" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Data Key" name={`dataKey_${i}`} hasFeedback>
                      <Input placeholder="Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Process Data Key" name={`processDataKey_${i}`} hasFeedback help="Define the function body (in JavaScript) here to process the variable 'x'.">
                      <TextArea placeholder="Process Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Unit" name={`unit_${i}`} hasFeedback>
                      <Input placeholder="Unit" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>
                  </Panel>
                ))
              }
            </Collapse>
          </Form>

          <br />

          {/* Add forms */}
          <Form
            form={newForm}
            layout="vertical"
            name="newForm"
            onFinish={onFinish}
            initialValues={{
              processDataKey: 'return x;',
            }}
          >
            <Collapse>
              <Panel header="Add Value" key="add">
                <Form.Item label="Name" name="name" hasFeedback>
                  <Input placeholder="Name" />
                </Form.Item>

                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: 'Node Process is required!',
                    },
                    () => ({
                      validator(rule, value) {
                        if (!value.includes(':')) {
                          return Promise.reject('Must have the format node:process.'); // eslint-disable-line prefer-promise-reject-errors
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  label="Node Process"
                  name="nodeProcess"
                  hasFeedback
                >
                  <Input placeholder="Node Process" />
                </Form.Item>

                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: 'Data Key is required!',
                    },
                  ]}
                  label="Data Key"
                  name="dataKey"
                  help="Define the function body (in JavaScript) here to process the variable 'x'."
                  hasFeedback
                >
                  <Input placeholder="Data Key" />
                </Form.Item>

                <Form.Item
                  rules={[
                    () => ({
                      validator(rule, value) {
                        if (!value.includes('return')) {
                          return Promise.reject('Must return a value.'); // eslint-disable-line prefer-promise-reject-errors
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  label="Process Data Key"
                  name="processDataKey"
                  hasFeedback
                >
                  <TextArea placeholder="Process Data Key" />
                </Form.Item>

                <Form.Item label="Unit" name="unit" hasFeedback>
                  <Input placeholder="Unit" />
                </Form.Item>

                <Button
                  type="dashed"
                  block
                  htmlType="submit"
                >
                  Add Value
                </Button>
              </Panel>
            </Collapse>
          </Form>
        </>
      )}
    >
      {
        displayValuesState.length === 0 ? 'No values to display.' : null
      }
      <table>
        <tbody>
          {
            displayValuesState.map(({ name: label, unit: u }, i) => (
              <tr key={label}>
                <td className="pr-2 text-gray-500 text-right">
                  { label }
                </td>
                <td className="pr-2">
                  {
                    displayValuesState[i].value !== undefined
                      ? `${displayValuesState[i].processDataKey
                        ? displayValuesState[i].processDataKey(displayValuesState[i].value)
                        : displayValuesState[i].value}${u}` : '-'
                  }
                </td>
                <td className="text-gray-500">
                  { displayValuesState[i].utc ? displayValuesState[i].utc : '-' }
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </BaseComponent>
  );
}

DisplayValue.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** The values to display */
  displayValues: PropTypes.arrayOf(
    PropTypes.shape({
      /** Display name of the value */
      name: PropTypes.string,
      /** the node:process to pull the value from */
      nodeProcess: PropTypes.string,
      /** The data key to pull the value from */
      dataKey: PropTypes.string,
      /** The function to put the value through to manipulate it */
      processDataKey: PropTypes.func,
      /** The unit of the  */
      unit: PropTypes.string,
    }),
  ),
  height: PropTypes.number.isRequired,
};

DisplayValue.defaultProps = {
  name: '',
  displayValues: [],
};

export default DisplayValue;
