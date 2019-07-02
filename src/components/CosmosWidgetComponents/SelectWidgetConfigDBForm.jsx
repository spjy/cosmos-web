import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Table, Button, Modal
} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from '../Cosmos/CosmosInfo';

const socket = io(cosmosInfo.socket);

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name'
}, {
  title: 'Description',
  dataIndex: 'description',
  key: 'description'
},
{
  title: 'Author',
  dataIndex: 'author',
  key: 'author'
},
{
  title: 'Created on',
  dataIndex: 'created',
  key: 'created'
},
{
  title: 'Edited',
  dataIndex: 'edited',
  key: 'edited'
},
{
  title: 'Select',
  dataIndex: 'select',
  key: 'select'
}
];
/* This component renders a table containing a list of all configurations
 *  saved to the database and allows the user to select one
 */
class SelectWidgetConfigDBForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      configurationsList: [], /* list of config from DB to populate table */
      selectID: -1 /* shows as SELECTED in table */
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.visible && this.props.visible) this.updateTable();
  }

  itemSelected = key => () => {
    this.select(key);
  }

  receivedDBList = (msg) => {
    // console.log(msg)
    this.setState({
      configurationsList: msg
    });
  }

  updateTable = () => {
    // console.log("update table")
    socket.emit('list_widget_config', {}, this.receivedDBList.bind(this));
  }

  onOK = () => {
    this.close();
  }

  select = (key) => {
    // console.log(key)
    this.setState({ selectID: key });
  }

  close = () => {
    let sel = { id: '' };
    if (this.state.selectID > -1 && this.state.selectID <= this.state.configurationsList.length) {
      sel = this.state.configurationsList[this.state.selectID];
    }
    this.props.close(sel);
  }

  render() {
    const { configurationsList, selectID } = this.state;

    const dbResult = configurationsList;
    const tableContents = [];

    for (let i = 0; i < dbResult.length; i += 1) {
      tableContents[i] = {
        key: String(i),
        name: dbResult[i].name,
        description: dbResult[i].description,
        author: dbResult[i].author,
        created: dbResult[i].created,
        edited: dbResult[i].edited,
        select: <Button key={i} onClick={this.itemSelected(i)}>Select</Button>
      };
      if (i === selectID) {
        tableContents[i].select = <Button disabled>Selected</Button>;
      }
    }

    const modalButtons = [<Button key="back" onClick={this.close}>Cancel</Button>];
    if (this.state.selection === -1) {
      modalButtons.push(<Button key="ok" type="primary" disabled>OK</Button>);
    } else {
      modalButtons.push(<Button key="ok" type="primary" onClick={this.onOK}>OK</Button>);
    }

    return (
      <Modal
        visible={this.props.visible}
        title="Available Configurations"
        footer={modalButtons}
        onCancel={this.close}
        width="100%"
      >
        <Table columns={columns} dataSource={tableContents} size="small" />
      </Modal>
    );
  }
}

SelectWidgetConfigDBForm.propTypes = {
  close: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired
};

export default SelectWidgetConfigDBForm;
