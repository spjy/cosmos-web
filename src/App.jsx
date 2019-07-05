import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Navbar from './components/Global/Navbar';

import Home from './pages/Home';
import Orbit from './pages/Orbit';
import Attitude from './pages/Attitude';
import Plot from './pages/Plot';
import Path from './pages/Path';
import CosmosTools from './pages/CosmosTools';
import CosmosToolsTest from './pages/CosmosToolsTest';
import LinkStarPingTest from './components/Neutron1/LinkStarPingTest';

const App = () => (
  <div>
    <Router>
      <div>
        <header>
          <Navbar />
        </header>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/orbit" component={Orbit} />
          <Route exact path="/attitude" component={Attitude} />
          <Route exact path="/plot" component={Plot} />
          <Route exact path="/path" component={Path} />
          <Route exact path="/cosmostools" component={CosmosTools} />
          <Route exact path="/cosmostoolstest" component={CosmosToolsTest} />
          <Route exact path="/linkstar" component={LinkStarPingTest} />
        </Switch>
      </div>
    </Router>
  </div>
);

export default App;
