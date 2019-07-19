import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import registerServiceWorker from './registerServiceWorker';
import App from './App';
import './App.css';

const load = () => render(
  (
    <AppContainer>
      <App />
    </AppContainer>
  ),
  document.getElementById('root'),
);

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept('./App', load);
}

load();
registerServiceWorker();
