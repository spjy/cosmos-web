import React, { Component } from 'react';
import { Card, Col, Row, Icon, Divider } from 'antd';

import Navbar from './Global/Navbar';




class Home extends Component {
  render() {
    return (
      <div>
        <div style={{ backgroundColor: '#ECECEC' }}>
          <Navbar />
          <div style={{padding: '5em', textAlign: 'center'}}>
            <h1>COSMOS Web</h1>
            for the Hawaii Space Flight Laboratory
          </div>
        </div>
        <br />
        <Row gutter={16} type="flex" justify="center">
          <Col className="gutter-row" span={6}>
            <Card title={<Icon type="sync" />} bordered={false} style={{ width: 300 }}>
              <p>With Orbit, you can view the live or historical <em>orbit</em> of any satellite.</p>
            </Card>
          </Col>
          <Col className="gutter-row" span={6}>
            <Card title={<Icon type="swap-right" />} bordered={false} style={{ width: 300 }}>
              <p>With Attitude, you can view the live or historical <em>attitude</em> of any satellite.</p>
            </Card>
          </Col>
          <Col className="gutter-row" span={6}>
            <Card title={<Icon type="line-chart" />} bordered={false} style={{ width: 300 }}>
              <p>With Plot, you can view the live or historical <em>data</em> of any satellite.</p>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

}

export default Home;
