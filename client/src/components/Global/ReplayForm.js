import React, { Component } from 'react';
import { Card, Form, Select, Button, DatePicker } from 'antd';

class ReplayForm extends Component {

  state = {
    select: '',
    dateFrom: '',
    dateTo: '',
  }

  datePicker(date, dateString) {
    this.setState({ dateFrom: dateString[0], dateTo: dateString[1] })
  }

  select(value, option) {
    this.setState({ select: value });
  }

  submit(e) {
    e.preventDefault();
    this.props.onReplayFormSubmit({
      select: this.state.select,
      dateFrom: this.state.dateFrom,
      dateTo: this.state.dateTo,
    })
  }

  render() {
    return (
      <div>
        <Card title="Replay" bordered={false} style={{ width: '100%' }}>
          <Form layout="horizontal" onSubmit={this.submit.bind(this)}>
            <Form.Item label="Satellite">
              <Select
                showSearch
                placeholder="Select"
                onChange={this.select.bind(this)}
              >
                <Select.Option value="cubesat1">cubesat1</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Date range">
              <DatePicker.RangePicker onChange={this.datePicker.bind(this)} showTime format="YYYY-MM-DDTHH:mm:ssZ" />
            </Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              Replay
            </Button>
          </Form>
        </Card>
      </div>
    );
  }

}

export default ReplayForm;
