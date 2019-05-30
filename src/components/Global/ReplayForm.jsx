import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card, Form, Select, Button, DatePicker
} from 'antd';

class ReplayForm extends Component {
  static propTypes = {
    onReplayFormSubmit: PropTypes.func.isRequired
  }

  constructor() {
    super();

    this.state = {
      selected: '',
      dateFrom: '',
      dateTo: ''
    };
  }

  /**
   * Handling the date picker values and storing them into state.
   * @param {Date} date
   * @param {string} dateString
   */
  handleDatePicker(date, dateString) {
    this.setState({
      dateFrom: dateString[0],
      dateTo: dateString[1]
    });
  }

  handleSelected(value, option) {
    this.setState({
      selected: value
    });
  }

  submitReplayForm(e) {
    e.preventDefault();
    this.props.onReplayFormSubmit({
      selected: this.state.selected,
      dateFrom: this.state.dateFrom,
      dateTo: this.state.dateTo
    });
  }

  render() {
    return (
      <div
        style={{ padding: '0 1em' }}
      >
        <div
          style={{ background: '#ECECEC', padding: '10px' }}
        >
          <Card
            title="Replay"
            bordered={false}
            style={{ width: '100%' }}
          >
            <Form
              layout="horizontal"
              onSubmit={e => this.submitReplayForm(e)}
            >
              <Form.Item
                label="Satellite"
              >
                <Select
                  showSearch
                  placeholder="Select"
                  onChange={(value, option) => this.handleSelected(value, option)}
                >
                  <Select.Option value="cubesat1">cubesat1</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Date range"
              >
                <DatePicker.RangePicker
                  onChange={(date, dateString) => this.handleDatePicker(date, dateString)}
                  showTime
                  format="YYYY-MM-DDTHH:mm:ssZ"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                Replay
              </Button>
            </Form>
          </Card>
        </div>
      </div>
    );
  }
}

export default ReplayForm;
