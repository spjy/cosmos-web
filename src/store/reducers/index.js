import { SET_KEY, SET_DATA } from '../actions';

/**
 * Process the value provided by get() function and place in context
 */
export default function reducer(state = {
  namespace: {},
  list: {},
}, {
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
