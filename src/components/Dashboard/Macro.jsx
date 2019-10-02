import React, { useEffect, useState, useContext } from 'react';
import { Select, Button } from 'antd';

import { Context, actions } from '../../store/neutron1';
import socket from '../../socket';
import Content from './Content';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Macro() {
  /** Get agent list state from the Context */
  const { dispatch } = useContext(Context);

  /** Currently selected macro */
  const [macro, setMacro] = useState('');
  /** Possible list of macros */
  const [macros, setMacros] = useState([]);
  /** Watcher variable to listen when to update the list */
  const [updateMacros, setUpdateMacros] = useState(false);

  /** Store selected macro in React Context */
  useEffect(() => {
    dispatch(actions.get('macro', macro));
  }, [macro]);

  /**
   * Retrieve the possible macros from Nordiasoft applications
   */
  const getValue = () => {
    const installed = socket('query', '/command/');

    installed.onopen = () => {
      installed.send('agent masdr nordiasoft list_applications');

      installed.onmessage = ({ data }) => {
        try {
          const json = JSON.parse(data);

          if (json.output && json.output.installed) {
            setMacros(json.output.installed);
          }
        } catch (error) {
          console.log(error);
        }

        installed.close();
      };
    };
  };

  useEffect(() => {
    getValue();
  }, [updateMacros]);

  return (
    <Content
      name="Macros"
      movable
    >
      <div className="flex">
        <Select
          showSearch
          className="flex-initial flex-grow mb-2 pr-2"
          dropdownMatchSelectWidth={false}
          onChange={(value) => {
            setMacro(value);
          }}
          placeholder="Select macro"
        >
          <Select.Option
            key="empty"
            value=""
          >
            None
          </Select.Option>
          {
            macros.map(name => (
              <Select.Option
                key={name}
                value={name}
              >
                {name}
              </Select.Option>
            ))
          }
        </Select>
        <Button className="mb-2" onClick={() => setUpdateMacros(!updateMacros)}>
          Update Macros
        </Button>
      </div>
    </Content>
  );
}

export default Macro;
