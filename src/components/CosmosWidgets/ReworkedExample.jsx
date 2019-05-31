import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

import CosmosWidget from '../CosmosWidgetComponents/CosmosWidget';
import WidgetSettings from './WidgetSettings';

/**
 * Example COSMOS Web widget.
 */
class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openSettings: false,
      form: {}
    };
  }

  /**
   * Function to trigger opening the widget settings modal.
   */
  openSettings() {
    this.setState({
      openSettings: true
    });
  }

  /**
   * Function to trigger closing the widget settings modal.
   */
  closeSettings() {
    this.setState({
      openSettings: false
    });
  }

  /**
   * Handle input values.
   * @param {Object} Event object.
   */
  handleFormChanges(e) {
    const { id, value } = e.target;

    this.setState(prevState => (
      {
        form: {
          ...prevState.form,
          [id]: value
        }
      }
    ));
  }

  /**
   * Handle form submission. Update the values seen in CosmosToolsTest.jsx object.
   */
  submitForm() {
    this.props.updateInfo(this.props.id, this.state.form);
  }

  /** Insert widget specific functions here */

  render() {
    return (
      <div>
        <WidgetSettings
          visible={this.state.openSettings}
          closeModal={() => this.closeSettings()}
          updateInfo={this.props.updateInfo}
          submitForm={() => this.submitForm()}
          validForm
        >
          {/* Insert form items here */}
        </WidgetSettings>

        <CosmosWidget
          id={this.props.id}
          title="Example Widget"
          mod={this.props.mod}
          selfDestruct={this.props.selfDestruct}
          editWidget={() => this.openSettings()}
        >
          {/* Insert card content here */}
        </CosmosWidget>
      </div>
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
