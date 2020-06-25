import React, { useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  Context, reducer,
} from '../store/dashboard';

function State({
  children,
}) {
  /**
   * Store the agent statuses in the global store.
   */
  const [state, dispatch] = useReducer(reducer, {});

  return (
    <Context.Provider value={{ state, dispatch }}>
      { children }
    </Context.Provider>
  );
}

State.propTypes = {
  children: PropTypes.node.isRequired,
};

export default State;
