import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Navbar from './components/Global/Navbar';

import Home from './pages/Home';
import neutron1 from './pages/missions/neutron1';

const App = () => (
  <div>
    <Router>
      <div>
        <header>
          <Navbar current="home" />
        </header>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/missions/neutron1" component={neutron1} />
        </Switch>
      </div>
    </Router>
  </div>
);

export default App;
