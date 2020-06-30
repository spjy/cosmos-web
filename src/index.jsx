import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';

import App from './App';

import store from './store';

import './index.css';

const load = () => render(
  (
    <AppContainer>
      <Provider store={store}>
        <App />
      </Provider>
    </AppContainer>
  ),
  document.getElementById('root'),
);

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept('./App', load);
}

load();
