import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { message, Select, Button } from 'antd';

import { Context, actions } from '../../store/dashboard';
import { socket } from '../../api';
import BaseComponent from '../BaseComponent';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Macro({
  height,
}) {
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
  }, [macro, dispatch]);

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
          message.error(error);
        }

        installed.close();
      };
    };
  };

  /** Retreive values upon user wanting to get new macro values from Nordiasoft */
  useEffect(() => {
    getValue();
  }, [updateMacros]);

  return (
    <BaseComponent
      name="Macros"
      movable
      height={height}
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
            macros.map((name) => (
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
    </BaseComponent>
  );
}

Macro.propTypes = {
  height: PropTypes.number.isRequired,
};

export default Macro;
