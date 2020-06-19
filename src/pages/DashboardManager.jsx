import React from 'react';

import BaseComponent from '../components/BaseComponent';
// eslint-disable-next-line
import LayoutManager from '../components/LayoutManager';

/**
 * Component that manages the layout configuration page (aka Dashboard Manager).
 */
function DashboardManager() {
  return (
    <div className="m-3 shadow">
      <BaseComponent
        name="Dashboard Manager"
      >
        <LayoutManager />
      </BaseComponent>
    </div>
  );
}

export default DashboardManager;
