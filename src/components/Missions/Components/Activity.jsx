import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'antd';

import { Context } from '../../../store/neutron1';
import Content from './Content';

function Activity() {
  /** Get agent list state from the Context */
  const { state } = useContext(Context);
  /** Component's agent list storage */
  const [activity, setActivity] = useState(['HI']);

  /** Upon the state.list updating, update the store's list */
  useEffect(() => {
    if (state.list) {
      setActivity(state.list.agent_list);
    }
  }, [state.list]);

  /** Close the WS on unmount */
  // useEffect(() => () => ws.close(1000), []);
  return (
    <Content
      name="Activity"
    >
      {
        activity.length === 0 ? 'No activity.' : null
      }
      <table>
        <tbody>
          <tr>
            <td>
              {<Badge status="success" />}
            </td>
            <td className="pr-4">
              {'9p$4WTe#PcFSBBE#P����CC4`4cF0#P> �shy9psh#By9�"3DUfw���'}
            </td>
            <td className="text-gray-500">
              2019-08-10T10:19
              {/* {
                moment
                  .unix((((utc + 2400000.5) - 2440587.5) * 86400.0))
                  .format('YYYY-MM-DD HH:mm:ss')
              } */}
            </td>
          </tr>
        </tbody>
      </table>
    </Content>
  );
}

Activity.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.string,
  /** Value to display in card */
  val: PropTypes.node.isRequired,
};

Activity.defaultProps = {
  name: '',
  subheader: null,
};

export default Activity;
