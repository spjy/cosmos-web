import React from 'react';

const INSERT_AGENT = 'INSERT_AGENT';
const EDIT_AGENT = 'EDIT_AGENT';

export const actions = {
  insert(agent) {
    return {
      type: INSERT_AGENT,
      payload: agent,
    };
  },
  update(proc, node, agent) {
    return {
      type: EDIT_AGENT,
      proc,
      node,
      payload: agent,
    };
  },
};

export function reducer(state, {
  type, payload, proc, node,
}) {
  switch (type) {
    case INSERT_AGENT:
      return {
        ...state,
        payload,
      };
    case EDIT_AGENT:
      return {
        ...state,
        payload: state.payload.map((agent) => {
          if (proc === agent.agent_proc && node === agent.agent_node) {
            return {
              ...agent,
              ...payload,
            };
          }
          return agent;
        }),
      };
    default:
      return state;
  }
}

export const Context = React.createContext();
