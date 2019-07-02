import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Modal, Alert, Form, Input
} from 'antd';


class WidgetConfigDBFormSave extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        name: '',
        description: '',
        author: ''
      },
      formValidation: true
    };
  }

  componentDidMount() {
    const form = {
      name: this.props.dbInfo.name,
      description: this.props.dbInfo.description,
      author: this.props.dbInfo.author
    };
    this.setState({ form });
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.visible && this.props.visible) {
      this.updateFormFromProps();
    }
  }

  updateFormFromProps = () => {
    const form = {
      name: this.props.dbInfo.name,
      description: this.props.dbInfo.description,
      author: this.props.dbInfo.author
    };
    this.setState({ form });
  }

  handleFieldChange = (event) => {
    const { form } = this.state;
    form[event.target.id] = event.target.value;
    this.setState({ form });
  }

  validateForm = () => {
    let valid = true;
    // console.log("validating", this.state.save_form)
    if (this.state.form.name === '') valid = false;
    else if (this.state.form.description === '') valid = false;
    else if (this.state.form.author === '') valid = false;
    this.setState({ formValidation: valid });
    return valid;
  }

  onSaveNew = () => {
    if (this.validateForm) {
      const db = {
        name: this.state.form.name,
        description: this.state.form.description,
        author: this.state.form.author,
        id: ''
      };
      // console.log()
      this.props.update(db);
    }
  }


  onSaveUpdate = () => {
    if (this.validateForm) {
      // update by this.props.dbInfo.id
      const db = {
        name: this.state.form.name,
        description: this.state.form.description,
        author: this.state.form.author,
        id: this.props.dbInfo.id
      };
      // call this.props.update
      this.props.update(db);
    }
  }

  onCancel = () => {
    this.props.close();
  }

  render() {
    const modalButtons = [
      <Button key="back" onClick={this.props.close}>Cancel</Button>,
      <Button key="oknew" type="primary" onClick={this.onSaveNew}>Save New</Button>];
    if (this.props.dbInfo.id !== '') {
      modalButtons.push(<Button key="ok" type="primary" onClick={this.onSaveUpdate}>Save (Update DB)</Button>);
    }

    return (
      <Modal
        visible={this.props.visible}
        title="Configuration Detail"
        onCancel={this.onCancel}
        footer={modalButtons}
      >
        <Form layout="vertical">
          <Form.Item label="Name">
            <Input
              placeholder="Name"
              id="name"
              onChange={this.handleFieldChange}
              value={this.state.form.name}
            />
          </Form.Item>
          <Form.Item label="Author">
            <Input
              placeholder="Author"
              id="author"
              onChange={this.handleFieldChange}
              value={this.state.form.author}
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input
              placeholder="Description"
              id="description"
              onChange={this.handleFieldChange}
              value={this.state.form.description}
            />
          </Form.Item>
          {!this.state.formValidation && <Alert message="All fields required" type="warning" showIcon />}
        </Form>
      </Modal>
    );
  }
}

WidgetConfigDBFormSave.propTypes = {
  update: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  dbInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  }).isRequired
};

export default WidgetConfigDBFormSave;
