import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Form, Select, DatePicker } from 'antd';
import BaseComponent from '../BaseComponent';
import { Context } from '../../store/dashboard';

const { RangePicker } = DatePicker;

/**
 * Displays a specified live value from an agent.
 * Updates values every agent heartbeat.
 */
function SOH({
  name,
  height,
}) {
  const [sohForm] = Form.useForm();

  /** Accessing the neutron1 messages from the socket */
  const { state } = useContext(Context);

  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);

  /** Stores active nodes */
  const [activeNodes, setActiveNodes] = useState([]);

  /** Initialize form components for each display value */
  useEffect(() => {
    const newArray = [];

    Object.keys(state).forEach((key) => {
      if (key.split(':')[1] === 'soh') {
        newArray.push(key.split(':')[0]);
      }
    });

    setActiveNodes(newArray);
  }, [state]);

  const processForm = (id) => {
    // Destructure form, field, index to retrieve changed field
    const field = id.split('_')[1];

    const value = sohForm.getFieldsValue()[field];

    switch (field) {
      case 'name':
        setNameState(value);
        break;
      case 'dateRange':
        break;
      default: break;
    }
  };

  return (
    <BaseComponent
      name={`${nameState} State of Health (SOH)`}
      liveOnly
      showStatus
      height={height}
      status={state.length === 0 ? 'default' : 'success'}
      formItems={(
        <>
          <Form
            form={sohForm}
            layout="vertical"
            name="sohForm"
            initialValues={{
              name: nameState,
            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Select
                showSearch
                onChange={({ target: { id } }) => processForm(id)}
              >
                <Select.OptGroup label="Active">
                  { activeNodes.map((node) => (
                    <Select.Option
                      key={node}
                      value={node}
                    >
                      {node}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              </Select>
            </Form.Item>
            <Form.Item label="Historical Date Range" name="dateRange" hasFeedback>
              <RangePicker
                className="mr-1"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Form.Item>
          </Form>
        </>
      )}
    >
      <Select
        showSearch
        onChange={(input) => findSohProperty(input)}
      >
        { activeNodes.map((node) => (
          <Select.Option
            key={node}
            value={node}
          >
            {node}
          </Select.Option>
        ))}
      </Select>
      {
        state.length === 0 ? 'No values to display.' : null
      }
      <pre>
        {JSON.stringify(state[`${nameState}:soh`], null, 2)}
      </pre>
    </BaseComponent>
  );
}

SOH.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  height: PropTypes.number.isRequired,
};

SOH.defaultProps = {
  name: '',
};

export default SOH;
