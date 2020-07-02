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
            displayValues.map(({ name: label, unit: u }, i) => (
              <tr key={`${label}${u}`}>
                <td className="pr-2 text-gray-500 text-right">
                  { label }
                </td>
                <td className="pr-2">
                  {
                    displayValues[i].value !== undefined
                      ? `${displayValues[i].processDataKey
                        ? displayValues[i].processDataKey(displayValues[i].value)
                        : displayValues[i].value}${u}` : '-'
                  }
                </td>
                <td className="text-gray-500">
                  { displayValues[i].node_utc ? displayValues[i].node_utc : '-' }
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
