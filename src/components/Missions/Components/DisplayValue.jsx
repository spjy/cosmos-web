import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';
import _ from 'lodash';
import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';
import { Context } from '../../../store/neutron1';

/**
 * 
 */
function DisplayValue({
  name,
  subheader,
  data,
  dataKey,
  liveOnly,
  showStatus,
  status,
  children,
  formItems
}) {
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state that manages the component's data key displayed */
  const [dataKeyState, setDataKeyState] = useState(dataKey);
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();

  return (
    <Context.Consumer>
      {
        node => (
          <BaseComponent
            name={nameState}
            subheader={data && _.has(data, dataKeyState) && data.utc ? moment.unix(data.utc).format('MMDDYYYY-HH:mm:ss') : '-'}
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
                    value={form.nameState && form.nameState.value}
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
                    value={form.dataKeyState && form.dataKeyState.value}
                  />
                </Form.Item>
              </Form>
            )}
            handleLiveSwitchChange={checked => setLiveSwitch(checked)}
          >
            <div className="text-center">
              {
                data && dataKeyState && _.has(data, dataKeyState) ? _.get(data, dataKeyState) : 'No data available.'
              }
            </div>
          </BaseComponent>
        )
      }
    </Context.Consumer>
  );
}

DisplayValue.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** JSON object of data */
  data: PropTypes.object,
  /** Key to display from the data JSON object above */
  dataKey: PropTypes.string,
  /** Whether the component can display only live data. Hides/shows the live/past switch. */
  liveOnly: PropTypes.bool,
  /** Function is run when the live/past switch is toggled. */
  handleLiveSwitchChange: PropTypes.func,
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
  data: null,
  dataKey: null,
  showStatus: false,
  liveOnly: true,
  handleLiveSwitchChange: () => {},
  status: 'error',
  children: null,
  formItems: null
};

export default DisplayValue;
