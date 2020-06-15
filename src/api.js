import RWebSocket from 'reconnecting-websocket';
import rest from 'axios';

/**
 * A wrapper for the WebSocket API to integrate a
 * re-connection feature without having to repeat myself.
 * @param {String} ip The IP of the WebSocket to open.
 */
export function socket(endpoint) {
  return new RWebSocket(`ws://${process.env.API_IP}:${process.env.WEBSOCKET_PORT}${endpoint}`);
}

export const axios = rest.create({
  baseURL: `http://${process.env.API_IP}:${process.env.REST_PORT}`,
});

export const live = socket('/live/all/');
