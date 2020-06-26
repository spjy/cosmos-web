import React from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, InputNumber, DatePicker, Button,
} from 'antd';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

function PlotForm({
  form,
  processForm,
  setXRange,
  setYRange,
}) {
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        name="plotsForm"
      >
        <Form.Item label="Name" name="name" hasFeedback>
          <Input onBlur={({ target: { id } }) => processForm(id)} />
        </Form.Item>
        <Form.Item label="Name" name="name" hasFeedback>
          <Input onBlur={({ target: { id } }) => processForm(id)} />
        </Form.Item>
        <Form.Item
          label="Data Limit"
          name="dataLimit"
          hasFeedback
          help="No limit => -1, Limit => positive value"
        >
          <InputNumber
            min={-1}
            max={Infinity}
            onBlur={({ target: { id } }) => processForm(id)}
          />
        </Form.Item>

        <Form.Item label="X Data Key" name="XDataKey" hasFeedback>
          <Input onBlur={({ target: { id } }) => processForm(id)} />
        </Form.Item>

        <Form.Item label="Process X Data key" name="processXDataKey" hasFeedback>
          <TextArea onBlur={({ target: { id } }) => processForm(id)} />
        </Form.Item>

        <Form.Item label="X Range" name="XRange">
          <RangePicker
            className="mr-1"
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            onBlur={setXRange}
          />
        </Form.Item>

            &nbsp;&nbsp;

        <Form.Item name="YRangeMin" noStyle>
          <InputNumber />
        </Form.Item>

            &nbsp;to&nbsp;

        <Form.Item name="YRangeMax" noStyle>
          <InputNumber />
        </Form.Item>

            &nbsp;&nbsp;

        <Button
          onClick={setYRange}
        >
          Set Y Range
        </Button>
      </Form>
    </>
  );
}

PlotForm.propTypes = {
  form: PropTypes.shape.isRequired,
  processForm: PropTypes.func.isRequired,
  setXRange: PropTypes.func.isRequired,
  setYRange: PropTypes.func.isRequired,
};

export default PlotForm;
