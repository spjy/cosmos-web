import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Alert } from 'antd';

/**
 * The component containing the modal and form for setting settings for widgets.
 */
function WidgetSettings({
  visible,
  closeModal,
  info,
  children,
  submitForm,
  validForm
}) {
  return (
    <Modal
      visible={visible}
      title="Widget Settings"
      /**
       * On pressing the "OK" button at the footer of the modal, call the "submitForm"
       * and "closeModal" prop methods in the parent component (the widget). This will get
       * all off the form values, validate them and close the modal if everything is valid.
       */
      onOk={() => {
        submitForm();
        closeModal();
      }}
      /**
       * On pressing the "Cancel" button at the footer of the modal, close the modal.
       */
      onCancel={() => closeModal()}
    >
      <Form layout="inline">
        {children}
      </Form>
      {!validForm ? <Alert message="Incomplete form." type="warning" showIcon /> : null}
    </Modal>
  );
}

WidgetSettings.propTypes = {
  /** Whether the modal is visible or not. */
  visible: PropTypes.bool.isRequired,
  /** The function to handle the closing of the modal. */
  closeModal: PropTypes.func.isRequired,
  info: PropTypes.shape({
    widgetClass: PropTypes.string.isRequired
  }).isRequired,
  /** Children prop */
  children: PropTypes.node,
  /** The function to handle the submission of the form. */
  submitForm: PropTypes.func.isRequired,
  /** The function to handle the determination of the validity of the form. */
  validForm: PropTypes.bool.isRequired
};

WidgetSettings.defaultProps = {
  children: []
};

const SettingsForm = Form.create({ name: 'horizontal_login' })(WidgetSettings);

export default SettingsForm;
