import React from 'react';

const SET_KEY = 'SET_KEY';
const SET_DATA = 'SET_DATA';

export const actions = {
  /**
   * Add a key within the context
   *
   * @param {String} key Name to give the key in the context
   * @param {*} message Value to store in above key
   */
  set(key, payload) {
    return {
      type: SET_KEY,
      key,
      payload,
    };
  },
  setData(node, data) {
    return {
      type: SET_DATA,
      key: node,
      payload: data,
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
    case SET_KEY:
      return {
        ...state,
        [key]: payload,
      };
    case SET_DATA:
      return {
        ...state,
        data: {
          ...state.data,
          [key]: payload,
        },
      };
    default:
      return state;
  }
}

export const Context = React.createContext({
  data: {},
});
