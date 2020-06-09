import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Switch,
  Collapse,
  Divider,
  Select,
  message,
  Tag,
  Popconfirm,
} from 'antd';
import {
  ExclamationCircleOutlined,
  DownloadOutlined,
  ClearOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import Plot from 'react-plotly.js';
import { saveAs } from 'file-saver';
import moment from 'moment-timezone';

import BaseComponent from '../BaseComponent';
import { Context } from '../../store/dashboard';
import { query } from '../../socket';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { TextArea } = Input;

/**
 * Display data on a chart using plot.ly. Allows for various plot.ly configurations.
 * On the top bar, it displays the data that is currently being displayed on the chart.
 * It allows for custom configuration such as the chart name,
 * data limit amount and the data key to display on the x axis.
 */
function Chart({
  name,
  dataLimit,
  plots,
  polar,
  XDataKey,
  processXDataKey,
  children,
  height,
}) {
  /** Accessing the neutron1 node process context and drilling down */
  const { state } = useContext(Context);

  /** Storage for global form values */
  const [plotsForm] = Form.useForm();
  /** Form for adding new values */
  const [newForm] = Form.useForm();
  /** Form for editing values */
  const [editForm] = Form.useForm();

  /** Initial form values for editForm */
  const [initialValues, setInitialValues] = useState({});
  /** Store the function to process the X Data Key */
  const [processXDataKeyState, setProcessXDataKeyState] = useState({
    func: processXDataKey,
  });
  /** The state that manages the component's title */
  const [nameState, setNameState] = useState(name);
  /** Specify a limit on the number of data poitns displayed */
  const [dataLimitState, setDataLimitState] = useState(dataLimit);
  /** The state that manages the component's X-axis data key displayed */
  const [XDataKeyState, setXDataKeyState] = useState(XDataKey);
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
      t: 20,
      b: 15,
    },
  });
  /** Store to detect whether the user wants to get historical data to plot */
  const [retrievePlotHistory, setRetrievePlotHistory] = useState(null);
  /** Plot data storage */
  const [plotsState, setPlotsState] = useState(plots);
  /** Variable to update to force component update */
  const [updateComponent, setUpdateComponent] = useState(false);
  /** State to store switch denoting whether added value is live or not */
  const [addChartLive, setAddChartLive] = useState(true);

  /**
   * Use object with keyed time
   * Nested object with key y and value x
   */
  const downloadDataAsCSV = () => {
    const xValues = {}; // to store keyed values
    const yValues = []; // to store dates

    // Get possible y values
    plotsState.forEach((plot) => {
      plot.x.forEach((x, i) => {
        xValues[x] = {
          ...xValues[x],
          [plot.YDataKey]: plot.y[i],
        };
      });

      yValues.push(plot.YDataKey);
    });

    // Sort according to date
    const sortedKeys = Object.keys(xValues).sort();

    // Convert each date object to array
    sortedKeys.forEach((key) => {
      // Save values
      const values = xValues[key];

      // Convert to array without value keys
      xValues[key] = Object.entries(values).map(([, value]) => value);
    });

    // Create blob to download file
    const blob = new Blob(
      [
        [
          ['mjd', 'time', ...yValues].join(','), // columns
          Object.entries(xValues).map(([key, value]) => [(moment(key).unix() / 86400.0) + 2440587.5 - 2400000.5, key, ...value].join(',')).join('\n'), // rows
        ].join('\n'),
      ],
      { type: 'text/csv' },
    );

    // Save csv to computer, named by chart title and date now
    saveAs(blob, `${name.replace(/ /g, '-').toLowerCase()}-${new Date(Date.now()).toISOString()}.csv`);
  };

  const clearAll = () => {
    const emptyArr = plotsState.map((point) => {
      // eslint-disable-next-line no-param-reassign
      point.x = [];
      // eslint-disable-next-line no-param-reassign
      point.y = [];
      return point;
    });
    setPlotsState(emptyArr);
  };

  /** Initialize form slots for each plot to avoid crashing */
  useEffect(() => {
    // Make an object for each plot's form
    let accumulate = {};

    // Initialize form values for each value
    plots.forEach(({
      name: nameVal, nodeProcess, YDataKey, processYDataKey, type, marker, mode, live,
    }, i) => {
      accumulate = {
        ...accumulate,
        [`name_${i}`]: nameVal,
        [`nodeProcess_${i}`]: nodeProcess,
        [`YDataKey_${i}`]: YDataKey,
        [`processYDataKey_${i}`]: processYDataKey
          ? processYDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
          : 'return x',
        [`type_${i}`]: type || 'scatter',
        [`mode_${i}`]: mode || 'markers',
        [`live_${i}`]: live,
        [`marker_${i}`]: marker.color,
      };
    });

    setInitialValues(accumulate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Handle new data incoming from the Context */
  useEffect(() => {
    plotsState.forEach((p, i) => {
      // Upon context change, see if changes affect this chart's values
      if (state[p.nodeProcess]
        && state[p.nodeProcess][XDataKeyState]
        && state[p.nodeProcess][p.YDataKey]
        && p.live
      ) {
        // If so, push to arrays and update data

        // Check if polar or not
        if (polar) {
          plotsState[i].r.push(processXDataKeyState.func(state[p.nodeProcess][XDataKeyState]));
          plotsState[i]
            .theta
            .push(
              plotsState[i].processThetaDataKey
                ? plotsState[i].processThetaDataKey(state[p.nodeProcess][p.YDataKey])
                : state[p.nodeProcess][p.ThetaDataKey],
            );
        } else {
          plotsState[i].x.push(processXDataKeyState.func(state[p.nodeProcess][XDataKeyState]));
          plotsState[i]
            .y
            .push(
              plotsState[i].processYDataKey
                ? plotsState[i].processYDataKey(state[p.nodeProcess][p.YDataKey])
                : state[p.nodeProcess][p.YDataKey],
            );
        }

        // Upon insertion, check if the length of y exceeds the data limit.
        // If so, shift out the #points in the graph - #data limit oldest values
        const dataPoints = plotsState[i].y.length;
        if (dataPoints >= dataLimitState && dataLimitState !== -1) {
          plotsState[i].x.splice(0, dataPoints - dataLimitState + 1);
          plotsState[i].y.splice(0, dataPoints - dataLimitState + 1);
        }

        // Trigger the chart to update
        layout.datarevision += 1;
        setDataRevision(dataRevision + 1);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  /**
   * Retrieve a data key from a nodeProcess between a date range
   * @param {moment[]} dates Array of moment dates, range of dates to retrieve data from
   * @param {string} YDataKey Key to retrieve
   * @param {string} nodeProcess node:process to retrieve data key from
   * @param {number} plot Plot index to modify
   */
  const queryHistoricalData = (dates, YDataKey, nodeProcess, plot) => {
    if (query.OPEN) {
      // Check to see if user chose a range of dates
      if (dates && dates.length === 2) {
        // Unix time to modified julian date
        const from = (dates[0].unix() / 86400.0) + 2440587.5 - 2400000.5;
        const to = (dates[1].unix() / 86400.0) + 2440587.5 - 2400000.5;

        // Retrieve date and YDataKey fields from database, return only those keys
        query.send(
          `database=${process.env.MONGODB_COLLECTION}?collection=${nodeProcess}?multiple=true?query={"node_utc": { "$gt": ${from}, "$lt": ${to} }}?options={"projection": { "${XDataKeyState}": 1, "${YDataKey}": 1 }}`,
        );

        message.loading('Querying data...', 0);
      }

      // Wait for response from query
      query.onmessage = ({ data }) => {
        try {
          const json = JSON.parse(data);

          message.destroy();

          if (json.length === 0) {
            message.warning('No data for specified date range.');
          } else {
            message.success(`Retrieved ${json.length} records.`);
          }

          plotsState[plot].live = false;

          // Reset chart for past data
          plotsState[plot].x = [];
          plotsState[plot].y = [];

          // Insert past data into chart
          json.forEach((d) => {
            plotsState[plot].x.push(processXDataKeyState.func(d[XDataKeyState]));
            plotsState[plot]
              .y
              .push(
                plotsState[plot]
                  .processYDataKey(d[plotsState[plot].YDataKey]),
              );

            layout.datarevision += 1;
            setDataRevision(dataRevision + 1);
          });
        } catch (err) {
          message.log(err);
        }
      };

      query.onerror = () => {
        message.destroy();
        message.error('Error has occurred.');
      };
    }
  };

  /** Handle the collection of historical data in component */
  useEffect(() => {
    if (retrievePlotHistory !== null) {
      const fields = editForm.getFieldsValue();

      const YDataKey = fields[`YDataKey_${retrievePlotHistory}`];
      const dates = fields[`dateRange_${retrievePlotHistory}`];

      queryHistoricalData(
        dates,
        YDataKey,
        plotsState[retrievePlotHistory].nodeProcess,
        retrievePlotHistory,
      );

      // Reset state to null to allow for detection of future plot history requests
      setRetrievePlotHistory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrievePlotHistory]);

  /** Handle the collection of global historical data */
  useEffect(() => {
    if (state && state.globalHistoricalDate !== null) {
      plotsState.forEach((plot, i) => {
        queryHistoricalData(state.globalHistoricalDate, plot.YDataKey, plot.nodeProcess, i);
      });

      // Reset state to null to allow for detection of future plot history requests
      setRetrievePlotHistory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  /** Process edit value form */
  const processForm = (id) => {
    // Destructure form, field, index to retrieve changed field
    const [form, field, index] = id.split('_');

    // Check type of form
    if (form === 'plotsForm') {
      const fields = plotsForm.getFieldsValue();
      // Update state values
      switch (field) {
        case 'name':
          setNameState(fields.name);
          break;
        case 'dataLimit':
          setDataLimitState(fields.dataLimit);
          break;
        case 'XDataKey':
          setXDataKeyState(fields.XDataKey);
          break;
        case 'processXDataKey':
          setProcessXDataKeyState(fields.processXDataKey);
          break;
        default:
          break;
      }
    } else if (form === 'editForm') {
      // Update edit form values
      const fields = editForm.getFieldsValue();

      switch (field) {
        case 'processYDataKey':
          plotsState[index][field] = new Function('x', fields[`${field}_${index}`]); // eslint-disable-line no-new-func
          break;
        case 'marker':
          plotsState[index][field].color = fields[`${field}_${index}`];
          break;
        default:
          plotsState[index][field] = fields[`${field}_${index}`];
          break;
      }

      // Update state since we mutate it by modifying plotsState
      setUpdateComponent(!updateComponent);
    }
  };

  /** Process new value form */
  const onFinish = ({
    dateRange,
    name: nameVal,
    nodeProcess,
    type,
    mode,
    live,
    YDataKey,
    processYDataKey,
    marker,
  }) => {
    // Append new value to array
    plotsState.push({
      x: [],
      y: [],
      name: nameVal || '',
      nodeProcess,
      YDataKey,
      processYDataKey: processYDataKey
        ? new Function('x', processYDataKey) // eslint-disable-line no-new-func
        : (x) => x,
      type: type || 'scatter',
      mode: mode || 'marker',
      live,
      marker: {
        color: marker,
      },
    });

    setUpdateComponent(!updateComponent);

    const newIndex = plotsState.length - 1;

    // Set new value default form values
    editForm.setFieldsValue({
      [`name_${newIndex}`]: nameVal,
      [`nodeProcess_${newIndex}`]: nodeProcess,
      [`YDataKey_${newIndex}`]: YDataKey,
      [`processYDataKey_${newIndex}`]: processYDataKey
        ? processYDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim()
        : 'return x',
      [`type_${newIndex}`]: type || 'scatter',
      [`mode_${newIndex}`]: mode || 'markers',
      [`live_${newIndex}`]: live,
      [`marker_${newIndex}`]: marker,
      [`dateRange_${newIndex}`]: dateRange,
    });

    // Clear form
    newForm.resetFields();

    message.success('Created new chart value.');

    // Retrieve plot history
    if (!addChartLive) {
      setRetrievePlotHistory(newIndex);
    }
  };

  return (
    <BaseComponent
      name={nameState}
      subheader={(
        <span className="text-xs">
          {
            plotsState.length === 0 ? 'No charts to display.' : null
          }
          {
            plotsState.map((plot, i) => (
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

                {
                  plotsState.length - 1 === i ? null : <Divider type="vertical" />
                }
              </span>
            ))
          }
        </span>
      )}
      liveOnly
      height={height}
      toolsSlot={(
        <>
          {
            dataLimitState !== -1 ? (
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                <strong>Data Limit:</strong>
                &nbsp;
                {dataLimitState}
              </Tag>
            ) : (
              <Tag icon={<CheckCircleOutlined />} color="success">
                <strong>Data Limit:</strong>
                &nbsp;
                &infin;
              </Tag>
            )
          }

          &nbsp;

          <Popconfirm
            title="Are you sure you want to clear the chart of all values?"
            onConfirm={() => clearAll()}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small">
              <ClearOutlined />
            </Button>
          </Popconfirm>

          &nbsp;

          <Button size="small" onClick={() => downloadDataAsCSV()}>
            <DownloadOutlined />
          </Button>
        </>
      )}
      formItems={(
        <>
          {/* Global forms */}
          <Form
            form={plotsForm}
            layout="vertical"
            name="plotsForm"
            initialValues={{
              name,
              dataLimit,
              XDataKey,
              processXDataKey: processXDataKey.toString().replace(/^(.+\s?=>\s?)/, 'return ').replace(/^(\s*function\s*.*\([\s\S]*\)\s*{)([\s\S]*)(})/, '$2').trim(),
            }}
          >
            <Form.Item label="Name" name="name" hasFeedback>
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>
            <Form.Item
              label="Data Limit"
              name="dataLimit"
              hasFeedback
              help="No limit => -1, Limit => positive value"
            >
              <InputNumber
                min={-1}
                max={Infinity}
                onBlur={({ target: { id } }) => processForm(id)}
              />
            </Form.Item>

            <Form.Item label="X Data Key" name="XDataKey" hasFeedback>
              <Input onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>

            <Form.Item label="Process X Data key" name="processXDataKey" hasFeedback>
              <TextArea onBlur={({ target: { id } }) => processForm(id)} />
            </Form.Item>

            <Form.Item label="X Range" name="XRange">
              <RangePicker
                className="mr-1"
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                onBlur={() => {
                  const fields = plotsForm.getFieldsValue();

                  if (fields.XRange
                    && fields.XRange.length === 2
                  ) {
                    layout.yaxis.range = [fields.XRange[0], fields.XRange[1]];
                    layout.datarevision += 1;
                    layout.uirevision += 1;
                    setDataRevision(dataRevision + 1);
                  } else {
                    message.error('Fill in the range fields.');
                  }
                }}
              />
            </Form.Item>

            &nbsp;&nbsp;

            <Form.Item name="YRangeMin" noStyle>
              <InputNumber />
            </Form.Item>

            &nbsp;to&nbsp;

            <Form.Item name="YRangeMax" noStyle>
              <InputNumber />
            </Form.Item>

            &nbsp;&nbsp;

            <Button
              onClick={() => {
                const fields = plotsForm.getFieldsValue();

                if (fields.YRangeMin
                  && fields.YRangeMax
                  && fields.YRangeMin.toString()
                  && fields.YRangeMax.toString()
                ) {
                  layout.yaxis.range = [fields.YRangeMin, fields.YRangeMax];
                  layout.datarevision += 1;
                  layout.uirevision += 1;
                  setDataRevision(dataRevision + 1);
                } else {
                  message.error('Fill in the range fields.');
                }
              }}
            >
              Set Y Range
            </Button>
          </Form>

          <br />

          {/* Edit existing values */}
          <Form
            form={editForm}
            layout="vertical"
            name="editForm"
            initialValues={initialValues}
          >
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
                    key={`${plot.name}${plot.nodeProcess}${plot.YDataKey}`}
                    extra={(
                      <div
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={() => {}}
                        role="button"
                        tabIndex={0}
                      >
                        <Form.Item name={`live_${i}`} noStyle>
                          <Switch
                            checkedChildren="Live"
                            unCheckedChildren="Past"
                            checked={plot.live}
                            onChange={(checked) => {
                              plotsState[i].live = checked;

                              setUpdateComponent(!updateComponent);
                            }}
                          />
                        </Form.Item>
                        &nbsp;
                        &nbsp;
                        <span
                          role="button"
                          tabIndex={0}
                          onKeyDown={() => {}}
                          onClick={(event) => {
                            event.stopPropagation();

                            setPlotsState(plotsState.filter((p, j) => j !== i));
                          }}
                        >
                          X
                        </span>
                      </div>
                    )}
                  >
                    <Form.Item label="Historical Date Range" name={`dateRange_${i}`} hasFeedback noStyle>
                      <RangePicker
                        className="mr-1"
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        disabled={editForm && editForm.getFieldsValue()[`live_${i}`]}
                        onBlur={({ target: { id } }) => processForm(id)}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      onClick={() => setRetrievePlotHistory(i)}
                      disabled={editForm && editForm.getFieldsValue()[`live_${i}`]}
                    >
                      Show
                    </Button>

                    <br />
                    <br />

                    <Form.Item label="Name" name={`name_${i}`} hasFeedback>
                      <Input placeholder="Name" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Chart Type" name={`type_${i}`} hasFeedback>
                      <Select
                        showSearch
                        placeholder="Chart Type"
                        onBlur={({ target: { id } }) => processForm(id)}
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

                    <Form.Item label="Chart Mode" name={`mode_${i}`} hasFeedback>
                      <Select
                        showSearch
                        placeholder="Chart Mode"
                        onBlur={({ target: { id } }) => processForm(id)}
                      >
                        <Select.Option value="lines">lines</Select.Option>
                        <Select.Option value="marker">marker</Select.Option>
                        <Select.Option value="markers">markers</Select.Option>
                        <Select.Option value="text">text</Select.Option>
                        <Select.Option value="lines+markers">lines+markers</Select.Option>
                        <Select.Option value="lines+markers+text">lines+markers+text</Select.Option>
                        <Select.Option value="none">none</Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="Node Process" name={`nodeProcess_${i}`} hasFeedback>
                      <Input placeholder="Node Process" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Y Data Key" name={`YDataKey_${i}`} hasFeedback>
                      <Input placeholder="Y Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Process Y Data Key" name={`processYDataKey_${i}`} hasFeedback>
                      <TextArea placeholder="Process Y Data Key" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>

                    <Form.Item label="Marker Color" name={`marker_${i}`} hasFeedback>
                      <Input placeholder="Marker Color" onBlur={({ target: { id } }) => processForm(id)} />
                    </Form.Item>
                  </Panel>
                ))
              }
            </Collapse>
          </Form>

          <br />

          {/* Add forms */}
          <Form
            form={newForm}
            layout="vertical"
            name="newForm"
            onFinish={onFinish}
            initialValues={{
              live: true,
              processYDataKey: 'return x;',
            }}
          >
            <Collapse>
              <Panel header="Add Value" key="add">
                <Switch
                  checkedChildren="Live"
                  unCheckedChildren="Past"
                  checked={addChartLive}
                  onChange={() => setAddChartLive(!addChartLive)}
                />

                <br />
                <br />

                <Form.Item label="Historical Date Range" name="dateRange" hasFeedback>
                  <RangePicker
                    className="mr-1"
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    disabled={addChartLive}
                  />
                </Form.Item>

                <Form.Item label="Name" name="name" hasFeedback>
                  <Input placeholder="Name" />
                </Form.Item>

                <Form.Item
                  label="Chart Type"
                  name="type"
                  hasFeedback
                >
                  <Select
                    showSearch
                    placeholder="Chart Type"
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

                <Form.Item label="Chart Mode" name="mode" hasFeedback>
                  <Select
                    showSearch
                    placeholder="Chart Mode"
                  >
                    <Select.Option value="lines">lines</Select.Option>
                    <Select.Option value="marker">marker</Select.Option>
                    <Select.Option value="markers">markers</Select.Option>
                    <Select.Option value="text">text</Select.Option>
                    <Select.Option value="lines+markers">lines+markers</Select.Option>
                    <Select.Option value="lines+markers+text">lines+markers+text</Select.Option>
                    <Select.Option value="none">none</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: 'Node Process is required!',
                    },
                    () => ({
                      validator(rule, value) {
                        if (!value.includes(':')) {
                          return Promise.reject('Must have the format node:process.'); // eslint-disable-line prefer-promise-reject-errors
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  label="Node Process"
                  name="nodeProcess"
                  hasFeedback
                >
                  <Input placeholder="Node Process" />
                </Form.Item>

                <Form.Item
                  rules={[
                    {
                      required: true,
                      message: 'Y Data Key is required!',
                    },
                  ]}
                  label="Y Data Key"
                  name="YDataKey"
                  hasFeedback
                >
                  <Input placeholder="Y Data Key" />
                </Form.Item>

                <Form.Item label="Process Y Data Key" name="processYDataKey" hasFeedback help="Define the function body (in JavaScript) here to process the variable 'x'.">
                  <TextArea placeholder="Process Y Data Key" />
                </Form.Item>

                <Form.Item label="Marker Color" name="marker" hasFeedback>
                  <Input placeholder="Marker Color" />
                </Form.Item>

                <Button
                  type="dashed"
                  block
                  htmlType="submit"
                >
                  Add Value
                </Button>
              </Panel>
            </Collapse>
          </Form>
        </>
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
  /** Specify limit on how many data points can be displayed */
  dataLimit: PropTypes.number,
  /** Plot options for each chart */
  plots: PropTypes.arrayOf(
    PropTypes.shape({
      /** Array of chart y values */
      x: PropTypes.arrayOf(PropTypes.any),
      /** Array of chart x values */
      y: PropTypes.arrayOf(PropTypes.any),
      /** Plot.ly chart type */
      type: PropTypes.string,
      marker: PropTypes.shape({
        /** Chart marker color */
        color: PropTypes.string,
      }),
      /** Plot.ly chart mode */
      mode: PropTypes.string,
      /** Chart name/title */
      name: PropTypes.string,
      /** Name of the node:process to listen to */
      nodeProcess: PropTypes.string,
      /** Data key to plot on the y-axis */
      YDataKey: PropTypes.string,
      /** Function to modify the Y Data key */
      processYDataKey: PropTypes.func,
      /** Whether the chart displays live values */
      live: PropTypes.bool,
    }),
  ),
  /** Specify whether this chart is a polar or cartesian plot */
  polar: PropTypes.bool,
  /** X-axis key to display from the data JSON object above */
  XDataKey: PropTypes.string,
  /** Function to process the X-axis key */
  processXDataKey: PropTypes.func,
  /** Children node */
  children: PropTypes.node,
  height: PropTypes.number.isRequired,
};

Chart.defaultProps = {
  name: '',
  dataLimit: 5000,
  polar: false,
  plots: [],
  XDataKey: null,
  processXDataKey: (x) => x,
  children: null,
};

export default Chart;
