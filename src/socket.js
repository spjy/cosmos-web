/**
 * A wrapper for the WebSocket API to integrate a
 * re-connection feature without having to repeat myself.
 * @param {String} ip The IP of the WebSocket to open.
 */
function socket(ip) {
  const ws = new WebSocket(ip);

  /** Close the WS on error */
  ws.onerror = (err) => {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    
    const timeout = setTimeout(() => {
      ws.close();
      socket(ip);
    }, 1000);

    clearTimeout(timeout);
  };

  return ws;
}

export default socket;
