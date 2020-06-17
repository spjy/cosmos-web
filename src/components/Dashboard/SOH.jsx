import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Form, Select, DatePicker } from 'antd';
import BaseComponent from '../BaseComponent';
import { Context } from '../../store/dashboard';
import { axios } from '../../api';

const { RangePicker } = DatePicker;

/**
 * Displays a specified live value from an agent.
 * Updates values every agent heartbeat.
 */
function SOH({
  name,
  dateRange,
  height,
}) {
  /** Accessing the neutron1 messages from the socket */
  const { state } = useContext(Context);

  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);

  /** Stores active nodes */
  const [activeNodes, setActiveNodes] = useState([]);

  /** Stores active nodes */
  const [inactiveNodes, setInactiveNodes] = useState([]);

  /** Checks if the selected node is inactive or active */
  const [disable, setDisable] = useState(true);

  /** Information displayed */
  const [display, setDisplay] = useState({});

  /** Stores the overall SOH of the node process */
  const [soh, setSoh] = useState({});

  /** Form information */
  const [form] = useState({
    name: '',
    dateRange,
  });

  const queryDatabase = async (dateRange) => {
    /** Query database */
    const { data } = await axios.post(`/query/${process.env.MONGODB_COLLECTION}/${nameState}:soh`,{
      query: {
        'node_name': {
        },
      },
    });
    console.log(data);
  };

  /** Update the inactive and active node lists */
  useEffect(() => {
    const newArray = [];

    Object.keys(state)
      .forEach((key) => {
        if (key.split(':')[1] === 'soh') {
          newArray.push(key.split(':')[0]);
        }
      });

    if (Object.keys(state)
      .includes('namespace')) {
      const inactiveArray = Object.keys(state.namespace)
        .filter((key) => !newArray.includes(key));
      setInactiveNodes(inactiveArray);
    }

    if (form.dateRange !== -1) {
      setSoh(queryDatabase(dateRange));
    } else {
      setSoh(state[`${nameState}:soh`]);
    }

    setActiveNodes(newArray);
  }, [state]);

  const findSohProperty = (input) => {
    const tempObj = {};

    input.forEach((val) => {
      tempObj[val] = soh[val];
    });

    setDisplay(tempObj);
  };

  const changeNode = (value) => {
    if (value !== '') {
      form.name = value;

      if (inactiveNodes.includes(value)) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    }
  };

  const updateComponent = () => {
    setNameState(form.name);

    if (activeNodes.includes(nameState)) {
      setSoh(state[`${nameState}:soh`]);
    } else {
      setSoh(queryDatabase(form.dateRange));
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
            layout="vertical"
            name="sohForm"
            initialValues={{
              name: nameState,
              dateRange,
            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Select
                showSearch
                onChange={(value) => changeNode(value)}
                onBlur={() => updateComponent()}
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
                <Select.OptGroup label="Inactive">
                  { inactiveNodes.map((node) => (
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
                disabled={disable}
              />
            </Form.Item>
          </Form>
        </>
      )}
    >
      <Select
        className="w-full top-0 sticky"
        mode="multiple"
        showSearch
        allowClear
        placeholder="Select information you want to view"
        onChange={(input) => findSohProperty(input)}
      >
        {
          (soh != null && soh !== {}) ? Object.keys(soh).map((props) => (
            <Select.Option
              key={props}
              value={props}
            >
              {props}
            </Select.Option>
          ))
            : null
        }
      </Select>
      <pre className="pt-1">
        {
          Object.keys(display).length !== 0 ? JSON.stringify(display, null, 2)
            : JSON.stringify(soh, null, 2)
        }
      </pre>
    </BaseComponent>
  );
}

SOH.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  dateRange: PropTypes.number,
  height: PropTypes.number.isRequired,
};

SOH.defaultProps = {
  name: '',
  dateRange: -1,
};

export default SOH;
