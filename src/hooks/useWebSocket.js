import { useState, useEffect } from 'react';

/**
 * R
 * @param {('query'|'live')} type The type of socket port to listen to. Either query or live.
 * @param {String} endpoint The endpoint to listen to including the initital '/'
 */
function useWebSocket(type, endpoint) {
  let ws = new WebSocket(`ws://${process.env.WEBSOCKET_IP}:${type === 'query' ? process.env.QUERY_WEBSOCKET_PORT : ''}${type === 'live' ? process.env.LIVE_WEBSOCKET_PORT : ''}${endpoint}`);

  ws.onclose = (error) => {
    switch (error.code) {
      case 1000:
        // Closed peacefully
        break;
      default:
        // Closed forcefully. Try to reconnect.
        setTimeout(() => {
          ws = null;

          useWebSocket(type, endpoint);
        }, 1000);
        break;
    }
  };

  ws.onerror = (error) => {
    console.log('error');
    switch (error.code) {
      case 'ECONNREFUSED':
        // Closed forcefully. Try to reconnect.
        ws.close();
        break;
      default:
        break;
    }
  };

  return ws;
}

export default useWebSocket;
