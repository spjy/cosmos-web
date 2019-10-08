import React from 'react';
import PropTypes from 'prop-types';

function Table({
  fullWidth,
  columns,
  data,
}) {
  return (
    <table className={`${fullWidth ? 'w-full' : ''}`}>
      <style jsx>
        {`
          th, td {
            padding: 4px 15px;
          }
        `}
      </style>
      <tbody>
        <tr className="head border-gray-300 border-b overflow-scroll-auto">
          {
            columns.map(({ title }) => (
              <th key={title}>{title}</th>
            ))
          }
        </tr>
        {
          data.map((row, i) => (
            <tr key={i}>
              {columns.map(({ key }) => (
                <td>{row[key]}</td>
              ))}
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}

Table.propTypes = {
  fullWidth: PropTypes.bool,
  columns: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    key: PropTypes.string,
  })),
  data: PropTypes.arrayOf(
    PropTypes.shape({}),
  ),
};

Table.defaultProps = {
  fullWidth: true,
  columns: [],
  data: [],
};

export default Table;
