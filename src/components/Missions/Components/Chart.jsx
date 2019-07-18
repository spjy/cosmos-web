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
const { TextArea } = Input;

/**
 * Display data on a chart.
 */
function Chart({
  name,
  plots,
  nodeProc,
  XDataKey,
  processXDataKey,
  processYDataKey,
  showStatus,
  status,
  children
}) {
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state managing the node process being looked at */
  const [nodeProcessState, setNodeProcessState] = useState(nodeProc);
  /** The state that manages the component's X-axis data key displayed */
  const [XDataKeyState, setXDataKeyState] = useState(XDataKey);
  /** Storage for form values */
  const [form, setForm] = useState({
    newChart: {
      live: true
    }
  });
  /** Counter determining when the plot should be updated */
  const [dataRevision, setDataRevision] = useState(0);
  /** Layout parameters for the plot */
  const [layout] = useState({
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
  /** Store to detect whether the user wants to get historical data to plot */
  const [retrievePlotHistory, setRetrievePlotHistory] = useState(null);
  /** Accessing the neutron1 node process context and drilling down */
  const { state: { [nodeProcessState]: nodeProcess } } = useContext(Context);

  /** Plot data storage */
  const [plotsState] = useState(plots);

  /** Initialize form slots for each plot */
  useEffect(() => {
    // Make an object for each plot's form
    for (let i = 0; i < plotsState.length; i += 1) {
      form[i] = {};
    }
  }, []);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    plotsState.forEach((p, i) => {
      // Upon context change, see if changes affect this chart's values
      if (nodeProcess && nodeProcess[XDataKeyState] && nodeProcess[p.YDataKey] && p.live) {
        // If so, push to arrays and update data
        plotsState[i].x.push(processXDataKey(nodeProcess[XDataKeyState]));
        plotsState[i].y.push(processYDataKey(nodeProcess[p.YDataKey]));

        layout.datarevision += 1;
        setDataRevision(dataRevision + 1);
      }
    });
  }, [nodeProcess]);

  /** Handle the collection of historical data */
  useEffect(() => {
    if (retrievePlotHistory !== null) {
      const query = socket('query', '/query/');

      query.onopen = () => {
        // Check to see if user chose a range of dates
        if (form[retrievePlotHistory].dateRange.value.length === 2) {
          // Unix time to modified julian date
          const from = ((form[retrievePlotHistory].dateRange.value[0].unix() / 86400.0) + 2440587.5 - 2400000.5);
          const to = ((form[retrievePlotHistory].dateRange.value[1].unix() / 86400.0) + 2440587.5 - 2400000.5);

          query.send(
            `database=agent_dump?collection=${plotsState[retrievePlotHistory].nodeProcess}?multiple=true?query={"utc": { "$gt": ${from}, "$lt": ${to} }}`
          );
        }

        query.onmessage = ({ data }) => {
          try {
            const json = JSON.parse(data);

            plotsState[retrievePlotHistory].live = false;

            // Reset chart for past data
            plotsState[retrievePlotHistory].x = [];
            plotsState[retrievePlotHistory].y = [];

            // Insert past data into chart
            json.forEach((d) => {
              plotsState[retrievePlotHistory].x.push(processXDataKey(d[XDataKeyState]));
              plotsState[retrievePlotHistory].y.push(processYDataKey(d[plotsState[retrievePlotHistory].YDatakey]));

              layout.datarevision += 1;
              setDataRevision(dataRevision + 1);
            });

            query.close();

            // Reset state to null to allow for detection of future plot history requests
            setRetrievePlotHistory(null);
          } catch (err) {
            console.log(err);
          }
        };
      };
    }
  }, [retrievePlotHistory]);

  return (
    <BaseComponent
      name={nameState}
      subheader={(
        <span>
          <Divider type="vertical" />
          {
            plotsState.map((plot, i) => {
              return (
                <span key={i}>
                  <span className="inline-block rounded-full mr-2 indicator" style={{ height: '6px', width: '6px', marginBottom: '2px', backgroundColor: plot.marker.color }} />
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
      liveOnly
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
                setXDataKeyState(value);
                setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], changed: true } } });
              }}
              defaultValue={XDataKeyState}
            />
          </Form.Item>

          {/* <Form.Item
            label="Process X Data Key"
            key="processXDataKey"
            hasFeedback={form.newChart.processXDataKey && form.newChart.processXDataKey.touched}
            validateStatus={form.newChart.processXDataKey && form.newChart.processXDataKey.changed ? 'success' : ''}
          >
            <TextArea
              placeholder="Process X Data Key"
              id="processXDataKey"
              onFocus={({ target: { id: item } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], touched: true, changed: false } } })}
              onChange={({ target: { id: item, value } }) => setForm({ ...form, newChart: { ...form.newChart, [item]: { ...form.newChart[item], value, changed: false } } })}
              onBlur={({ target: { id: item, value } }) => {
                processXDataKeyFunction = eval(value);
              }}
              defaultValue={'(value) => {\n\t// code to process value here \n}'}
            />
          </Form.Item> */}

          <Collapse
            bordered
          >
            {
              plotsState.map((plot, i) => {
                return (
                  <Panel
                    header={(
                      <span className="text-gray-600">
                        <span className="inline-block rounded-full mr-2 indicator" style={{ height: '6px', width: '6px', marginBottom: '2px', backgroundColor: plot.marker.color }} />
                        <strong>
                          {plot.nodeProcess}
                        </strong>
                        &nbsp;
                        <span>
                          {plot.YDataKey}
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
                          defaultChecked={plot.live}
                          onChange={(checked) => {
                            plotsState[i].live = checked;

                            setForm({
                              ...form,
                              [i]: {
                                ...form[i], live: checked
                              }
                            });
                          }}
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
                      hasFeedback={form[i] && form[i].dateRange && form[i].dateRange.touched}
                      validateStatus={form[i] && form[i].dateRange && form[i].dateRange.changed ? 'success' : ''}
                    >
                      <RangePicker
                        className="mr-1"
                        id="dateRange"
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        disabled={form[i] && form[i].live}
                        onChange={moment => setForm({ ...form, [i]: { ...form[i], dateRange: { ...form[i].dateRange, value: moment } } })}
                      />
                      <Button
                        type="primary"
                        onClick={() => setRetrievePlotHistory(i)}
                        disabled={form[i] && form[i].live}
                      >
                        Show
                      </Button>
                    </Form.Item>

                    <Form.Item
                      label="Name"
                      key="name"
                      hasFeedback={form[i] && form[i].name && form[i].name.touched}
                      validateStatus={form[i] && form[i].name && form[i].name.changed ? 'success' : ''}
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
                      hasFeedback={form[i] && form[i].chartType && form[i].chartType.touched}
                      validateStatus={form[i] && form[i].chartType && form[i].chartType.changed ? 'success' : ''}
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
                      hasFeedback={form[i] && form[i].chartMode && form[i].chartMode.touched}
                      validateStatus={form[i] && form[i].chartMode && form[i].chartMode.changed ? 'success' : ''}
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
                      hasFeedback={form[i] && form[i].nodeProcess && form[i].nodeProcess.touched}
                      validateStatus={form[i] && form[i].nodeProcess && form[i].nodeProcess.changed ? 'success' : ''}
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
                      hasFeedback={form[i] && form[i].YDataKey && form[i].YDataKey.touched}
                      validateStatus={form[i] && form[i].YDataKey && form[i].YDataKey.changed ? 'success' : ''}
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
                      hasFeedback={form[i] && form[i].markerColor && form[i].markerColor.touched}
                      validateStatus={form[i] && form[i].markerColor && form[i].markerColor.changed ? 'success' : ''}
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
                  value={form.newChart.name ? form.newChart.name.value : ''}
                />
              </Form.Item>

              <Form.Item
                required
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
                  value={form.newChart.chartType ? form.newChart.chartType.value : ''}
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
                  value={form.newChart.chartMode ? form.newChart.chartMode.value : ''}
                />
              </Form.Item>

              <Form.Item
                required
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
                  value={form.newChart.nodeProcess ? form.newChart.nodeProcess.value : ''}
                />
              </Form.Item>

              <Form.Item
                required
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
                  value={form.newChart.YDataKey ? form.newChart.YDataKey.value : ''}
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
                  value={form.newChart.markerColor ? form.newChart.markerColor.value : ''}
                />
              </Form.Item>

              <Button
                type="dashed"
                block
                onClick={() => {
                  // Check if required values are here
                  if (form.newChart.chartType.value && form.newChart.nodeProcess.value && form.newChart.YDataKey.value) {
                    // Make form slots for new plot
                    setForm({
                      ...form,
                      newChart: {
                        live: form.newChart.live
                      },
                      [plotsState.length]: {}
                    });

                    // Create chart
                    plotsState.push({
                      live: form.newChart.live,
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

                    // Clear form values
                    form.newChart.name.value = '';
                    form.newChart.markerColor.value = '';
                    form.newChart.chartMode.value = '';
                    form.newChart.YDataKey.value = '';
                    form.newChart.nodeProcess.value = '';
                    form.newChart.chartType.value = '';

                    // If not live, retrieve the data from database
                    if (!form.newChart.live) {
                      setRetrievePlotHistory(plotsState.length);
                    }
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
      {children}
    </BaseComponent>
  );
}

Chart.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
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
  ),
  /** JSON object of data */
  nodeProc: PropTypes.string,
  /** X-axis key to display from the data JSON object above */
  XDataKey: PropTypes.string,
  /** Function to process the X-axis key */
  processXDataKey: PropTypes.func,
  /** Function to process the Y-axis key */
  processYDataKey: PropTypes.func,
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
  children: PropTypes.node
};

Chart.defaultProps = {
  name: '',
  plots: [],
  nodeProc: null,
  XDataKey: null,
  processXDataKey: x => x,
  processYDataKey: y => y,
  showStatus: false,
  status: 'error',
  children: null
};

export default Chart;
