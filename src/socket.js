/**
 * A wrapper for the WebSocket API to integrate a
 * re-connection feature without having to repeat myself.
 * @param {String} ip The IP of the WebSocket to open.
 */
function socket(ip) {
  const ws = new WebSocket(ip);

  /** Attempt to recursively re-connect to socket */
  ws.onclose = () => {
    setTimeout(() => {
      ws.close();
      socket(ip);
    }, 1000);
  };

  /** Close the WS on error */
  ws.onerror = (err) => {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
  };

  return ws;
}

export default socket;
