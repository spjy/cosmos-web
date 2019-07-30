import React, { useState, useEffect } from 'react';
import {
  Icon, Switch, Button, Badge,
} from 'antd';
import PropTypes from 'prop-types';

import ComponentSettings from './ComponentSettings';
import Divider from './Components/Divider';

/**
 * Contains a card with a header, content and footer.
 */
function BaseComponent({
  name,
  subheader,
  liveOnly,
  showStatus,
  status,
  submitForm,
  children,
  formItems,
  handleLiveSwitchChange,
  toolsSlot,
}) {
  /** Handler for the widget settings modal */
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    handleLiveSwitchChange(true);
  }, []);

  return (
    <div className="overflow-y-hidden">
      <ComponentSettings
        visible={openSettings}
        /** Closes the modal. */
        closeModal={() => setOpenSettings(false)}
        /** Handles form submission; updates fields in CosmosToolsTest.jsx and clears form. */
        submitForm={() => {
          submitForm();
        }}
        validForm
      >
        {formItems}
      </ComponentSettings>

      <div className="flex justify-between pr-1 dragHandle cursor-move">
        <div className="flex flex-row flex-shrink-0">
          {showStatus ? (
            <div className="m-1">
              <Badge status={status} />
            </div>
          ) : null}

          <div>
            <div className="font-bold text-lg mr-4">
              {name}
            </div>

            <div className="text-gray-600 text-sm preventDragHandle cursor-auto">
              {subheader}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          {!liveOnly ? (
            <span>
              <Switch
                checkedChildren="Live"
                unCheckedChildren="Past"
                defaultChecked
                onChange={checked => handleLiveSwitchChange(checked)}
              />
              &nbsp;
              &nbsp;
            </span>
          ) : null}

          {
            toolsSlot ? { toolsSlot } : null
          }

          {formItems ? (
            <Button size="small" onClick={() => setOpenSettings(true)}>
              <Icon type="setting" />
            </Button>
          ) : null}
        </div>
      </div>

      <Divider />

      <div className="p-2 overflow-y-scroll h-full">
        {children}
      </div>
    </div>
  );
}

BaseComponent.propTypes = {
  /** Name of the component to display at the time */
  name: PropTypes.string,
  /** Supplementary information below the name */
  subheader: PropTypes.node,
  /** Whether the component can display only live data. Hides/shows the live/past switch. */
  liveOnly: PropTypes.bool,
  /** Function is run when the live/past switch is toggled. */
  handleLiveSwitchChange: (props, propName, componentName) => {
    if (!props.liveOnly) {
      return new Error(
        `${propName} is required when showStatus is true in ${componentName}.`,
      );
    }
  },
  /** Whether to show a circular indicator of the status of the component */
  showStatus: PropTypes.bool,
  /** The type of badge to show if showStatus is true (see the ant design badges component) */
  status: (props, propName, componentName) => {
    if (props.showStatus) {
      return new Error(
        `${propName} is required when showStatus is true in ${componentName}.`,
      );
    }
  },
  /** Callback function to launch event when form gets submitted */
  submitForm: PropTypes.func,
  /** The main content of the component */
  children: PropTypes.node,
  /** Node containing form item components */
  formItems: PropTypes.node,
  /** Top right slot in header */
  toolsSlot: PropTypes.node,
};

BaseComponent.defaultProps = {
  name: '',
  subheader: null,
  showStatus: false,
  liveOnly: false,
  handleLiveSwitchChange: () => {},
  submitForm: () => {},
  status: 'error',
  children: null,
  formItems: null,
  toolsSlot: null,
};

export default BaseComponent;
