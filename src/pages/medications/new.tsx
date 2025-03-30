import React from 'react';
import { Card, Form, Input, Button, Select, InputNumber, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAPI } from '../../services/api';

const NewMedication: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { useTreatments } = useAPI();
  const { createMedication, getMedications, loading } = useTreatments();

  const onFinish = async (values: any) => {
    try {
      await createMedication(values);
      message.success('Medication prescribed successfully');
      navigate('/treatments');
    } catch (error) {
      message.error('Failed to prescribe medication');
    }
  };

  return (
    <div className="w-full">
      <Card title="Prescribe New Medication" className="shadow-md">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="max-w-2xl mx-auto"
        >
          <Form.Item 
            name="treatmentId" 
            label="Treatment ID" 
            rules={[{ required: true, message: 'Please enter treatment ID' }]}
          >
            <Input placeholder="Enter treatment ID" />
          </Form.Item>

          <Form.Item 
            name="medicationId" 
            label="Medication" 
            rules={[{ required: true, message: 'Please select medication' }]}
          >
            <Select
              placeholder="Select medication"
              loading={loading}
            >
              {getMedications?.map(medication => (
                <Select.Option key={medication.id} value={medication.id}>
                  {medication.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="dosage" 
            label="Dosage" 
            rules={[{ required: true, message: 'Please enter dosage' }]}
          >
            <Input placeholder="e.g., 500mg twice daily" />
          </Form.Item>

          <Form.Item 
            name="quantity" 
            label="Quantity" 
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber min={1} className="w-full" placeholder="Quantity" />
          </Form.Item>

          <Form.Item 
            name="instructions" 
            label="Instructions"
            rules={[{ required: true, message: 'Please provide instructions' }]}
          >
            <Input.TextArea rows={4} placeholder="Medication instructions" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => navigate('/treatments')}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Prescribe Medication
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewMedication; 