import React from 'react';
import { Router } from '@reach/router';

import Navbar from './components/Global/Navbar';

import Home from './pages/Home';
import routes from './routes';

const App = () => (
  <div>
    <header>
      <Navbar current="home" />
    </header>
    <Router>
      <Home path="/" />
      {
        routes.map(route => (
          <route.component
            key={route.path}
            path={route.path}
            {...route.props}
          />
        ))
      }
    </Router>
  </div>
);

export default App;
