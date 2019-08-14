import React from 'react';
import {
  Card, Col, Row, Icon,
} from 'antd';

import image from '../public/world.png';

const Home = () => (
  <div>
    <div className="text-center p-5 flex items-center justify-center">
      <img className="w-1/6" src={image} alt="World" />
      <h1 className="font-mono text-4xl">COSMOS Web</h1>
    </div>
    <br />
    <Row gutter={16} type="flex" justify="center">
      <Col className="gutter-row" span={6}>
        <Card title={<Icon type="sync" />} bordered={false} style={{ width: 300 }}>
          <p>
            With Orbit, you can view the live or historical orbit of any satellite.
          </p>
        </Card>
      </Col>
      <Col className="gutter-row" span={6}>
        <Card title={<Icon type="swap-right" />} bordered={false} style={{ width: 300 }}>
          <p>
            With Attitude, you can view the live or historical attitude of any satellite.
          </p>
        </Card>
      </Col>
      <Col className="gutter-row" span={6}>
        <Card title={<Icon type="line-chart" />} bordered={false} style={{ width: 300 }}>
          <p>
            With Plot, you can view the live or historical data of any satellite.
          </p>
        </Card>
      </Col>
    </Row>
  </div>
);

export default Home;
