import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Select, Button, message } from 'antd';

function LayoutSelector({
  path,
  selectLayout,
}) {
  const [layouts, setLayouts] = useState({});
  const [form, setForm] = useState({});

  useEffect(() => {
    const layout = localStorage.getItem(path.split('/')[1]);

    try {
      const json = JSON.parse(layout);

      if (typeof json !== 'object' || json === null) {
        throw new Error('The layout configuration for this page is invalid.');
      }

      setLayouts(json);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const changeLayout = () => {
    if (!form.layout || !form.layout.value) {
      message.error('Could not change layout.');
      return;
    }


    selectLayout(layouts[form.layout.value]);
  };

  return (
    <div>
      <Select
        className="w-64 mr-3"
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
        {
          Object.keys(layouts).map(layout => (
            <Select.Option key={layout} value={layout}>{layout}</Select.Option>
          ))
        }
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
  path: PropTypes.string.isRequired,
  selectLayout: PropTypes.func,
};

LayoutSelector.defaultProps = {
  selectLayout: () => {},
};

export default LayoutSelector;
