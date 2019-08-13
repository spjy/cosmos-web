import React from 'react';

import Content from '../components/Missions/Components/Content';
import LayoutManager from '../components/Missions/Components/LayoutManager';

function DashboardManager() {
  return (
    <div className="m-3 shadow">
      <Content
        name="Dashboard Manager"
      >
        <LayoutManager path="ok" />
      </Content>
    </div>
  );
}

export default DashboardManager;
