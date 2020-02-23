import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Select, Button, message } from 'antd';

/**
 * Component to handle the selection of the layout for a dashboard.
 */
function LayoutSelector({
  path,
  selectLayout,
}) {
  /** Store user defined layouts here */
  const [layouts, setLayouts] = useState({});
  /** Store form values here for select */
  const [form, setForm] = useState({});

  /** Retrieve the saved layouts in local storage */
  useEffect(() => {
    // Get the saved layouts from local storage based on route
    const layout = localStorage.getItem(path.split('/')[1]);

    try {
      // Parse and check if layout is in JSON format
      const json = JSON.parse(layout);

      if (typeof json !== 'object' || json === null) {
        throw new Error('The layout configuration for this page is invalid.');
      }

      // If all is well, store in state
      setLayouts(json);
    } catch (error) {
      message.success('Using default layout.', 5);
    }
  }, []);

  /** Handles retrieving the form layout value and sends it to dashboard */
  const changeLayout = () => {
    // Check if the form layout value is non-empty
    if (!form.layout || !form.layout.value) {
      message.error('Could not change layout.', 10);
      return;
    }

    // Check if chosen the default layout.
    if (form.layout.value === 'defaultRouteLayout') {
      // If so, signal with the string 'defaultLayout' to use the default layout of the page.
      selectLayout('defaultRouteLayout');
    } else if (form.layout.value === 'defaultPageLayout') {
      selectLayout('defaultPageLayout');
    } else if (form.layout.value === 'defaultPageLayoutSimple') {
      selectLayout('defaultPageLayoutSimple');
    } else {
      // If not, send the saved layout object to dashboard
      selectLayout(layouts[form.layout.value]);
    }
  };

  return (
    <div className="flex">
      <Select
        className="w-3/4 mr-3 mb-2"
        defaultActiveFirstOption
        dropdownMatchSelectWidth={false}
        showSearch
        placeholder="Select Layout"
        onFocus={() => setForm({
          ...form,
          layout: {
            ...form.layout,
            touched: true,
            changed: false,
          },
        })}
        onChange={value => setForm({
          ...form,
          layout: {
            ...form.layout,
            value,
            changed: false,
          },
        })}
        onBlur={() => {
          setForm({
            ...form,
            layout: {
              ...form.layout,
              changed: true,
            },
          });
        }}
      >
        <Select.OptGroup
          label="System Defined"
        >
          <Select.Option key="defaultRouteLayout" value="defaultRouteLayout">Route Default</Select.Option>
          <Select.Option key="defaultPageLayout" value="defaultPageLayout">Page Default</Select.Option>
          <Select.Option key="defaultPageLayoutSimple" value="defaultPageLayoutSimple">Page Default Simple</Select.Option>
        </Select.OptGroup>

        <Select.OptGroup
          label="User Defined"
        >
          {
            Object.keys(layouts).map(layout => (
              <Select.Option key={layout} value={layout}>{layout}</Select.Option>
            ))
          }
        </Select.OptGroup>
      </Select>

      <Button
        onClick={() => changeLayout()}
      >
        Change Layout
      </Button>
    </div>
  );
}

LayoutSelector.propTypes = {
  /** Current path the user is at */
  path: PropTypes.string.isRequired,
  /** The path the user would like to change to */
  selectLayout: PropTypes.func,
};

LayoutSelector.defaultProps = {
  selectLayout: () => {},
};

export default LayoutSelector;
