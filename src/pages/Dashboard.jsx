import React from 'react';
import PropTypes from 'prop-types';

import State from './State';
import DashboardLayout from './DashboardLayout';

function Dashboard({
  id,
  defaultLayout,
  path,
}) {
  return (
    <State>
      <DashboardLayout
        id={id}
        defaultLayout={defaultLayout}
        path={path}
      />
    </State>
  );
}

Dashboard.propTypes = {
  id: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  defaultLayout: PropTypes.shape({}).isRequired,
};

export default Dashboard;
