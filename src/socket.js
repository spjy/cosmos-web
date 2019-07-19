/**
 * A wrapper for the WebSocket API to integrate a
 * re-connection feature without having to repeat myself.
 * @param {String} ip The IP of the WebSocket to open.
 */
function socket(type, endpoint) {
  let ws = new WebSocket(`ws://${process.env.WEBSOCKET_IP}:${type === 'query' ? process.env.QUERY_WEBSOCKET_PORT : ''}${type === 'live' ? process.env.LIVE_WEBSOCKET_PORT : ''}${endpoint}`);

  ws.onclose = (error) => {
    console.log(`closed ws://${process.env.WEBSOCKET_IP}:${type === 'query' ? process.env.QUERY_WEBSOCKET_PORT : ''}${type === 'live' ? process.env.LIVE_WEBSOCKET_PORT : ''}${endpoint}`);
    switch (error.code) {
      case 1000:
        // Closed peacefully
        break;
      default:
        // Closed forcefully. Try to reconnect.
        setTimeout(() => {
          ws = null;

          socket(type, endpoint);
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

export default socket;
