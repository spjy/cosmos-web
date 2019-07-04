import React, { Component } from 'react';
import Navbar from '../Global/Navbar';
import CosmosContainer from '../Tools/WidgetComponents/CosmosContainer';

const linkStarPingWidget = require('./LinkStarPing').default;

function getWidgetInfo() {
  return [
    {
      widgetClass: 'LinkStarPing'
    }
  ];
}

class LinkStarPingTest extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const imports = {
      LinkStarPing: linkStarPingWidget
    };
    const widgets = getWidgetInfo();

    return (
      <div>
        <Navbar />
        <div>
          <CosmosContainer
            widgets={widgets}
            imports={imports}
          />
        </div>
      </div>
    );
  }
}

export default LinkStarPingTest;
