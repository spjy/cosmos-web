import React from 'react';
import PropTypes from 'prop-types';

import { Badge, Icon } from 'antd';

function Subsystem({
  name,
}) {
  return (
    <div
      className="flex-col p-4"
    >
      <div className="flex">
        <div className="flex-col shadow overflow-y-auto p-4 m-1 bg-white w-full lg:w-1/4">
          <div>
            <Badge status="success" />
            <span className="text-lg font-bold">
              mongo
            </span>
          </div>
          <div className="flex-col pl-3 pt-2">
            <div>
              <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
              &nbsp;Nominal.
            </div>
          </div>
        </div>
        <div className="flex-col shadow overflow-y-auto p-4 m-1 bg-white w-3/4">
          <span className="text-lg font-bold">
            Activity
          </span>
          <div className="flex-col pt-2">
            Hi
          </div>
        </div>
      </div>
    </div>
  );
}

Subsystem.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Subsystem;
