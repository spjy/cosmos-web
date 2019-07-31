import React from 'react';

const GET_LATEST_MESSAGE = 'GET_LATEST_MESSAGE';

export const actions = {
  get(nodeproc, message) {
    return {
      type: GET_LATEST_MESSAGE,
      nodeproc,
      payload: message,
    };
  },
};

export function reducer(state, {
  type, nodeproc, payload,
}) {
  switch (type) {
    case GET_LATEST_MESSAGE:
      return {
        ...state,
        [nodeproc]: payload,
      };
    default:
      return state;
  }
}

export const Context = React.createContext();
