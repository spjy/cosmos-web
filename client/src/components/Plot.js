import React, { Component } from 'react';
import { Chart, Geom, Axis, Tooltip, Legend, Coord } from 'bizcharts';

import Navbar from './Global/Navbar';

const data = [
  { genre: 'Sports', sold: 275, income: 2300 },
  { genre: 'Strategy', sold: 115, income: 667 },
  { genre: 'Action', sold: 120, income: 982 },
  { genre: 'Shooter', sold: 350, income: 5271 },
  { genre: 'Other', sold: 150, income: 3710 }
];

const cols = {
  sold: { alias: 'Sold' },
  genre: { alias: 'Genre' }
};

class Plot extends Component {

  render() {
    return (
      <div>
        <Navbar />
        <br />
        <Chart height={400} data={data} scale={cols}>
          <Axis name="genre" />
          <Axis name="sold" />
          <Legend position="top" dy={-20} />
          <Tooltip />
          <Geom type="interval" position="genre*sold" color="genre" />
        </Chart>
      </div>
    );
  }

}

export default Plot;
