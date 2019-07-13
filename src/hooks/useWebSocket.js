import React, { useState } from 'react';

/**
 * R
 * @param {('query'|'live')} type The type of socket port to listen to. Either query or live.
 * @param {String} endpoint The endpoint to listen to including the initital '/'
 */
function useWebSocket(type, endpoint) {
  const [ws, setWs] = useState(
    new WebSocket(`ws://${process.env.REACT_APP_WEBSOCKET_IP}:${type === 'query' ? process.env.REACT_APP_QUERY_WEBSOCKET_PORT : ''}${type === 'live' ? process.env.REACT_APP_LIVE_WEBSOCKET_PORT : ''}${endpoint}`)
  );

  ws.onclose = () => {};

  ws.onerror(err) => {
    ws.close();
    setTimeout(() => {
      return useWebSocket(type, endpoint);
    }, 1000);
  }
}

export default useWebSocket;
