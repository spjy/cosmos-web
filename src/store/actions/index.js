export const SET_KEY = 'SET_KEY';
export const SET_DATA = 'SET_DATA';

/**
 * Add a key within the context
 *
 * @param {String} key Name to give the key in the context
 * @param {*} message Value to store in above key
 */
export function set(key, payload) {
  return {
    type: SET_KEY,
    key,
    payload,
  };
}

export function setData(node, data) {
  return {
    type: SET_DATA,
    key: node,
    payload: data,
  };
}
