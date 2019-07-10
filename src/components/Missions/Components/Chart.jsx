import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';
import Plot from 'react-plotly.js';

import BaseComponent from '../BaseComponent';

function Chart({
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

  const [markerColor, setMarkerColor] = useState('');

  const [legendLabel, setLegendLabel] = useState('');

  return (
    <BaseComponent
      name={nameState}
      subheader={subheader}
      liveOnly={liveOnly}
      showStatus={showStatus}
      status={status}
      formItems={(
        <Form layout="vertical">
          <Form.Item
            label="Chart Name"
            key="nameState"
            hasFeedback={form.nameState && form.nameState.touched}
            validateStatus={form.nameState && form.nameState.changed ? 'success' : ''}
          >
            <Input
              placeholder="Chart Name"
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

          {/* <Form.Item
            label="Chart Type"
            key="chartType"
            hasFeedback={form.chartType && form.chartType.touched}
            validateStatus={form.chartType && form.chartType.changed ? 'success' : ''}
          >
            <Input
              placeholder="Chart Type"
              id="chartType"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setForm({ ...form, [item]: { ...form[item], changed: true } })
              }}
              value={form.chartType && form.chartType.value}
            />
          </Form.Item> */}

          <Form.Item
            label="Marker Color"
            key="markerColor"
            hasFeedback={form.markerColor && form.markerColor.touched}
            validateStatus={form.markerColor && form.markerColor.changed ? 'success' : ''}
          >
            <Input
              placeholder="Marker Color"
              id="markerColor"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setMarkerColor(value);
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              value={form.markerColor && form.markerColor.value}
            />
          </Form.Item>

          <Form.Item
            label="Legend Label"
            key="legendLabel"
            hasFeedback={form.legendLabel && form.legendLabel.touched}
            validateStatus={form.legendLabel && form.legendLabel.changed ? 'success' : ''}
          >
            <Input
              placeholder="Legend Label"
              id="legendLabel"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setLegendLabel(value);
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              value={form.legendLabel && form.legendLabel.value}
            />
          </Form.Item>
        </Form>
      )}
      handleLiveSwitchChange={checked => setLiveSwitch(checked)}
    >
      <Plot
        className="w-full"
        data={[
          {
            x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            y: [5, 6, 23, 4, 5, 7, 1, 4, 5, 10],
            type: 'scatter',
            mode: 'lines+points',
            marker: {
              color: markerColor
            },
            name: legendLabel
          },
          {
            x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            y: [4, 2, 23, 4, 5, 9, 1, 2, 5, 10],
            type: 'scatter',
            mode: 'lines+points',
            marker: {
              color: 'black'
            },
            name: 'Second'
          }
        ]}
        layout={{
          autosize: true
        }}
      />
    </BaseComponent>
  );
}

Chart.propTypes = {
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

Chart.defaultProps = {
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

export default Chart;
