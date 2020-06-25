import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { message, Select, Button } from 'antd';

import { Context, actions } from '../../store/dashboard';
import { axios } from '../../api';
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
    dispatch(actions.set('macro', macro));
  }, [macro, dispatch]);

  /** Retreive values upon user wanting to get new macro values from Nordiasoft */
  useEffect(() => {
    /**
     * Retrieve the possible macros from Nordiasoft applications
     */
    async function getValue() {
      try {
        const { data } = await axios.post('/command', {
          command: 'agent masdr nordiasoft list_applications',
        });

        const json = JSON.parse(data);

        if (json.output && json.output.installed) {
          setMacros(json.output.installed);
        } else {
          throw new Error(data);
        }
      } catch (error) {
        message.error(error.message);
      }
    }

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
