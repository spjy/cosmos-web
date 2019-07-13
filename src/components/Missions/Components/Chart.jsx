import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, DatePicker, Button, Switch, Collapse, Icon
} from 'antd';
import Plot from 'react-plotly.js';

import BaseComponent from '../BaseComponent';
import { Context } from '../../../store/neutron1';
import socket from '../../../socket';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

/**
 * Display data on a chart.
 */
function Chart({
  name,
  subheader,
  charts,
  plots,
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
  const [ws] = useState(socket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:${process.env.REACT_APP_QUERY_WEBSOCKET_PORT}/query/`));
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state managing the node process being looked at */
  const [nodeProcessState, setNodeProcessState] = useState(nodeProc);
  /** The state that manages the component's X-axis data key displayed */
  const [XDataKeyState, setXDataKeyState] = useState(XDataKey);
  /** The state that manages the component's X-axis data key displayed */
  const [YDataKeyState, setYDataKeyState] = useState(YDataKey);
  /** Storage for form values */
  const [form, setForm] = useState({ newChart: {
    live: true
  }});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();
  /** The color of the function */
  const [markerColor, setMarkerColor] = useState('red');
  /** The name to be displayed for the function's legend marker */
  const [legendLabel, setLegendLabel] = useState(nodeProc);
  /** Counter determining when the plot should be updated */
  const [dataRevision, setDataRevision] = useState(0);
  /** Layout parameters for the plot */
  const [layout, setLayout] = useState({
    autosize: true,
    datarevision: dataRevision,
    paper_bgcolor: '#FBFBFB',
    plot_bgcolor: '#FBFBFB',
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
  const [plotsState, setPlotsState] = useState([
    {
      x: [],
      y: [],
      type: 'scatter',
      marker: {
        color: markerColor
      },
      name: YDataKeyState
    }
  ]);
  
  /** Storage for date range of historical data query */
  const [historicalDateRange, setHistoricalDateRange] = useState([]);
  /** Storage for historical data display */
  const [historicalData, setHistoricalData] = useState([]);

  /** Accessing the neutron1 node process context and drilling down */
  const { state: { [nodeProcessState]: nodeProcess } } = useContext(Context);

  const [chartsState, setChartsState] = useState([
    {
      live: false,
      historicalDateRange: [],
      chartName: '',
      nodeProcess: '',
      XDataKey: '',
      YDataKey: '',
      markerColor: '',
      legendLabel: '',
      chart: {
        x: [],
        y: [],
        type: 'scatter',
        marker: {
          color: markerColor
        },
        name: YDataKeyState
      }
    }
  ]);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    if (nodeProcess && nodeProcess[XDataKeyState] && nodeProcess[YDataKeyState] && liveSwitch) {
      plotsState[0].x.push(processXDataKey(nodeProcess[XDataKeyState]));
      plotsState[0].y.push(processYDataKey(nodeProcess[YDataKeyState]));

      layout.datarevision = layout.datarevision + 1;
      setDataRevision(dataRevision + 1);
    }
  }, [nodeProcess]);

  /** Reset the chart if switched from past to present mode */
  useEffect(() => {
    if (liveSwitch) {
      plotsState[0].x = [];
      plotsState[0].y = [];
    }
  }, [liveSwitch]);

  /** Get data from queried data */
  ws.onmessage = ({ data }) => {
    let json;

    try {
      json = JSON.parse(data);
    } catch (err) {
      console.log(err);
    }

    console.log(data);

    if (json) {
      // Reset chart for past data
      plotsState[0].x = [];
      plotsState[0].y = [];

      // Insert past data into chart
      json.forEach((d) => {
        plotsState[0].x.push(processXDataKey(d[XDataKeyState]));
        plotsState[0].y.push(processYDataKey(d[YDataKeyState]));

        layout.datarevision = layout.datarevision + 1;
        setDataRevision(dataRevision + 1);
      });
    }
  };

  const retrieveHistoricalData = (wsHistorical) => {
    if (historicalDateRange.length === 2) {
      const from = ((historicalDateRange[0].unix() / 86400.0) + 2440587.5 - 2400000.5);
      const to = ((historicalDateRange[1].unix() / 86400.0) + 2440587.5 - 2400000.5);

      wsHistorical.send(
        `database=agent_dump?collection=${nodeProcessState}?multiple=true?query={"utc": { "$gt": ${from}, "$lt": ${to} }}`
      );
    }
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
      subheader={nodeProcessState}
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
              defaultValue={name}
            />
          </Form.Item>
          <Collapse
            bordered
          >
            <Panel
              header={(
                <span>
                  <strong>hsflpc23:cpu</strong>: device_cpu_load_000 vs. utc
                </span>
              )}
              key="1"
              extra={(
                <div
                  onClick={event => event.stopPropagation()}
                >
                  <Switch
                    checkedChildren="Live"
                    unCheckedChildren="Past"
                    defaultChecked
                    onChange={checked => setLiveSwitch(checked)}
                  />
                  &nbsp;
                  <Icon className="text-lg" type="close" />
                </div>
              )}
            >
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
                  onChange={moment => setHistoricalDateRange(moment)}
                />
                <Button
                  type="primary"
                  onClick={() => retrieveHistoricalData(ws)}
                >
                  Show
                </Button>
              </Form.Item>

              <Form.Item
                label="Chart Type"
                key="nameState"
                hasFeedback={form.chartType && form.chartType.touched}
                validateStatus={form.chartType && form.chartType.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Chart Type"
                  id="chartType"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, [item]: { ...form[item], changed: true } });
                  }}
                  defaultValue={name}
                />
              </Form.Item>

              <Form.Item
                label="Chart Mode"
                key="chartMode"
                hasFeedback={form.chartMode && form.chartMode.touched}
                validateStatus={form.chartMode && form.chartMode.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Chart Mode"
                  id="chartMode"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
                  onBlur={({ target: { id: item, value } }) => {
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
                key="XDataKey"
                hasFeedback={form.XDataKey && form.XDataKey.touched}
                validateStatus={form.XDataKey && form.XDataKey.changed ? 'success' : ''}
              >
                <Input
                  placeholder="X Data Key"
                  id="XDataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setXDataKeyState(value);
                    setForm({ ...form, [item]: { ...form[item], changed: true } });
                  }}
                  defaultValue={XDataKey}
                />
              </Form.Item>

              <Form.Item
                label="Y Data Key"
                key="YDataKey"
                hasFeedback={form.YDataKey && form.YDataKey.touched}
                validateStatus={form.YDataKey && form.YDataKey.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Y Data Key"
                  id="YDataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, [item]: { ...form[item], touched: true, changed: false } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, [item]: { ...form[item], value, changed: false } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setYDataKeyState(value);
                    setForm({ ...form, [item]: { ...form[item], changed: true } });
                  }}
                  defaultValue={YDataKey}
                />
              </Form.Item>

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
                    plotsState[0].marker.color = value;
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
                    plotsState[0].name = value;
                    setForm({ ...form, [item]: { ...form[item], changed: true } });
                  }}
                  defaultValue={legendLabel}
                />
              </Form.Item>
            </Panel>
            <Panel header="Add Chart" key="3">
              <Switch
                checkedChildren="Live"
                unCheckedChildren="Past"
                defaultChecked
                onChange={checked => setForm({
                  ...form,
                  newChart: {
                    ...form.newChart, live: checked
                  }
                })}
              />
              <br />
              <br />
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
                  disabled={form.newChart.live}
                  onChange={moment => setHistoricalDateRange(moment)}
                />
                <Button
                  type="primary"
                  onClick={() => retrieveHistoricalData(ws)}
                >
                  Show
                </Button>
              </Form.Item>

              <Form.Item
                label="Chart Type"
                key="chartType"
                hasFeedback={form.newChart.chartType && form.newChart.chartType.touched}
                validateStatus={form.newChart.chartType && form.newChart.chartType.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Chart Type"
                  id="chartType"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Chart Mode"
                key="chartMode"
                hasFeedback={form.newChart.chartMode && form.newChart.chartMode.touched}
                validateStatus={form.newChart.chartMode && form.newChart.chartMode.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Chart Mode"
                  id="chartMode"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Node Process"
                key="nodeProcess"
                hasFeedback={form.newChart.nodeProcess && form.newChart.nodeProcess.touched}
                validateStatus={form.newChart.nodeProcess && form.newChart.nodeProcess.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Node Process"
                  id="nodeProcess"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="X Data Key"
                key="XDataKey"
                hasFeedback={form.newChart.XDataKey && form.newChart.XDataKey.touched}
                validateStatus={form.newChart.XDataKey && form.newChart.XDataKey.changed ? 'success' : ''}
              >
                <Input
                  placeholder="X Data Key"
                  id="XDataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Y Data Key"
                key="YDataKey"
                hasFeedback={form.newChart.YDataKey && form.newChart.YDataKey.touched}
                validateStatus={form.newChart.YDataKey && form.newChart.YDataKey.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Y Data Key"
                  id="YDataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Marker Color"
                key="markerColor"
                hasFeedback={form.newChart.markerColor && form.newChart.markerColor.touched}
                validateStatus={form.newChart.markerColor && form.newChart.markerColor.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Marker Color"
                  id="markerColor"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Legend Label"
                key="legendLabel"
                hasFeedback={form.newChart.legendLabel && form.newChart.legendLabel.touched}
                validateStatus={form.newChart.legendLabel && form.newChart.legendLabel.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Legend Label"
                  id="legendLabel"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                />
              </Form.Item>

              <Button
                type="dashed"
                block
                onClick={() => {
                  chartsState.push({
                    nodeProcess: form.newChart.nodeProcess,
                    XDataKey: form.newChart.XDataKey,
                    YDataKey: form.newChart.YDataKey,
                    markerColor: form.newChart.markerColor,
                    legendLabel: form.newChart.legendLabel
                  });

                  plotsState.push({
                    x: [],
                    y: [],
                    type: form.newChart.chartType,
                    marker: {
                      color: form.newChart.markerColor
                    },
                    mode: form.newChart.chartMode,
                    name: form.newChart.chartName
                  });
                }}
              >
                Add Chart
              </Button>
            </Panel>
          </Collapse>
          <br />
        </Form>
      )}
      handleLiveSwitchChange={checked => setLiveSwitch(checked)}
    >
      <Plot
        id="plot"
        className="w-full"
        data={plotsState}
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
  /** General chart options */
  chart: PropTypes.shape({
    XDataKey: PropTypes.string
  }).isRequired,
  /** Charts to plot */
  charts: PropTypes.arrayOf(
    PropTypes.shape({
      /** Whether the chart displays live values */
      live: PropTypes.bool,
      /** Name of the node process to listen to */
      nodeProcess: PropTypes.string,
      /** Data key to plot on the y-axis */
      YDataKey: PropTypes.string,
      /** Color of marker on chart */
      markerColor: PropTypes.string,
      /** Name of marker on the chart */
      legendLabel: PropTypes.string
    })
  ).isRequired,
  /** Plot options for each chart */
  plots: PropTypes.arrayOf(
    PropTypes.shape({
      /**  */
      x: PropTypes.arrayOf(PropTypes.any),
      /** */
      y: PropTypes.arrayOf(PropTypes.any),
      /** */
      type: PropTypes.string,
      /** */
      marker: PropTypes.shape({
        color: PropTypes.string
      }),
      /** */
      mode: PropTypes.string,
      /** */
      name: PropTypes.string
    })
  ).isRequired,
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
