import React, { Component } from 'react';
import { Card, Form, Select, Button, DatePicker } from 'antd';

class ReplayForm extends Component {

  state = {
    satelliteSelected: '',
    dateFrom: '',
    dateTo: '',
  }

  datePicker(date, dateString) {
    this.setState({ dateFrom: dateString[0], dateTo: dateString[1] })
  }

  selectSatellite(value, option) {
    this.setState({ satelliteSelected: value });
  }

  submit(e) {
    e.preventDefault();
    this.props.onReplayFormSubmit({
      satelliteSelected: this.state.satelliteSelected,
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
                placeholder="Select satellite"
                onChange={this.selectSatellite.bind(this)}
              >
                <Select.Option value="cubesat1">cubesat1</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Date range">
              <DatePicker.RangePicker onChange={this.datePicker.bind(this)} showTime format="YYYY-MM-DDTHH:mm:ssZ" />
            </Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              Replay Orbit
            </Button>
          </Form>
        </Card>
      </div>
    );
  }

}

export default ReplayForm;
