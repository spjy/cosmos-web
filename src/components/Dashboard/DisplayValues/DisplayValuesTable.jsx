import React from 'react';
import PropTypes from 'prop-types';

function DisplayValuesTable({
  displayValues,
}) {
  return (
    <>
      {
        displayValues.length === 0 ? 'No values to display.' : null
      }
      <table>
        <tbody>
          {
            displayValues.map((
              {
                name, dataKey, timeDataKey, processDataKey, value, unit, time,
              },
            ) => (
              <tr key={name + dataKey + timeDataKey + processDataKey.toString() + time}>
                <td className="pr-2 text-gray-500 text-right">
                  { name }
                </td>
                <td className="pr-2">
                  {
                    value !== undefined
                      ? `${processDataKey
                        ? processDataKey(value)
                        : value}${unit}` : '-'
                  }
                </td>
                <td className="text-gray-500">
                  { time || '-' }
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  );
}

DisplayValuesTable.propTypes = {
  displayValues: PropTypes.arrayOf(PropTypes.shape).isRequired,
};

export default DisplayValuesTable;
