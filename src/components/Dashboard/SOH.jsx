import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Form, Select, DatePicker, message, Switch, Tooltip,
} from 'antd';
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
  const [display, setDisplay] = useState([]);

  /** Stores the overall SOH of the node process */
  const [soh, setSoh] = useState([]);

  /** Form information */
  const [sohForm] = Form.useForm();

  /** Initial value for the form */
  const [initialValue, setInitialValue] = useState({});

  const queryDatabase = async (dates) => {
    message.loading('Retrieving information from database...', 0);
    /** Query database */

    const start = (dates[0].unix() / 86400.0) + 2440587.5 - 2400000.5;
    const end = (dates[1].unix() / 86400.0) + 2440587.5 - 2400000.5;

    const { data } = await axios.post(`/query/${process.env.MONGODB_COLLECTION}/${nameState}:soh`, {
      multiple: true,
      query: {
        node_utc: {
          $lt: end,
          $gt: start,
        },
      },
    });

    return data;
  };

  useEffect(() => {
    const accumulate = {};

    accumulate.name = name;

    if (dateRange !== -1) {
      accumulate.dateRange = dateRange;
      queryDatabase(dateRange).then((r) => setSoh(r));
    }

    setInitialValue(accumulate);
  }, []);

  /** Update the inactive and active node lists */
  useEffect(() => {
    /** Update active nodes */
    const activeArray = [];
    Object.keys(state)
      .forEach((key) => {
        if (key.split(':')[1] === 'soh') {
          activeArray.push(key.split(':')[0]);
        }
      });
    setActiveNodes(activeArray);

    /** Update inactive nodes */
    if (Object.keys(state)
      .includes('namespace')) {
      const inactiveArray = Object.keys(state.namespace)
        .filter((key) => !activeNodes.includes(key) && state.namespace[key].agents.includes('soh'));
      setInactiveNodes(inactiveArray);
    }

    /** Update SOH data */
    if (disable) {
      setSoh([state[`${nameState}:soh`]]);
    }
  }, [state]);

  const findSohProperty = (input) => {
    const tempObj = [];

    if (input.length !== 0) {
      soh.forEach((obj) => {
        const newObj = { localTime: new Date(obj.node_utc * 1000) };
        input.forEach((item) => {
          newObj[item] = obj[item];
        });
        tempObj.push(newObj);
      });
    }

    setDisplay(tempObj);
  };

  const changeNode = (value) => {
    if (activeNodes.includes(value)) {
      setDisable(true);
    }
    if (inactiveNodes.includes(value)) {
      setDisable(false);
    }
  };

  const processForm = () => {
    setDisplay([]);

    const fields = sohForm.getFieldsValue();

    console.log(fields);
    if (fields.name !== '') {
      setNameState(fields.name);
    }

    if (disable) {
      setSoh(state[`${nameState}:soh`]);
    } else if (fields.dateRange != null) {
      queryDatabase(fields.dateRange)
        .then((r) => setSoh(r))
        .finally(() => {
          message.destroy();
          message.success('Successfully loaded SOH.');
        });
    } else {
      setSoh([]);
    }
  };

  return (
    <BaseComponent
      name={`${nameState} State of Health (SOH)`}
      subheader={(
        <Select
          className="w-full top-0"
          mode="multiple"
          showSearch
          allowClear
          placeholder="Select information you want to view"
          onChange={(input) => findSohProperty(input)}
        >
          {
            (soh != null && soh[0] != null && soh.length !== 0) ?
              Object.keys(soh[0]).map((props) => (
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
      )}
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
            initialValues={initialValue}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Select
                showSearch
                onChange={(value) => changeNode(value)}
                onBlur={() => processForm()}
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
                onBlur={() => processForm()}
              />
              <Tooltip>
                <Switch
                  checkedChildren="Live"
                  unCheckedChildren="Past"
                  checked={disable}
                  onClick={() => {
                    if (activeNodes.includes(nameState)) {
                      setDisable(!disable);
                    }
                  }}
                />
              </Tooltip>
            </Form.Item>
          </Form>
        </>
      )}
    >
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
