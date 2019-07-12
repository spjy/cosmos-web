import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, DatePicker, Button
} from 'antd';
import Plot from 'react-plotly.js';

import BaseComponent from '../BaseComponent';
import { Context } from '../../../store/neutron1';
import socket from '../../../socket';

const { RangePicker } = DatePicker;

/**
 * Display data on a chart.
 */
function Chart({
  name,
  subheader,
  nodeProc,
  XDataKey,
  YDataKey,
  processXDataKey,
  processYDataKey,
  liveOnly,
  showStatus,
  status,
  children,
  formItems
}) {
  /** Websocket endpoint for retrieving the command queries */
  const [ws] = socket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:${process.env.REACT_APP_QUERY_WEBSOCKET_PORT}/query/`);
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state managing the node process being looked at */
  const [nodeProcessState, setNodeProcessState] = useState(nodeProc);
  /** The state that manages the component's X-axis data key displayed */
  const [XDataKeyState, setXDataKeyState] = useState(XDataKey);
  /** The state that manages the component's X-axis data key displayed */
  const [YDataKeyState, setYDataKeyState] = useState(YDataKey);
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();
  /** The color of the function */
  const [markerColor, setMarkerColor] = useState('');
  /** The name to be displayed for the function's legend marker */
  const [legendLabel, setLegendLabel] = useState('');
  /** Counter determining when the plot should be updated */
  const [dataRevision, setDataRevision] = useState(0);
  /** Layout parameters for the plot */
  const [layout, setLayout] = useState({
    autosize: true,
    datarevision: dataRevision,
    paper_bgcolor: '#FBFBFB',
    plot_bgcolor: '#FBFBFB',
    xaxis: {
      title: XDataKeyState
    },
    yaxis: {
      title: YDataKeyState
    },
    showlegend: true,
    legend: {
      orientation: 'h'
    },
    margin: {
      r: 0,
      t: 0,
      b: 0
    }
  });
  /** Plot data storage */
  const [plot, setPlot] = useState({
    x: [],
    y: [],
    type: 'scatter',
    marker: {
      color: markerColor
    },
    name: YDataKeyState
  });
  /** Storage for historical data display */
  const [historicalData, setHistoricalData] = useState([]);

  /** Accessing the neutron1 node process context and drilling down */
  const { state: { [nodeProcessState]: nodeProcess } } = useContext(Context);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    if (nodeProcess && nodeProcess[XDataKeyState] && nodeProcess[YDataKeyState]) {
      plot.x.push(processXDataKey(nodeProcess[XDataKeyState]));
      plot.y.push(processYDataKey(nodeProcess[YDataKeyState]));

      layout.datarevision = layout.datarevision + 1;
      setDataRevision(dataRevision + 1);
    }
  }, [nodeProcess]);

  ws.onmessage = ({ data }) => {
    data.forEach((d) => {

    })
  };

  const retrieveHistoricalData = () => {
    ws.send('');
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // plot.x.push(plot.x[plot.x.length - 1] + 1);
  //     // plot.y.push(plot.y[plot.y.length - 1] + 1);
  //     // layout.datarevision = layout.datarevision + 1;

  //     // setDataRevision(dataRevision + 1);
  //   }, 1000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [plot, dataRevision]);

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
            className="w-auto"
            label="Historical Date Range"
            key="dateRange"
            hasFeedback={form.dateRange && form.dateRange.touched}
            validateStatus={form.dateRange && form.dateRange.changed ? 'success' : ''}
          >
            <RangePicker
              className="mr-1"
              id="dateRange"
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              disabled={liveSwitch}
            />
            <Button
              type="primary"
              onClick={retrieveHistoricalData()}
            >
              Show
            </Button>
          </Form.Item>

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
              defaultValue={name}
            />
          </Form.Item>

          <Form.Item
            label="Node Process"
            key="nodeProcess"
            hasFeedback={form.nodeProcess && form.nodeProcess.touched}
            validateStatus={form.nodeProcess && form.nodeProcess.changed ? 'success' : ''}
          >
            <Input
              placeholder="Node Process"
              id="nodeProcess"
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
            label="X Data Key"
            key="XDataKeyState"
            hasFeedback={form.XDataKey && form.XDataKey.touched}
            validateStatus={form.XDataKey && form.XDataKey.changed ? 'success' : ''}
          >
            <Input
              placeholder="X Data Key"
              id="XDataKeyState"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setXDataKeyState(value);
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={XDataKeyState}
            />
          </Form.Item>

          <Form.Item
            label="Y Data Key"
            key="YDataKeyState"
            hasFeedback={form.YDataLey && form.YDataLey.touched}
            validateStatus={form.YDataLey && form.YDataLey.changed ? 'success' : ''}
          >
            <Input
              placeholder="X Data Key"
              id="YDataKeyState"
              onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setYDataKeyState(value);
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={YDataKeyState}
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
                plot.marker.color = value;
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={markerColor}
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
                plot.name = value;
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={legendLabel}
            />
          </Form.Item>
        </Form>
      )}
      handleLiveSwitchChange={checked => setLiveSwitch(checked)}
    >
      <Plot
        id="plot"
        className="w-full"
        data={[
          plot
        ]}
        config={{
          scrollZoom: true
        }}
        layout={layout}
        revision={dataRevision}
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
  nodeProc: PropTypes.string,
  /** X-axis key to display from the data JSON object above */
  XDataKey: PropTypes.string,
  /** Y-axis key to display from the data JSON object above */
  YDataKey: PropTypes.string,
  /** Function to process the X-axis key */
  processXDataKey: PropTypes.func,
  /** Function to process the Y-axis key */
  processYDataKey: PropTypes.func,
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
  nodeProc: null,
  XDataKey: null,
  YDataKey: null,
  processXDataKey: x => x,
  processYDataKey: y => y,
  showStatus: false,
  liveOnly: true,
  handleLiveSwitchChange: () => {},
  status: 'error',
  children: null,
  formItems: null
};

export default Chart;
