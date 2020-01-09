import React from 'react';
import PropTypes from 'prop-types';

import { Badge, Icon } from 'antd';
import DisplayValue from './DisplayValue';
import Content from './Content';

function Subsystem({
  name,
}) {
  return (
    <Content
      movable
      className="flex-col p-4"
    >
      <div className="flex">
        <div className="flex-col shadow overflow-y-auto p-4 m-1 bg-white w-full lg:w-1/4">
          <div>
            <Badge status="success" />
            <span className="text-lg font-bold">
              eps
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
      <div className="flex m-1">
        <div
          className="w-1/2 mr-2"
        >
          <DisplayValue
            name="Temperature"
          />
        </div>
        <div
          className="w-1/2"
        >
          <DisplayValue
            name="Voltages and Currents"
          />
        </div>
      </div>
    </Content>
  );
}

Subsystem.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Subsystem;
