import React from 'react';

const GET_LATEST_MESSAGE = 'GET_LATEST_MESSAGE';

export const actions = {
  /**
   * Add a key within the context
   *
   * @param {String} key Name to give the key in the context
   * @param {*} message Value to store in above key
   */
  get(key, message) {
    return {
      type: GET_LATEST_MESSAGE,
      key,
      payload: message,
    };
  },
};

/**
 * Process the value provided by get() function and place in context
 */
export function reducer(state, {
  type, key, payload,
}) {
  switch (type) {
    case GET_LATEST_MESSAGE:
      return {
        ...state,
        [key]: payload,
      };
    default:
      return state;
  }
}

export const Context = React.createContext();
