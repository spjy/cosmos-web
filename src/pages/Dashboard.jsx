import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import AsyncComponent from '../components/AsyncComponent';
import DashboardLayout from './DashboardLayout';

const ResponsiveGridLayout = WidthProvider(Responsive);

function Dashboard({
  id,
  defaultLayout,
  path,
}) {
  const [layouts, setLayouts] = useState({
    lg: [],
  });

  const currentLayout = (l) => setLayouts(l);

  return (
    <div>
      <DashboardLayout
        {...{ id, defaultLayout, path }}
        setLayouts={currentLayout}
      >
        <ResponsiveGridLayout
          className="layout"
          breakpoints={{
            lg: 996,
          }}
          cols={{
            lg: 12,
          }}
          layouts={layouts}
          margin={[12, 12]}
          draggableHandle=".dragHandle"
          draggableCancel=".preventDragHandle"
          rowHeight={20}
          isDroppable
        >
          {
          layouts !== null
            && layouts.lg !== null
            ? layouts.lg
              .filter(
                (layout) => layout && layout.i && layout.component && layout.component.name,
              )
              .map((layout) => (
                <div
                  className="shadow overflow-y-scroll rounded component-color"
                  key={layout.i}
                >
                  <AsyncComponent
                    component={layout.component.name}
                    props={layout.component.props}
                  />
                  <Button
                    className={`absolute bottom-0 left-0 z-50 mb-1 ml-1 ${visible ? 'block' : 'hidden'}`}
                    shape="circle"
                    layoutkey={layout.i}
                    icon={<CloseOutlined />}
                    onClick={(e) => deleteComponent(e)}
                  />
                </div>
              )) : null
        }
        </ResponsiveGridLayout>

      </DashboardLayout>
    </div>
  );
}

Dashboard.propTypes = {
  id: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  defaultLayout: PropTypes.shape({}).isRequired,
};

export default Dashboard;
