import React, { Component } from 'react';
import {
  Card, Form, Select, Button, DatePicker
} from 'antd';

class ReplayForm extends Component {
  constructor() {
    super();

    this.state = {
      selected: '',
      dateFrom: '',
      dateTo: ''
    };
  }

  datePicker(date, dateString) {
    this.setState({
      dateFrom: dateString[0],
      dateTo: dateString[1]
    });
  }

  selected(value, option) {
    this.setState({
      selected: value
    });
  }

  submit(e) {
    e.preventDefault();
    this.props.onReplayFormSubmit({
      selected: this.state.selected,
      dateFrom: this.state.dateFrom,
      dateTo: this.state.dateTo,
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
              onSubmit={this.submit.bind(this)}
            >
              <Form.Item
                label="Satellite"
              >
                <Select
                  showSearch
                  placeholder="Select"
                  onChange={this.selected.bind(this)}
                >
                  <Select.Option value="cubesat1">cubesat1</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Date range"
              >
                <DatePicker.RangePicker
                  onChange={this.datePicker.bind(this)}
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
