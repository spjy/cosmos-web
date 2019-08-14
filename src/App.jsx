import React from 'react';
import { Router } from '@reach/router';

import Navbar from './components/Global/Navbar';

import FourOhFour from './pages/404';
import routes from './routes';

const App = () => (
  <div>
    <header>
      <Navbar current="home" />
    </header>
    <Router>
      <FourOhFour default />
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
