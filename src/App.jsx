import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Navbar from './components/Global/Navbar';

import Home from './pages/Home';
import Neutron1 from './pages/satellites/Neutron1';
import MASDR from './pages/gs/MASDR';

const App = () => (
  <div>
    <Router>
      <div>
        <header>
          <Navbar current="home" />
        </header>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/satellite/neutron1" component={Neutron1} />
          <Route exact path="/gs/masdir" component={MASDR} />
        </Switch>
      </div>
    </Router>
  </div>
);

export default App;
