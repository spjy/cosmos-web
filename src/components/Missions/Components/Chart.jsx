import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, DatePicker, Button, Switch, Collapse, Icon, Divider
} from 'antd';
import Plot from 'react-plotly.js';

import BaseComponent from '../BaseComponent';
import { Context } from '../../../store/neutron1';
import socket from '../../../socket';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const ws = socket('query', '/query/');

/**
 * Display data on a chart.
 */
function Chart({
  name,
  subheader,
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
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state managing the node process being looked at */
  const [nodeProcessState, setNodeProcessState] = useState(nodeProc);
  /** The state that manages the component's X-axis data key displayed */
  const [XDataKeyState, setXDataKeyState] = useState(XDataKey);
  /** The state that manages the component's X-axis data key displayed */
  const [YDataKeyState, setYDataKeyState] = useState(YDataKey);
  /** Storage for form values */
  const [form, setForm] = useState({
    newChart: {
      live: true
    },
    0: {},
    1: {},
    2: {}
  });
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

  /** Storage for date range of historical data query */
  const [historicalDateRange, setHistoricalDateRange] = useState([]);
  /** Storage for historical data display */
  const [historicalData, setHistoricalData] = useState([]);

  /** Accessing the neutron1 node process context and drilling down */
  const { state: { [nodeProcessState]: nodeProcess } } = useContext(Context);

  /** Plot data storage */
  const [plotsState, setPlotsState] = useState(plots);

  useEffect(() => {
    // Make an object for each plot's form
    for (let i = 0; i < plotsState.length; i = i + 1) {
      setForm({
        ...form,
        [i]: {}
      });
    }

    console.log(form);
  }, []);

  // useEffect(() => {
  //   /** Get data from queried data */
  //   ws.onmessage = ({ data }) => {
  //     let json;

  //     try {
  //       json = JSON.parse(data);

  //       // Reset chart for past data
  //       plotsState[0].x = [];
  //       plotsState[0].y = [];

  //       // Insert past data into chart
  //       json.forEach((d) => {
  //         plotsState[plotsState.length - 1].x.push(processXDataKey(d[XDataKeyState]));
  //         plotsState[plotsState.length - 1].y.push(processYDataKey(d[YDataKeyState]));

  //         layout.datarevision = layout.datarevision + 1;
  //         setDataRevision(dataRevision + 1);
  //       });
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, []);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    plotsState.forEach((p, i) => {
      if (nodeProcess && nodeProcess[XDataKeyState] && nodeProcess[p.YDataKey] && liveSwitch) {
        plotsState[i].x.push(processXDataKey(nodeProcess[XDataKeyState]));
        plotsState[i].y.push(processYDataKey(nodeProcess[p.YDataKey]));

        layout.datarevision = layout.datarevision + 1;
        setDataRevision(dataRevision + 1);
      }
    });
  }, [nodeProcess]);

  /** Reset the chart if switched from past to present mode */
  useEffect(() => {
    if (liveSwitch) {
      plotsState[0].x = [];
      plotsState[0].y = [];
    }
  }, [liveSwitch]);

  const retrieveHistoricalData = (plot) => {
    const query = socket('query', '/query/');

    if (form[plot].dateRange.value.length === 2) {
      // Unix time to modified julian date
      const from = ((form[plot].dateRange.value[0].unix() / 86400.0) + 2440587.5 - 2400000.5);
      const to = ((form[plot].dateRange.value[1].unix() / 86400.0) + 2440587.5 - 2400000.5);

      query.send(
        `database=agent_dump?collection=${plotsState[plot].nodeProcess}?multiple=true?query={"utc": { "$gt": ${from}, "$lt": ${to} }}`
      );
    }

    query.onmessage = ({ data }) => {
      try {
        const json = JSON.parse(data);

        console.log(json);

        // Reset chart for past data
        plotsState[plot].x = [];
        plotsState[plot].y = [];

        // Insert past data into chart
        json.forEach((d) => {
          plotsState[plot].x.push(processXDataKey(d[XDataKeyState]));
          plotsState[plot].y.push(processYDataKey(d[YDataKeyState]));

          layout.datarevision = layout.datarevision + 1;
          setDataRevision(dataRevision + 1);
        });

        query.close();
      } catch (err) {
        console.log(err);
      }
    };
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
      subheader={(
        <span>
          <Divider type="vertical" />
          {
            plotsState.map((plot) => {
              return (
                <span>
                  <span className="inline-block rounded-full mr-1 indicator" style={{ height: '6px', width: '6px', marginBottom: '2px', backgroundColor: plot.marker.color }} />
                  <span className="font-semibold">
                    {plot.nodeProcess}
                  </span>
                  &nbsp;-&nbsp;
                  {plot.YDataKey}
                  <Divider type="vertical" />
                </span>
              );
            })
          }
        </span>
      )}
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
                setForm({ ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={name}
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
              defaultValue={XDataKeyState}
            />
          </Form.Item>

          <Collapse
            bordered
          >
            {
              plotsState.map((plot, i) => {
                return (
                  <Panel
                    header={(
                      <span>
                        <span className="inline-block rounded-full mr-1 indicator" style={{ height: '6px', width: '6px', marginBottom: '2px', backgroundColor: plot.marker.color }} />
                        {plot.nodeProcess}
                        &nbsp;
                        <span className="text-gray-600">
                          {plot.YDataKey} vs. {XDataKeyState}
                        </span>
                      </span>
                    )}
                    key={i}
                    extra={(
                      <div
                        onClick={event => event.stopPropagation()}
                      >
                        <Switch
                          checkedChildren="Live"
                          unCheckedChildren="Past"
                          defaultChecked
                          onChange={checked => setForm({
                            ...form,
                            [i]: {
                              ...form[i], live: checked
                            }
                          })}
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
                      hasFeedback={form[i].dateRange && form[i].dateRange.touched}
                      validateStatus={form[i].dateRange && form[i].dateRange.changed ? 'success' : ''}
                    >
                      <RangePicker
                        className="mr-1"
                        id="dateRange"
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        disabled={form[i].live}
                        onChange={moment => setForm({ ...form, [i]: { ...form[i], dateRange: { ...form[i].dateRange, value: moment } } })}
                      />
                      <Button
                        type="primary"
                        onClick={() => retrieveHistoricalData(i)}
                        disabled={form[i].live}
                      >
                        Show
                      </Button>
                    </Form.Item>

                    <Form.Item
                      label="Name"
                      key="name"
                      hasFeedback={form[i].name && form[i].name.touched}
                      validateStatus={form[i].name && form[i].name.changed ? 'success' : ''}
                    >
                      <Input
                        placeholder="Name"
                        id="name"
                        onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                        onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                        onBlur={({ target: { id: item, value } }) => {
                          plotsState[i].name = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={plot.name}
                      />
                    </Form.Item>


                    <Form.Item
                      label="Chart Type"
                      key="chartType"
                      hasFeedback={form[i].chartType && form[i].chartType.touched}
                      validateStatus={form[i].chartType && form[i].chartType.changed ? 'success' : ''}
                    >
                      <Input
                        placeholder="Chart Type"
                        id="chartType"
                        onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                        onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                        onBlur={({ target: { id: item, value } }) => {
                          plotsState[i].type = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={plot.type}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Chart Mode"
                      key="chartMode"
                      hasFeedback={form[i].chartMode && form[i].chartMode.touched}
                      validateStatus={form[i].chartMode && form[i].chartMode.changed ? 'success' : ''}
                    >
                      <Input
                        placeholder="Chart Mode"
                        id="chartMode"
                        onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                        onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                        onBlur={({ target: { id: item, value } }) => {
                          plotsState[i].mode = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={plot.mode}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Node Process"
                      key="nodeProcess"
                      hasFeedback={form[i].nodeProcess && form[i].nodeProcess.touched}
                      validateStatus={form[i].nodeProcess && form[i].nodeProcess.changed ? 'success' : ''}
                    >
                      <Input
                        placeholder="Node Process"
                        id="nodeProcess"
                        onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                        onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                        onBlur={({ target: { id: item, value } }) => {
                          plotsState[i].nodeProcess = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={plot.nodeProcess}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Y Data Key"
                      key="YDataKey"
                      hasFeedback={form[i].YDataKey && form[i].YDataKey.touched}
                      validateStatus={form[i].YDataKey && form[i].YDataKey.changed ? 'success' : ''}
                    >
                      <Input
                        placeholder="Y Data Key"
                        id="YDataKey"
                        onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                        onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                        onBlur={({ target: { id: item, value } }) => {
                          plotsState[i].YDataKey = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={plot.YDataKey}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Marker Color"
                      key="markerColor"
                      hasFeedback={form[i].markerColor && form[i].markerColor.touched}
                      validateStatus={form[i].markerColor && form[i].markerColor.changed ? 'success' : ''}
                    >
                      <Input
                        placeholder="Marker Color"
                        id="markerColor"
                        onFocus={({ target: { id: item } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                        onChange={({ target: { id: item, value } }) => setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                        onBlur={({ target: { id: item, value } }) => {
                          plotsState[i].marker.color = value;
                          setForm({ ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                        }}
                        defaultValue={plot.marker.color}
                      />
                    </Form.Item>
                  </Panel>
                );
              })
            }
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
                hasFeedback={form.newChart.dateRange && form.newChart.dateRange.touched}
                validateStatus={form.newChart.dateRange && form.newChart.dateRange.changed ? 'success' : ''}
              >
                <RangePicker
                  className="mr-1"
                  id="dateRange"
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  disabled={form.newChart.live}
                  onChange={moment => setForm({ ...form, newChart: { ...form.newChart, dateRange: { ...form.newChart.dateRange, value: moment } } })}
                />
              </Form.Item>

              <Form.Item
                label="Name"
                key="name"
                hasFeedback={form.newChart.name && form.newChart.name.touched}
                validateStatus={form.newChart.name && form.newChart.name.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Name"
                  id="name"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
                  }}
                />
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

              <Button
                type="dashed"
                block
                onClick={() => {
                  setForm({
                    ...form,
                    newChart: {
                      live: form.newChart.live.value
                    }
                  });

                  plotsState.push({
                    live: form.newChart.live.value,
                    x: [],
                    y: [],
                    type: form.newChart.chartType.value,
                    marker: {
                      color: form.newChart.markerColor.value
                    },
                    mode: form.newChart.chartMode.value,
                    name: form.newChart.name.value,
                    YDataKey: form.newChart.YDataKey.value,
                    nodeProcess: form.newChart.nodeProcess.value
                  });

                  if (!form.newChart.live.value) {
                    retrieveHistoricalData(plotsState.length - 1)
                  }
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
      name: PropTypes.string,
      /** Name of marker on the chart */
      XDataKey: PropTypes.string
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
      name: PropTypes.string,
      /** Name of the node process to listen to */
      nodeProcess: PropTypes.string,
      /** Data key to plot on the y-axis */
      YDataKey: PropTypes.string,
      /** Whether the chart displays live values */
      live: PropTypes.bool
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
