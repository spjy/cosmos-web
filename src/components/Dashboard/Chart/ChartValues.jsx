import React from 'react';
import PropTypes from 'prop-types';
import { Divider } from 'antd';

function ChartValues({
  plots,
}) {
  return (
    <>
      <span className="text-xs">
        {
          plots.length === 0 ? 'No charts to display.' : null
        }
        {
          plots.map((plot, i) => (
            <span key={`${plot.nodeProcess}${plot.YDataKey}`}>
              <span
                className="inline-block rounded-full mr-2 indicator"
                style={
                  {
                    height: '6px',
                    width: '6px',
                    marginBottom: '2px',
                    backgroundColor: plot.marker.color,
                  }
                }
              />
              <span className="font-semibold">
                {plot.nodeProcess}
              </span>
              &nbsp;-&nbsp;
              {plot.YDataKey}

              {
                plots.length - 1 === i ? null : <Divider type="vertical" />
              }
            </span>
          ))
        }
      </span>
    </>
  );
}

ChartValues.propTypes = {
  plots: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default ChartValues;
