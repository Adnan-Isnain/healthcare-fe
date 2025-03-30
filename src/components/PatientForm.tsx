import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { CreatePatientForm, UpdatePatientForm, Patient } from '../types/patient';
import { usePatientMutations } from '../services/api';

const { Title } = Typography;

interface PatientFormProps {
  initialValues?: Patient;
  onSuccess?: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ initialValues, onSuccess }) => {
  const [form] = Form.useForm();
  const { createPatient, updatePatient } = usePatientMutations();
  const isEditing = !!initialValues;

  const onFinish = async (values: any) => {
    try {
      const formData = {
        ...values,
        // Generate a patientId if not provided (for new patients)
        patientId: values.patientId || `PAT-${Math.floor(Math.random() * 10000)}`,
      };

      if (isEditing) {
        await updatePatient({
          id: initialValues.id,
          ...formData,
        });
        message.success('Patient updated successfully!');
      } else {
        await createPatient(formData);
        message.success('Patient created successfully!');
      }

      form.resetFields();
      onSuccess?.();
    } catch (error) {
      message.error(isEditing ? 'Failed to update patient.' : 'Failed to create patient.');
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <Title level={2} className="mb-6 text-center">
        {isEditing ? 'Edit Patient' : 'New Patient'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Patient Name"
          rules={[{ required: true, message: 'Please enter patient name' }]}
        >
          <Input placeholder="Enter patient name" />
        </Form.Item>

        {!isEditing && (
          <Form.Item
            name="patientId"
            label="Patient ID"
            extra="If left empty, a random ID will be generated"
          >
            <Input placeholder="Enter patient ID (optional)" />
          </Form.Item>
        )}

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full bg-blue-600"
          >
            {isEditing ? 'Update Patient' : 'Create Patient'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PatientForm; 