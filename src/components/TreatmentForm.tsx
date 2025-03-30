import React from 'react';
import { 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  Select, 
  InputNumber, 
  Card, 
  Typography, 
  message,
  Spin
} from 'antd';
import { useTreatmentMutations, usePatients, useTreatmentOptions, useMedications } from '../services/api';
import { CreateTreatmentForm, Treatment } from '../types/treatment';
import { Patient } from '../types/patient';

const { Title } = Typography;
const { Option } = Select;

interface TreatmentFormProps {
  initialValues?: Treatment;
  onSuccess?: () => void;
}

const TreatmentForm: React.FC<TreatmentFormProps> = ({ initialValues, onSuccess }) => {
  const [form] = Form.useForm();
  const { data: patients, isLoading: isLoadingPatients } = usePatients();
  const { data: treatmentOptions, isLoading: isLoadingTreatmentOptions } = useTreatmentOptions();
  const { data: medications, isLoading: isLoadingMedications } = useMedications();
  const { createTreatment, updateTreatment } = useTreatmentMutations();
  const isEditing = !!initialValues;

  const onFinish = async (values: any) => {
    try {
      const formData: CreateTreatmentForm = {
        patientId: values.patientId,
        dateOfTreatment: values.dateOfTreatment.toISOString(),
        treatmentDescription: values.treatmentDescription || [],
        medicationsPrescribed: values.medicationsPrescribed || [],
        costOfTreatment: values.costOfTreatment
      };

      if (isEditing) {
        await updateTreatment({
          id: initialValues.id,
          ...formData,
        });
        message.success('Treatment record updated successfully!');
      } else {
        await createTreatment(formData);
        message.success('Treatment record created successfully!');
      }

      form.resetFields();
      onSuccess?.();
    } catch (error) {
      message.error(isEditing ? 'Failed to update treatment record.' : 'Failed to create treatment record.');
    }
  };

  if (isLoadingPatients || isLoadingTreatmentOptions || isLoadingMedications) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <Title level={2} className="mb-6 text-center">
        {isEditing ? 'Edit Treatment Record' : 'New Treatment Record'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues ? {
          ...initialValues,
          dateOfTreatment: initialValues.dateOfTreatment ? new Date(initialValues.dateOfTreatment) : undefined,
        } : undefined}
        requiredMark={false}
      >
        <Form.Item
          name="patientId"
          label="Patient"
          rules={[{ required: true, message: 'Please select a patient' }]}
        >
          <Select placeholder="Select patient">
            {patients?.map((patient: Patient) => (
              <Option key={patient.id} value={patient.id}>
                {patient.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="dateOfTreatment"
          label="Date of Treatment"
          rules={[{ required: true, message: 'Please select treatment date' }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          name="treatmentDescription"
          label="Treatment Descriptions"
          rules={[{ required: true, message: 'Please select at least one treatment' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select treatments"
            optionFilterProp="children"
          >
            {treatmentOptions?.map((option) => (
              <Option key={option.id} value={option.slug}>
                {option.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="medicationsPrescribed"
          label="Medications Prescribed"
          rules={[{ required: true, message: 'Please select at least one medication' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select medications"
            optionFilterProp="children"
          >
            {medications?.map((medication) => (
              <Option key={medication.id} value={medication.slug}>
                {medication.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="costOfTreatment"
          label="Cost of Treatment"
          rules={[{ required: true, message: 'Please enter treatment cost' }]}
        >
          <InputNumber
            className="w-full"
            prefix="$"
            min={0}
            step={0.01}
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="w-full bg-blue-600"
          >
            {isEditing ? 'Update Treatment Record' : 'Create Treatment Record'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TreatmentForm; 