import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {  Alert, Modal, Form } from 'antd';

import CosmosWidget from './../CosmosWidgetComponents/CosmosWidget'
import CosmosWidgetInfo from './../CosmosWidgetComponents/CosmosWidgetInfo'


class Example extends Component {

  constructor(props){
    super(props);
      this.state = {
        show_form: false,
        data: [],
        form: {},
        form_valid: true
      };
  }
  openForm(){
    this.setState({show_form:true});
  }
  closeForm(){
    this.setState({show_form:false});
  }
  onOK(){
    var valid = true;
    // do form validation here
    if(valid){
      this.props.updateInfo(this.props.id, this.state.form);
      this.closeForm();
    }
  }
  onCancel (){
    var form = this.props.info; // reset form values without saving
    this.setState({form:form});
    this.closeForm();
  }
  render() {
    return (
      <CosmosWidget
        id = {this.props.id}
        title = {'Example Widget'}
        mod = {this.props.mod}
        selfDestruct = {this.props.selfDestruct}
        editWidget = {this.openForm.bind(this)}
      >
        <Modal
        visible={ this.state.show_form }
        title="Widget Settings"
        onOk={this.onOK.bind(this)}
        onCancel={this.onCancel.bind(this)}
        >
          <Form layout="inline" >
              Insert form here
          </Form>
          {!this.state.form_valid &&  <Alert message="Incomplete" type="warning" showIcon />}
        </Modal>
        Insert Widget Content Here
      </CosmosWidget>
    );


  }
}
Example.propTypes = {
  id: PropTypes.number.isRequired,
  info: PropTypes.instanceOf(CosmosWidgetInfo).isRequired,
  selfDestruct: PropTypes.func.isRequired,
  updateInfo: PropTypes.func.isRequired
}
export default Example;
