import React, { Component } from 'react';

class SelectSatellite extends Component {

  render() {
    return (
      <div>
        <Form layout="horizontal" onSubmit={this.submit.bind(this)}>
          <Form.Item label="Satellite">
            <Select
              showSearch
              placeholder="Select satellite"
              onChange={this.selectSatellite.bind(this)}
              //optionFilterProp="children"
              //onChange={handleChange}
              //filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              <Select.Option value="cubesat1">cubesat1</Select.Option>
              <Select.Option value="neutron1">neutron1</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </div>
    );
  }

}

export default SelectSatellite;
