import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';
import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';
import { Context } from '../../../store/neutron1';

/**
 * Displays a specified value.
 */
const DisplayValue = React.memo(function DisplayValue({
  name,
  subheader,
  displayValues,
  nodeProc,
  dataKey,
  unit,
  liveOnly,
  showStatus,
  status,
  children,
  formItems
}) {
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state that manages the node process */
  const [nodeProcessState, setNodeProcessState] = useState(nodeProc);
  /** The state that manages the component's data key displayed */
  const [dataKeyState, setDataKeyState] = useState(dataKey);
  /** The state that manages the component's unit of measure for the displayed value */
  const [unitState, setUnitState] = useState(unit);
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();
  /** State for displaying the last seen UTC value */
  const [utc, setUtc] = useState('-');
  /** State for storing the data temporarily */
  const [dataKeyValue, setDataKeyValue] = useState('No data available.');
  
  const [displayValuesState, setDisplayValuesState] = useState(displayValues);
  /** Accessing the neutron1 node process context and drilling down to the specified node process to look at */
  const { state: { [nodeProcessState]: nodeProcess } } = useContext(Context);


  /** Handle new data incoming from the Context */
  useEffect(() => {
    displayValuesState.forEach((v, i) => {
      if (nodeProcess && nodeProcess[v.dataKey]) {
        displayValuesState[i].value = nodeProcess[v.dataKey];
      }

      if (nodeProcess && nodeProcess[v.dataKey] && nodeProcess.utc) {
        displayValuesState[i].utc = moment.unix((((nodeProcess.utc + 2400000.5) - 2440587.5) * 86400.0)).format('MMDDYYYY-HH:mm:ss');
      }
    });
  }, [nodeProcess]);

  return (
    <BaseComponent
      name={nameState}
      subheader={utc}
      liveOnly={liveOnly}
      showStatus={showStatus}
      status={status}
      formItems={(
        <Form layout="vertical">
          <Form.Item
            label="Name"
            key="name"
            hasFeedback={form.nameState && form.nameState.touched}
            validateStatus={form.nameState && form.nameState.changed ? 'success' : ''}
          >
            <Input
              placeholder="Name"
              id="nameState"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setNameState(value);
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={name}
            />
          </Form.Item>

          <Form.Item
            label="Node Process"
            key="nodeProcess"
            hasFeedback={form.nodeProcessState && form.nodeProcessState.touched}
            validateStatus={form.nodeProcessState && form.nodeProcessState.changed ? 'success' : ''}
          >
            <Input
              placeholder="Node Process"
              id="nodeProcessState"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setNodeProcessState(value);
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={nodeProc}
            />
          </Form.Item>

          <Form.Item
            label="Data Key"
            key="dataKeyState"
            hasFeedback={form.dataKeyState && form.dataKeyState.touched}
            validateStatus={form.dataKeyState && form.dataKeyState.changed ? 'success' : ''}
          >
            <Input
              placeholder="Data Key"
              id="dataKeyState"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setDataKeyState(value);
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={dataKey}
            />
          </Form.Item>

          <Form.Item
            label="Unit"
            key="unit"
            hasFeedback={form.unitState && form.unitState.touched}
            validateStatus={form.unitState && form.unitState.changed ? 'success' : ''}
          >
            <Input
              placeholder="Unit"
              id="unitState"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setUnitState(value);
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={unit}
            />
          </Form.Item>
        </Form>
      )}
      handleLiveSwitchChange={checked => setLiveSwitch(checked)}
    >
      <table>
        <tbody>
          {
            displayValuesState.length === 0 ? 'No values.' : null
          }
          {
            displayValuesState.map(({ name, unit }, i) => {
              return (
                <tr key={name}>
                  <td className="pr-2 text-gray-500">
                    {name}
                  </td>
                  <td className="pr-2">
                    {displayValuesState[i].value ? `${displayValuesState[i].value}${unit}` : '-'}
                  </td>
                  <td className="text-gray-500">
                    {displayValuesState[i].utc ? displayValuesState[i].utc : '-'}
                  </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
      {/* <div className="text-center text-lg">
        <span>
          {dataKeyValue}
        </span>
        <span className="text-gray-500">
          {
            dataKeyValue !== 'No data available.' ? unitState : null
          }
        </span>
      </div> */}
    </BaseComponent>
  );
});

DisplayValue.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** */
  displayValues: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      nodeProcess: PropTypes.string,
      dataKey: PropTypes.string,
      unit: PropTypes.string
    })
  ),
  /** JSON object of data */
  nodeProc: PropTypes.string,
  /** Key to display from the data JSON object above */
  dataKey: PropTypes.string,
  /** The unit of measurement of a certain value. */
  unit: PropTypes.string,
  /** Whether the component can display only live data. Hides/shows the live/past switch. */
  liveOnly: PropTypes.bool,
  /** Whether to show a circular indicator of the status of the component */
  showStatus: PropTypes.bool,
  /** The type of badge to show if showStatus is true (see the ant design badges component) */
  status: (props, propName, componentName) => {
    if (props.showStatus) {
      return new Error(
        `${propName} is required when showStatus is true in ${componentName}.`
      );
    }
  },
  /** Children node */
  children: PropTypes.node,
  /** Form node */
  formItems: PropTypes.node
};

DisplayValue.defaultProps = {
  name: '',
  subheader: null,
  nodeProc: null,
  dataKey: null,
  unit: '',
  showStatus: false,
  liveOnly: true,
  status: 'error',
  children: null,
  formItems: null
};

export default DisplayValue;
