import RWebSocket from 'reconnecting-websocket';

/**
 * A wrapper for the WebSocket API to integrate a
 * re-connection feature without having to repeat myself.
 * @param {String} ip The IP of the WebSocket to open.
 */
export function socket(type, endpoint) {
  return new RWebSocket(`ws://${process.env.WEBSOCKET_IP}:${type === 'query' ? process.env.QUERY_WEBSOCKET_PORT : ''}${type === 'live' ? process.env.LIVE_WEBSOCKET_PORT : ''}${endpoint}`);
}

export const query = socket('query', '/query/');
export const live = socket('live', '/live/all/');
export const command = socket('query', '/command/');
