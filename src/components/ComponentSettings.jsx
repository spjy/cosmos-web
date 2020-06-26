import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';

const padding = {
  padding: '1em',
};

/**
 * The component containing the modal and form for setting settings for widgets.
 * Used in the BaseComponent to set component settings.
 */
function ComponentSettings({
  visible,
  closeModal,
  children,
}) {
  return (
    <Modal
      bodyStyle={padding}
      width={750}
      visible={visible}
      title="Component Settings"
      /**
       * On pressing the "OK" button at the footer of the modal, call the "submitForm"
       * and "closeModal" prop methods in the parent component (the widget). This will get
       * all off the form values, validate them and close the modal if everything is valid.
       */
      okText="Done"
      onOk={() => {
        closeModal();
      }}
      footer={null}
      destroyOnClose
      /**
       * On pressing the "Cancel" button at the footer of the modal, close the modal.
       */
      onCancel={() => closeModal()}
    >
      {children}
      {/* {!validForm ? <Alert message="Incomplete form." type="warning" showIcon /> : null} */}
    </Modal>
  );
}

ComponentSettings.propTypes = {
  /** Whether the modal is visible or not. */
  visible: PropTypes.bool.isRequired,
  /** The function to handle the closing of the modal. */
  closeModal: PropTypes.func.isRequired,
  /** Children prop */
  children: PropTypes.node,
};

ComponentSettings.defaultProps = {
  children: [],
};

export default ComponentSettings;
