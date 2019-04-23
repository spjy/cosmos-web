import React, { Component } from 'react';
import { Button, Icon, Layout } from 'antd';
import PropTypes from 'prop-types';


const ButtonGroup = Button.Group;
const {
  Header, Content, Footer, Sider,
} = Layout;

const widget_style = {
  border:'1px solid #e1e6ef',
  background: '#fff',
  padding:'10px' ,
  margin:"10px",
  borderRadius: "10px"
};
class CosmosWidget extends Component {

  constructor(props){
    super(props);
      this.state = {

      };
  }

  selfDestruct(){
    this.props.selfDestruct({ id: this.props.id });
  }
  openForm(){
    this.props.editWidget();
  }

  render(){

    return(
      <Layout style={widget_style}>
        <Content>
          <div style={{margin:"10px"}}> <p style={{display:"inline"}}><b>{this.props.title}</b></p>
          { this.props.mod &&
            <ButtonGroup size="small" style={{display:"inline", float:"right"}}>
              <Button  onClick={this.openForm.bind(this)}><Icon type="setting"/></Button>
              <Button  onClick={this.selfDestruct.bind(this)}><Icon type="delete"/></Button>
            </ButtonGroup>
          }
          </div>
          {this.props.children}
        </Content>

      </Layout>
    );


  }
}
CosmosWidget.propTypes = {
  id: PropTypes.number.isRequired,            //
  // info : PropTypes.instanceOf(CosmosWidgetInfo).isRequired,
  title : PropTypes.string.isRequired,
  mod : PropTypes.bool.isRequired,  // true: show edit/delete buttons
  selfDestruct: PropTypes.func,
  editWidget : PropTypes.func,
  children : PropTypes.node,                   // main content of widget


}
export default CosmosWidget;
