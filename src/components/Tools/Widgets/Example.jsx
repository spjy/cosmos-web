import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Alert } from 'antd';

import CosmosWidget from '../WidgetComponents/CosmosWidget';

class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show_form: false,
      form: {},
      form_valid: true
    };
  }

  onOK = () => {
    const valid = true;
    // do form validation here
    if (valid) {
      this.props.updateInfo(this.props.id, this.state.form);
      this.closeForm();
    }
  }

  openForm = () => {
    this.setState({ show_form: true });
  }

  closeForm = () => {
    this.setState({ show_form: false });
  }


  onCancel = () => {
    const form = this.props.info; // reset form values without saving
    this.setState({ form });
    this.closeForm();
  }

  render() {
    return (
      <CosmosWidget
        id={this.props.id}
        title="Example Widget"
        mod={this.props.mod}
        selfDestruct={this.props.selfDestruct}
        editWidget={this.openForm}
      >
        <Modal
          visible={this.state.show_form}
          title="Widget Settings"
          onOk={this.onOK}
          onCancel={this.onCancel}
        >
          <Form layout="inline">
              Insert form here
          </Form>
          {!this.state.form_valid && <Alert message="Incomplete" type="warning" showIcon />}
        </Modal>
        Insert Widget Content Here
      </CosmosWidget>
    );
  }
}

Example.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.shape({
    widgetClass: PropTypes.string.isRequired
  }).isRequired,
  selfDestruct: PropTypes.func.isRequired,
  updateInfo: PropTypes.func.isRequired,
  mod: PropTypes.bool.isRequired
};
export default Example;
