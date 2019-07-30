import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, InputNumber, DatePicker, Button, Switch, Collapse, Divider, Select,
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
  XDataKey,
  processXDataKey,
  children,
}) {
  let processXDataKeyState = processXDataKey;
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** The state that manages the component's X-axis data key displayed */
  const [XDataKeyState, setXDataKeyState] = useState(XDataKey);

  const [form, setForm] = useState({
    newValue: {
      live: true,
    },
  });

  const [formError, setFormError] = useState('');
  /** Counter determining when the plot should be updated */
  const [dataRevision, setDataRevision] = useState(0);
  /** Layout parameters for the plot */
  const [layout] = useState({
    autosize: true,
    uirevision: 0,
    datarevision: dataRevision,
    paper_bgcolor: '#FBFBFB',
    plot_bgcolor: '#FBFBFB',
    showlegend: true,
    legend: {
      orientation: 'h',
    },
    margin: {
      r: 10,
      t: 10,
      b: 15,
    },
  });
  /** Store to detect whether the user wants to get historical data to plot */
  const [retrievePlotHistory, setRetrievePlotHistory] = useState(null);
  /** Accessing the neutron1 node process context and drilling down */
  const { state } = useContext(Context);

  /** Plot data storage */
  const [plotsState, setPlotsState] = useState(plots);

  /** Initialize form slots for each plot */
  useEffect(() => {
    // Make an object for each plot's form
    for (let i = 0; i < plotsState.length; i += 1) {
      form[i] = {
        live: plotsState[i].live,
      };
    }
  }, []);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    plotsState.forEach((p, i) => {
      // Upon context change, see if changes affect this chart's values
      if (state[p.nodeProcess] && state[p.nodeProcess][XDataKeyState] && state[p.nodeProcess][p.YDataKey] && p.live) {
        // If so, push to arrays and update data
        plotsState[i].x.push(processXDataKeyState(state[p.nodeProcess][XDataKeyState]));
        plotsState[i]
          .y
          .push(
            plotsState[i].processYDataKey
              ? plotsState[i].processYDataKey(state[p.nodeProcess][p.YDataKey])
              : state[p.nodeProcess][p.YDataKey],
          );

        layout.datarevision += 1;
        setDataRevision(dataRevision + 1);
      }
    });
  }, [state]);

  /** Handle the collection of historical data */
  useEffect(() => {
    if (retrievePlotHistory !== null) {
      const query = socket('query', '/query/');

      query.onopen = () => {
        // Check to see if user chose a range of dates
        if (form[retrievePlotHistory].dateRange.value.length === 2) {
          // Unix time to modified julian date
          const from = (form[retrievePlotHistory].dateRange.value[0].unix() / 86400.0)
            + 2440587.5 - 2400000.5;
          const to = (form[retrievePlotHistory].dateRange.value[1].unix() / 86400.0)
            + 2440587.5 - 2400000.5;

          query.send(
            `database=agent_dump?collection=${plotsState[retrievePlotHistory].nodeProcess}?multiple=true?query={"utc": { "$gt": ${from}, "$lt": ${to} }}`,
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
              plotsState[retrievePlotHistory]
                .y
                .push(
                  plotsState[retrievePlotHistory]
                    .processYDataKey(d[plotsState[retrievePlotHistory].YDataKey]),
                );

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
        <span className="text-xs">
          {
            plotsState.length === 0 ? 'No charts to display.' : null
          }
          {
            plotsState.length > 0 ? <Divider type="vertical" /> : null
          }
          {
            plotsState.map(plot => (
              <span key={`${plot.nodeProcess}${plot.YDataKey}`}>
                <span
                  className="inline-block rounded-full mr-2 indicator"
                  style={
                    {
                      height: '6px',
                      width: '6px',
                      marginBottom: '2px',
                      backgroundColor: plot.marker.color,
                    }
                  }
                />
                <span className="font-semibold">
                  {plot.nodeProcess}
                </span>
                &nbsp;-&nbsp;
                {plot.YDataKey}
                <Divider type="vertical" />
              </span>
            ))
          }
        </span>
      )}
      liveOnly
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
              onFocus={({ target: { id: item } }) => setForm({
                ...form,
                [item]: {
                  ...form[item],
                  touched: true,
                  changed: false,
                },
              })}
              onChange={({ target: { id: item, value } }) => setForm({
                ...form,
                [item]: {
                  ...form[item],
                  value,
                  changed: false,
                },
              })}
              onBlur={({ target: { id: item, value } }) => {
                setNameState(value);
                setForm({
                  ...form,
                  [item]: {
                    ...form[item],
                    changed: true,
                  },
                });
              }}
              defaultValue={name}
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
              onFocus={({ target: { id: item } }) => setForm({
                ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({
                ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                setXDataKeyState(value);
                setForm({
                  ...form, [item]: { ...form[item], changed: true } });
              }}
              defaultValue={XDataKeyState}
            />
          </Form.Item>

          <Form.Item
            label="Process X Data Key"
            key="processXDataKey"
            hasFeedback={form.processXDataKey && form.processXDataKey.touched}
            validateStatus={form.processXDataKey && form.processXDataKey.changed ? 'success' : ''}
            help={form.processXDataKey && form.processXDataKey.help ? form.processXDataKey.help : 'Define the function body (in JavaScript) here to process the variable "x".'}
          >
            <TextArea
              rows={4}
              placeholder="Process X Data Key"
              id="processXDataKey"
              onFocus={({ target: { id: item } }) => setForm({
                ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={({ target: { id: item, value } }) => setForm({
                ...form, [item]: { ...form[item], value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                if (value.includes('return')) {
                  processXDataKeyState = new Function('x', value);

                  // Convert currently existing values
                  plotsState.forEach((plot, i) => {
                    if (plot[i].x.length > 0) {
                      plot[i].x = plot[i].x.map(x => processXDataKeyState(x));

                      layout.datarevision += 1;
                      setDataRevision(dataRevision + 1);
                    }
                  });

                  setForm({
                    ...form, [item]: { ...form[item], changed: true, help: null } });
                } else {
                  setForm({
                    ...form, [item]: { ...form[item], changed: false, help: 'You must return at least the variable "x".' } });
                }
              }}
              defaultValue={processXDataKey ? processXDataKey.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') : 'return x;'}
            />
          </Form.Item>

          <Form.Item
            label="Y Range"
            key="YRange"
            // hasFeedback={form.YRange && form.YRange.touched}
            // validateStatus={form.YRange && form.YRange.changed ? 'success' : ''}
          >
            <InputNumber
              className="mr-2"
              placeholder="Min"
              id="YRangeMin"
              onFocus={({ target: { id: item } }) => setForm({
                ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={value => setForm({
                ...form, YRangeMin: { ...form.YRangeMin, value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                if (form.YRangeMax && value < form.YRangeMax.value) {
                  setForm({
                    ...form, [item]: { ...form[item], changed: true } });
                }
                setForm({
                  ...form, [item]: { ...form[item], changed: false } });
              }}
            />
            <span
              className="mr-2"
            >
              to
            </span>
            <InputNumber
              className="mr-2"
              placeholder="Max"
              id="YRangeMax"
              onFocus={({ target: { id: item } }) => setForm({
                ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={value => setForm({
                ...form, YRangeMax: { ...form.YRangeMax, value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                if (form.YRangeMin && value > form.YRangeMin.value) {
                  setForm({
                    ...form, [item]: { ...form[item], changed: true } });
                }
                setForm({
                  ...form, [item]: { ...form[item], changed: false } });
              }}
            />

            <Button
              className="mr-2"
              onClick={() => {
                if (form.YRangeMin && form.YRangeMax && form.YRangeMax.value.toString() && form.YRangeMin.value.toString()) {
                  layout.yaxis.range = [form.YRangeMin.value, form.YRangeMax.value];

                  layout.datarevision += 1;
                  layout.uirevision += 1;
                  setDataRevision(dataRevision + 1);
                }
              }}
            >
              Set axes
            </Button>

            <Button
              type="danger"
              onClick={() => {
                delete layout.yaxis.range;
              }}
            >
              Reset axes
            </Button>
          </Form.Item>

          <Form.Item
            label="X Range"
            key="XRange"
            // hasFeedback={form.YRange && form.YRange.touched}
            // validateStatus={form.YRange && form.YRange.changed ? 'success' : ''}
          >
            <InputNumber
              className="mr-2"
              placeholder="Min"
              id="XRangeMin"
              onFocus={({ target: { id: item } }) => setForm({
                ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={value => setForm({
                ...form, XRangeMin: { ...form.XRangeMin, value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                if (form.XRangeMax && value < form.XRangeMax.value) {
                  setForm({
                    ...form, [item]: { ...form[item], changed: true } });
                }
                setForm({
                  ...form, [item]: { ...form[item], changed: false } });
              }}
            />
            <span
              className="mr-2"
            >
              to
            </span>
            <InputNumber
              className="mr-2"
              placeholder="Max"
              id="XRangeMax"
              onFocus={({ target: { id: item } }) => setForm({
                ...form, [item]: { ...form[item], touched: true, changed: false } })}
              onChange={value => setForm({
                ...form, XRangeMax: { ...form.XRangeMax, value, changed: false } })}
              onBlur={({ target: { id: item, value } }) => {
                if (form.XRangeMin && value > form.XRangeMin.value) {
                  setForm({
                    ...form, [item]: { ...form[item], changed: true } });
                }
                setForm({
                  ...form, [item]: { ...form[item], changed: false } });
              }}
            />

            <Button
              className="mr-2"
              onClick={() => {
                if (form.XRangeMin && form.XRangeMax && form.XRangeMax.value.toString() && form.XRangeMin.value.toString()) {
                  layout.xaxis.range = [form.XRangeMin.value, form.XRangeMax.value];

                  layout.datarevision += 1;
                  layout.uirevision += 1;
                  setDataRevision(dataRevision + 1);
                }
              }}
            >
              Set axes
            </Button>

            <Button
              type="danger"
              onClick={() => {
                delete layout.xaxis.range;
              }}
            >
              Reset axes
            </Button>
          </Form.Item>

          <Collapse
            bordered
          >
            {
              plotsState.map((plot, i) => (
                <Panel
                  header={(
                    <span className="text-gray-600">
                      <span
                        className="inline-block rounded-full mr-2 indicator"
                        style={{
                          height: '6px',
                          width: '6px',
                          marginBottom: '2px',
                          backgroundColor: plot.marker.color,
                        }}
                      />
                      <strong>
                        {plot.nodeProcess}
                      </strong>
                      &nbsp;
                      <span>
                        {plot.YDataKey}
                      </span>
                    </span>
                  )}
                  key={`${plot.nodeProcess}${plot.YDataKey}`}
                  extra={(
                    <div
                      onClick={event => event.stopPropagation()}
                      onKeyDown={() => {}}
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
                              ...form[i], live: checked,
                            },
                          });
                        }}
                      />
                      &nbsp;
                      &nbsp;
                      <span
                        onClick={(event) => {
                          event.stopPropagation();

                          setPlotsState(plotsState.filter((plots, j) => j !== i));
                        }}
                      >
                        X
                      </span>
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
                      onChange={moment => setForm({
                        ...form, [i]: { ...form[i], dateRange: { ...form[i].dateRange, value: moment } } })}
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
                      onFocus={({ target: { id: item } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        plotsState[i].name = value;
                        setForm({
                          ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
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
                      onFocus={({ target: { id: item } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        plotsState[i].type = value;
                        setForm({
                          ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
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
                      onFocus={({ target: { id: item } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        plotsState[i].mode = value;
                        setForm({
                          ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
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
                      onFocus={({ target: { id: item } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        plotsState[i].nodeProcess = value;
                        setForm({
                          ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
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
                      onFocus={({ target: { id: item } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        plotsState[i].YDataKey = value;
                        setForm({
                        
                          ...form,
                          [i]: {
                            ...form[i],
                            [item]: {
                              ...form[i][item],
                              changed: true,
                            },
                          },
                        });
                      }}
                      defaultValue={plot.YDataKey}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Process Y Data Key"
                    key="processYDataKey"
                    hasFeedback={form[i] && form[i].processYDataKey && form[i].processYDataKey.touched}
                    validateStatus={form[i] && form[i].processYDataKey && form[i].processYDataKey.changed ? 'success' : ''}
                    help={form[i] && form[i].processYDataKey && form[i].processYDataKey.help ? form[i].processYDataKey.help : 'Define the function body (in JavaScript) here to process the variable "x".'}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Process Y Data Key"
                      id="processYDataKey"
                      onFocus={({ target: { id: item } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        if (value.includes('return')) {
                          // eslint-disable-next-line
                          plotsState[i].processYDataKey = new Function('x', value);
                          
                          // Convert currently existing values
                          if (plotsState[i].y.length > 0) {
                            plotsState[i].y = plotsState[i].y.map(y => plotsState[i].processYDataKey(y));

                            layout.datarevision += 1;
                            setDataRevision(dataRevision + 1);
                          }

                          setForm({
                            ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true, help: null } } });
                        } else {
                          setForm({
                            ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: false, help: 'You must return at least the variable "x".' } } });
                        }
                      }}
                      defaultValue={plot.processYDataKey ? plot.processYDataKey.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') : 'return x;'}
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
                      onFocus={({ target: { id: item } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], touched: true, changed: false } } })}
                      onChange={({ target: { id: item, value } }) => setForm({
                        ...form, [i]: { ...form[i], [item]: { ...form[i][item], value, changed: false } } })}
                      onBlur={({ target: { id: item, value } }) => {
                        plotsState[i].marker.color = value;
                        setForm({
                          ...form, [i]: { ...form[i], [item]: { ...form[i][item], changed: true } } });
                      }}
                      defaultValue={plot.marker.color}
                    />
                  </Form.Item>
                </Panel>
              ))
            }
            <Panel header="Add Chart" key="3">
              <Switch
                checkedChildren="Live"
                unCheckedChildren="Past"
                defaultChecked
                onChange={checked => setForm({
                  ...form,
                  newValue: {
                    ...form.newValue,
                    live: checked,
                  },
                })}
              />
              <br />
              <br />
              <Form.Item
                className="w-auto"
                label="Historical Date Range"
                key="dateRange"
                hasFeedback={form.newValue.dateRange && form.newValue.dateRange.touched}
                validateStatus={form.newValue.dateRange && form.newValue.dateRange.changed ? 'success' : ''}
              >
                <RangePicker
                  className="mr-1"
                  id="dateRange"
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  disabled={form.newValue.live}
                  onChange={moment => setForm({ ...form, newValue: { ...form.newValue, dateRange: { ...form.newValue.dateRange, value: moment } } })}
                />
              </Form.Item>

              <Form.Item
                label="Name"
                key="name"
                hasFeedback={form.newValue.name && form.newValue.name.touched}
                validateStatus={form.newValue.name && form.newValue.name.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Name"
                  id="name"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], value, changed: false } } })}
                  onBlur={({ target: { id: item } }) => {
                    setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], changed: true } } });
                  }}
                  value={form.newValue.name ? form.newValue.name.value : ''}
                />
              </Form.Item>

              <Form.Item
                required
                label="Chart Type"
                key="chartType"
                hasFeedback={form.newValue.chartType && form.newValue.chartType.touched}
                validateStatus={form.newValue.chartType && form.newValue.chartType.changed ? 'success' : ''}
              >
                <Select
                  showSearch
                  placeholder="Chart Type"
                  onFocus={() => setForm({ ...form, newValue: { ...form.newValue, chartType: { ...form.newValue.chartType, touched: true, changed: false } } })}
                  onChange={value => setForm({ ...form, newValue: { ...form.newValue, chartType: { ...form.newValue.chartType, value, changed: false } } })}
                  onBlur={() => {
                    setForm({ ...form, newValue: { ...form.newValue, chartType: { ...form.newValue.chartType, changed: true } } });
                  }}
                >
                  <Select.Option value="scatter">scatter</Select.Option>
                  <Select.Option value="sankey">sankey</Select.Option>
                  <Select.Option value="histogram2contour">histogram2contour</Select.Option>
                  <Select.Option value="barpolar">barpolar</Select.Option>
                  <Select.Option value="parcoords">parcoords</Select.Option>
                  <Select.Option value="scatterpolargl">scatterpolargl</Select.Option>
                  <Select.Option value="candlestick">candlestick</Select.Option>
                  <Select.Option value="choropleth">choropleth</Select.Option>
                  <Select.Option value="bar">bar</Select.Option>
                  <Select.Option value="box">box</Select.Option>
                  <Select.Option value="scattergeo">scattergeo</Select.Option>
                  <Select.Option value="histogram2d">histogram2d</Select.Option>
                  <Select.Option value="splom">splom</Select.Option>
                  <Select.Option value="heatmapgl">heatmapgl</Select.Option>
                  <Select.Option value="waterfall">waterfall</Select.Option>
                  <Select.Option value="volume">volume</Select.Option>
                  <Select.Option value="scatterternary">scatterternary</Select.Option>
                  <Select.Option value="histogram">histogram</Select.Option>
                  <Select.Option value="scattergl">scattergl</Select.Option>
                  <Select.Option value="sunburst">sunburst</Select.Option>
                  <Select.Option value="pointcloud">pointcloud</Select.Option>
                  <Select.Option value="scatter3d">scatter3d</Select.Option>
                  <Select.Option value="scattermapbox">scattermapbox</Select.Option>
                  <Select.Option value="heatmap">heatmap</Select.Option>
                  <Select.Option value="parcats">parcats</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Chart Mode"
                key="chartMode"
                hasFeedback={form.newValue.chartMode && form.newValue.chartMode.touched}
                validateStatus={form.newValue.chartMode && form.newValue.chartMode.changed ? 'success' : ''}
              >
                <Select
                  showSearch
                  placeholder="Chart Mode"
                  onFocus={() => setForm({ ...form, newValue: { ...form.newValue, chartMode: { ...form.newValue.chartMode, touched: true, changed: false } } })}
                  onChange={value => setForm({ ...form, newValue: { ...form.newValue, chartMode: { ...form.newValue.chartMode, value, changed: false } } })}
                  onBlur={() => {
                    setForm({ ...form, newValue: { ...form.newValue, chartMode: { ...form.newValue.chartMode, changed: true } } });
                  }}
                >
                  <Select.Option value="lines">lines</Select.Option>
                  <Select.Option value="markers">markers</Select.Option>
                  <Select.Option value="text">text</Select.Option>
                  <Select.Option value="lines+markers">lines+markers</Select.Option>
                  <Select.Option value="lines+markers+text">lines+markers+text</Select.Option>
                  <Select.Option value="none">none</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                required
                label="Node Process"
                key="nodeProcess"
                hasFeedback={form.newValue.nodeProcess && form.newValue.nodeProcess.touched}
                validateStatus={form.newValue.nodeProcess && form.newValue.nodeProcess.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Node Process"
                  id="nodeProcess"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], value, changed: false } } })}
                  onBlur={({ target: { id: item } }) => {
                    setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], changed: true } } });
                  }}
                  value={form.newValue.nodeProcess ? form.newValue.nodeProcess.value : ''}
                />
              </Form.Item>

              <Form.Item
                required
                label="Y Data Key"
                key="YDataKey"
                hasFeedback={form.newValue.YDataKey && form.newValue.YDataKey.touched}
                validateStatus={form.newValue.YDataKey && form.newValue.YDataKey.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Y Data Key"
                  id="YDataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], value, changed: false } } })}
                  onBlur={({ target: { id: item } }) => {
                    setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], changed: true } } });
                  }}
                  value={form.newValue.YDataKey ? form.newValue.YDataKey.value : ''}
                />
              </Form.Item>

              <Form.Item
                label="Process Y Data Key"
                key="processYDataKey"
                hasFeedback={form.newValue.processYDataKey && form.newValue.processYDataKey.touched}
                validateStatus={form.newValue.processYDataKey && form.newValue.processYDataKey.changed ? 'success' : ''}
                help={form.newValue.processYDataKey && form.newValue.processYDataKey.help ? form.newValue.processYDataKey.help : 'Define the function body (in JavaScript) here to process the variable "x".'}
              >
                <TextArea
                  rows={4}
                  placeholder="Process Y Data Key"
                  id="processYDataKey"
                  onFocus={({ target: { id: item } }) => setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], value, changed: false } } })}
                  onBlur={({ target: { id: item, value } }) => {
                    if (value.includes('return')) {
                      setForm({
                        ...form,
                        newValue: {
                          ...form.newValue,
                          [item]: {
                            ...form.newValue[item],
                            // eslint-disable-next-line
                            value: new Function('x', value),
                            changed: true,
                            help: null,
                          },
                        },
                      });
                    } else {
                      setForm({ ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], changed: false, help: 'You must return at least the variable "x".' } } });
                    }
                  }}
                  value={form.newValue.processYDataKey && form.newValue.processYDataKey.value ? form.newValue.processYDataKey.value.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '') : ''}
                />
              </Form.Item>

              <Form.Item
                label="Marker Color"
                key="markerColor"
                hasFeedback={form.newValue.markerColor && form.newValue.markerColor.touched}
                validateStatus={form.newValue.markerColor && form.newValue.markerColor.changed ? 'success' : ''}
              >
                <Input
                  placeholder="Marker Color"
                  id="markerColor"
                  onFocus={({ target: { id: item } }) => setForm({
                    ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], touched: true, changed: false } } })}
                  onChange={({ target: { id: item, value } }) => setForm({
                    ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], value, changed: false } } })}
                  onBlur={({ target: { id: item } }) => {
                    setForm({
                      ...form, newValue: { ...form.newValue, [item]: { ...form.newValue[item], changed: true } },
                    });
                  }}
                  value={form.newValue.markerColor ? form.newValue.markerColor.value : ''}
                />
              </Form.Item>

              <div className="text-red-500 mb-3">
                {formError}
              </div>

              <Button
                type="dashed"
                block
                onClick={() => {
                  // Check if required values are here
                  if (!form.newValue.chartType || !form.newValue.chartType.value) {
                    setFormError('Check the "Chart Type" field. It is required.');
                    return;
                  }

                  if (!form.newValue.nodeProcess || !form.newValue.nodeProcess.value) {
                    setFormError('Check the "Node Process" field. It is required.');
                    return;
                  }

                  if (!form.newValue.YDataKey || !form.newValue.YDataKey.value) {
                    setFormError('Check the "Y Data Key" field. It is required.');
                    return;
                  }
                  // Make form slots for new plot
                  setForm({
                    ...form,
                    newValue: {
                      live: form.newValue.live,
                    },
                    [plotsState.length]: {},
                  });

                  // Create chart
                  plotsState.push({
                    live: form.newValue.live,
                    x: [],
                    y: [],
                    type: form.newValue.chartType.value,
                    marker: {
                      color: form.newValue.markerColor && form.newValue.markerColor.value ? form.newValue.markerColor.value : 'red',
                    },
                    mode: form.newValue.chartMode && form.newValue.chartMode.value ? form.newValue.chartMode.value : null,
                    name: form.newValue.name && form.newValue.name.value ? form.newValue.name.value : '',
                    YDataKey: form.newValue.YDataKey.value,
                    processYDataKey: form.newValue.processYDataKey && form.newValue.processYDataKey.value.includes('return') ? form.newValue.processYDataKey.value : x => x,
                    nodeProcess: form.newValue.nodeProcess.value,
                  });

                  // Clear form values
                  form.newValue.name = {};
                  form.newValue.markerColor = {};
                  form.newValue.chartMode = {};
                  form.newValue.YDataKey = {};
                  form.newValue.processYDataKey = {};
                  form.newValue.nodeProcess = {};
                  form.newValue.chartType = {};

                  // If not live, retrieve the data from database
                  if (!form.newValue.live) {
                    setRetrievePlotHistory(plotsState.length);
                  }

                  setFormError('');
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
          scrollZoom: true,
        }}
        layout={layout}
        revision={dataRevision}
        useResizeHandler
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
      /** Chart y values */
      x: PropTypes.arrayOf(PropTypes.any),
      /** Chart x values */
      y: PropTypes.arrayOf(PropTypes.any),
      /** Chart type */
      type: PropTypes.string,
      /** Chart marker color */
      marker: PropTypes.shape({
        color: PropTypes.string,
      }),
      /** Chart mode */
      mode: PropTypes.string,
      /** Chart name */
      name: PropTypes.string,
      /** Name of the node process to listen to */
      nodeProcess: PropTypes.string,
      /** Data key to plot on the y-axis */
      YDataKey: PropTypes.string,
      /** Whether the chart displays live values */
      live: PropTypes.bool,
    }),
  ),
  /** X-axis key to display from the data JSON object above */
  XDataKey: PropTypes.string,
  /** Function to process the X-axis key */
  processXDataKey: PropTypes.func,
  /** Children node */
  children: PropTypes.node,
};

Chart.defaultProps = {
  name: '',
  plots: [],
  XDataKey: null,
  processXDataKey: x => x,
  children: null,
};

export default Chart;
