import React from 'react';

const GET_LATEST_MESSAGE = 'GET_LATEST_MESSAGE';

export const actions = {
  get(key, message) {
    return {
      type: GET_LATEST_MESSAGE,
      key,
      payload: message,
    };
  },
};

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
