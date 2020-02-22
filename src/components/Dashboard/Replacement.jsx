import React, { useEffect, useState, useContext } from 'react';
import { Badge } from 'antd';
// import moment from 'moment-timezone';

import { Context } from '../../store/neutron1';
import Content from './Content';

/**
 * Retrieves the agent list and displays it in a table.
 * Also displays the timestamp of the agent's last heartbeat.
 */
function Status() {
  /** Get agent list state from the Context */
  const { state } = useContext(Context);
  /** Component's agent list storage */
  const [list, setList] = useState([]);

  /** Upon the state.list updating, update the store's list */
  useEffect(() => {
    console.log(state);
    if (state.file_list) {
      setList(state.file_list.output.incoming);
    }
  }, [state.file_list]);

  return (
    <Content
      name="Radio"
      movable
    >
      {
        list.length === 0 ? 'No files.' : null
      }
      <table> 
        <tbody> 
          {       
            list.map(({
              node, count, files
            }) => (
		count > 0 ?
		files.map(({
		  name, bytes, size
		}, i) => (
		      <tr key={node + i}>
			<td>    
			  {<Badge status={bytes / size < 1 ? "processing" : "success"} />}
			</td>   
			<td className="text-gray-500 pr-1">
			  {Math.round(bytes / size * 100) / 100}%
			</td>   
			<td> 
			  {name}
			</td>   
		      </tr>   
		)) : null
            ))      
          }       
        </tbody>
      </table>
    </Content>
  );
}

export default Status;
