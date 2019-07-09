import React, { useState } from 'react';
import { Form, Input } from 'antd';

import {
  Context, actions, reducer
} from '../../store/AgentStatuses';

import Card from '../../components/Missions/Components/LayoutCard';
import Example from '../../components/Missions/Components/Example';
import Clock from '../../components/Missions/Components/Clock';
import DisplayValue from '../../components/Missions/Components/DisplayValue';
import AgentCommands from '../../components/Missions/Components/AgentCommands';

function neutron1() {
  /**
   * Store the agent statuses in the global store.
   */
  // const [state, dispatch] = useReducer(reducer, { payload: [] });
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
            name="Average Temperature"
            subheader="06231999-1630Z"
            val={(
              <div className="text-center font-bold text-red-600 text-lg">
                67&deg;C
              </div>
            )}
          />
        </Card>
        <Card>
          <Clock />
        </Card>
      </div>
      <Card>
        <AgentCommands
          val={(
            <div className="text-center font-bold text-red-600 text-lg">
              67&deg;C
            </div>
          )}
        />
      </Card>
    </div>
  );
}

export default neutron1;
