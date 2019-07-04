import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table, Button, Modal, Input, Form, Alert
} from 'antd';
import io from 'socket.io-client';
import cosmosInfo from '../Cosmos/CosmosInfo';

const socket = io(cosmosInfo.socket);


export function SelectWidgetConfigForm({
  close
}) {
  const [selectID, setSelectID] = useState(-1);

  const [configurationsList, setConfigurationsList] = useState([]);

  if (configurationsList.length < 1) {
    socket.emit('list_widget_config', {}, (msg) => {
      setConfigurationsList(msg);
    });
  }

  const tableContents = [];

  for (let i = 0; i < configurationsList.length; i += 1) {
    tableContents[i] = {
      key: String(i),
      name: configurationsList[i].name,
      description: configurationsList[i].description,
      author: configurationsList[i].author,
      created: configurationsList[i].created,
      edited: configurationsList[i].edited,
      select: <Button key={i} onClick={() => setSelectID(i)}>Select</Button>
    };
    if (i === selectID) {
      tableContents[i].select = <Button disabled>Selected</Button>;
    }
  }


  return (
    <Modal
      visible
      title="Available Configurations"
      footer={(
        <Button
          key="back"
          onClick={() => {
            let sel = { id: '' };
            if (selectID > -1 && selectID <= configurationsList.length) {
              sel = configurationsList[selectID];
            }
            close(sel);
          }}
        >
          Close
        </Button>
    )}
      width="90%"
    >
      <Table
        columns={[{
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
        ]}
        dataSource={tableContents}
        size="small"
      />
    </Modal>
  );
}

SelectWidgetConfigForm.propTypes = {
  close: PropTypes.func.isRequired
};

export function SaveWidgetConfigForm({
  update,
  close,
  dbInfo
}) {
  const [form, updateForm] = useState({
    name: dbInfo.name,
    description: dbInfo.description,
    author: dbInfo.author
  });


  const [formValidation, setFormValidation] = useState(true);

  const validateForm = () => {
    let valid = true;
    // console.log("validating", this.state.save_form)
    if (form.name === '') valid = false;
    else if (form.description === '') valid = false;
    else if (form.author === '') valid = false;
    setFormValidation(valid);
    return valid;
  };

  const handleFieldChange = (event) => {
    // console.log(event.target.id)
    const newForm = form;
    newForm[event.target.id] = event.target.value;
    updateForm(newForm);
  };
  return (
    <Modal
      visible
      title="Configuration Detail"
      onCancel={() => close()}
      footer={(
        <Button.Group>
          <Button key="back" onClick={() => close()}>Cancel</Button>
          <Button
            key="oknew"
            type="primary"
            onClick={() => {
              if (validateForm()) {
                update({
                  name: form.name,
                  description: form.description,
                  author: form.author,
                  id: ''
                });
              }
            }}
          >
            Save New
          </Button>
          {dbInfo.id !== '' && (
            <Button
              key="ok"
              type="primary"
              onClick={() => {
                if (validateForm()) {
                  update({
                    name: form.name,
                    description: form.description,
                    author: form.author,
                    id: dbInfo.id
                  });
                }
              }}
            >
              Save (Update DB)
            </Button>
          )}
        </Button.Group>
      )}
    >
      <Form layout="vertical">
        <Form.Item label="Name">
          <Input
            placeholder="Name"
            id="name"
            onChange={handleFieldChange}
            value={form.name}
          />
        </Form.Item>
        <Form.Item label="Author">
          <Input
            placeholder="Author"
            id="author"
            onChange={handleFieldChange}
            value={form.author}
          />
        </Form.Item>
        <Form.Item label="Description">
          <Input
            placeholder="Description"
            id="description"
            onChange={handleFieldChange}
            value={form.description}
          />
        </Form.Item>
        {!formValidation && <Alert message="All fields required" type="warning" showIcon />}
      </Form>
    </Modal>
  );
}

SaveWidgetConfigForm.propTypes = {
  update: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  dbInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  }).isRequired
};
