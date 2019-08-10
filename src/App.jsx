import React from 'react';
import { Router } from '@reach/router';

import Navbar from './components/Global/Navbar';

import Home from './pages/Home';
import Neutron1 from './pages/satellites/Neutron1';
import MASDR from './pages/gs/MASDR';

const App = () => (
  <div>
    <header>
      <Navbar current="home" />
    </header>
    {/* <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/satellite/neutron1" component={Neutron1} />
      <Route exact path="/gs/masdir" component={MASDR} />
    </Switch> */}
    <Router>
      <Home path="/" />
      <Neutron1 path="/satellite/neutron1" />
      <MASDR path="/gs/masdr" />
    </Router>
  </div>
);

export default App;
