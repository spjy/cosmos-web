import React from 'react';
import {
  Card, Icon,
} from 'antd';

import image from '../public/world.png';

const Home = () => (
  <div>
    <div className="text-center p-5 flex items-center justify-center">
      <img className="w-1/6" src={image} alt="World" />
      <h1 className="font-mono text-4xl">COSMOS Web</h1>
    </div>
    <br />
    <div className="flex justify-center">
      <Card title={<Icon type="sync" />} bordered={false}>
        <p>
          With Orbit, you can view the live or historical orbit of any satellite.
        </p>
      </Card>
      <Card title={<Icon type="swap-right" />} bordered={false}>
        <p>
          With Attitude, you can view the live or historical attitude of any satellite.
        </p>
      </Card>
      <Card title={<Icon type="line-chart" />} bordered={false}>
        <p>
          With Plot, you can view the live or historical data of any satellite.
        </p>
      </Card>
    </div>
  </div>
);

export default Home;
