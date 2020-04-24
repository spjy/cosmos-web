import React from 'react';
import {
  Card, Row, Col,
} from 'antd';

const Home = () => (
  <div>
    <div className="text-center p-5 flex items-center justify-center">
      <img className="w-1/6" src="/src/public/world.png" alt="World" />
      <div className="flex-col text-left">
        <h1 className="font-mono text-4xl">COSMOS Web</h1>
        <p>
          COSMOS Web extends COSMOS into a user interface to
          allow for interaction with the ecosystem.
        </p>
      </div>
    </div>
    <br />
    <div className="flex-col items-center p-24">
      <Row gutter={16}>
        <Col span={8}>
          <Card title="CEO" bordered={false}>
            The COSMOS Executive Operator (CEO) shows the various nodes
            around the network and offers a high level overview of each node.
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Satellites & Ground Stations" bordered={false}>
            This is a drilled in view of a certain satellite or ground station
            that provides telemetry data in charts, plaintext or visualizations.
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Dashboard Manager" bordered={false}>
            This is the page where users can configure local layouts (per computer)
            and add components to their liking.
          </Card>
        </Col>
      </Row>
    </div>
  </div>
);

export default Home;
