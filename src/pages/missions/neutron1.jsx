import React, { useState } from 'react';
import { Form, Input } from 'antd';

import BaseComponent from '../../components/Missions/BaseComponent';
import Card from '../../components/Missions/Components/LayoutCard';
import Example from '../../components/Missions/Components/Example';
import DisplayValue from '../../components/Missions/Components/DisplayValue';

function Dashboard() {
  /** Storage for form values */
  const [form, setForm] = useState({});
  /** Status of the live switch */
  const [liveSwitch, setLiveSwitch] = useState();

  return (
    <div className="p-4">
      <div className="flex flex-row">
        <Card>
          <Example />
        </Card>
        <Card>
          <DisplayValue
            name="Payload Temperature"
            subheader="06231999-1630Z"
            val={(
              <div className="text-center text-lg">
                30&deg;C
              </div>
            )}
          />
        </Card>
        <Card>
          <DisplayValue
            name="Average Temperature"
            subheader="06231999-1630Z"
            val={(
              <div className="text-center font-bold text-red-600 text-lg">
                67&deg;C
              </div>
            )}
          />
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
