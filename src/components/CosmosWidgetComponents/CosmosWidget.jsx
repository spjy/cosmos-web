import React, { Component } from 'react';
import { Button, Icon, Layout } from 'antd';
import PropTypes from 'prop-types';


const ButtonGroup = Button.Group;
const { Content } = Layout;

const widgetStyle = {
  border: '1px solid #e1e6ef',
  background: '#fff',
  padding: '10px',
  margin: '10px',
  borderRadius: '10px'
};

class CosmosWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  selfDestruct = () => {
    this.props.selfDestruct({ id: this.props.id });
  }

  openForm = () => {
    this.props.editWidget();
  }

  render() {
    return (
      <Layout style={widgetStyle}>
        <Content>
          <div style={{ margin: '10px' }}>
            <p style={{ display: 'inline' }}><b>{this.props.title}</b></p>
            { this.props.mod && (
              <ButtonGroup size="small" style={{ display: 'inline', float: 'right' }}>
                <Button onClick={this.openForm}><Icon type="setting" /></Button>
                <Button onClick={this.selfDestruct}><Icon type="delete" /></Button>
              </ButtonGroup>
            )
            }
          </div>
          {this.props.children}
        </Content>
      </Layout>
    );
  }
}

CosmosWidget.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  mod: PropTypes.bool.isRequired,
  selfDestruct: PropTypes.func.isRequired,
  editWidget: PropTypes.func,
  children: PropTypes.node
};

CosmosWidget.defaultProps = {
  children: [],
  editWidget: () => {}
};
export default CosmosWidget;
