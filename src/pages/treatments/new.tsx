import React from 'react';
import { Card, Form, Input, Button, Select, DatePicker, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAPI } from '../../services/api';

const NewTreatment: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { useTreatments } = useAPI();
  const { createTreatment, getTreatmentOptions, loading } = useTreatments();

  const onFinish = async (values: any) => {
    try {
      await createTreatment({
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
      });
      message.success('Treatment created successfully');
      navigate('/treatments');
    } catch (error) {
      message.error('Failed to create treatment');
    }
  };

  return (
    <div className="w-full">
      <Card title="Add New Treatment" className="shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="max-w-2xl mx-auto"
        >
          <Form.Item 
            name="patientId" 
            label="Patient ID" 
            rules={[{ required: true, message: 'Please enter patient ID' }]}
          >
            <Input placeholder="Enter patient ID" />
          </Form.Item>

          <Form.Item 
            name="treatmentOptionId" 
            label="Treatment Type" 
            rules={[{ required: true, message: 'Please select treatment type' }]}
          >
            <Select
              placeholder="Select treatment type"
              loading={loading}
            >
              {getTreatmentOptions && Array.isArray(getTreatmentOptions) && getTreatmentOptions.map((option: { id: string | number; name: string }) => (
                <Select.Option key={option.id} value={option.id}>
                  {option.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="startDate" 
            label="Start Date" 
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item 
            name="endDate" 
            label="End Date"
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item 
            name="notes" 
            label="Notes"
          >
            <Input.TextArea rows={4} placeholder="Treatment notes" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => navigate('/treatments')}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Treatment
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewTreatment; 