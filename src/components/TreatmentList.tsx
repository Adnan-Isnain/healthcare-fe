import React, { useState } from 'react';
import { Table, Button, Space, Modal, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Treatment } from '../types/treatment';
import { useTreatments, useTreatmentMutations, useTreatmentOptions, useMedications } from '../services/api';
import TreatmentForm from './TreatmentForm';

const TreatmentList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | undefined>();
  const navigate = useNavigate();
  const { data: treatments, isLoading: isLoadingTreatments } = useTreatments();
  const { data: treatmentOptions } = useTreatmentOptions();
  const { data: medications } = useMedications();
  const { deleteTreatment } = useTreatmentMutations();

  // Create maps to easily look up names by slugs
  const treatmentOptionsMap = treatmentOptions?.reduce((acc, option) => {
    acc[option.slug] = option.name;
    return acc;
  }, {} as Record<string, string>) || {};

  const medicationsMap = medications?.reduce((acc, medication) => {
    acc[medication.slug] = medication.name;
    return acc;
  }, {} as Record<string, string>) || {};

  const handleEdit = (treatment: Treatment) => {
    // Transform backend data model to frontend form model
    const transformedTreatment = {
      ...treatment,
      dateOfTreatment: treatment.date,
      treatmentDescription: treatment.treatmentOptions,
      medicationsPrescribed: treatment.medications
    };
    
    setEditingTreatment(transformedTreatment as any);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTreatment(id);
      message.success('Treatment record deleted successfully!');
    } catch (error) {
      message.error('Failed to delete treatment record.');
    }
  };

  const handleCreate = () => {
    setEditingTreatment(undefined);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patientName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Treatments',
      dataIndex: 'treatmentOptions',
      key: 'treatmentOptions',
      render: (options: string[]) => (
        <Space wrap>
          {options.map((slug, index) => (
            <Tag key={index} color="blue">{treatmentOptionsMap[slug] || slug}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Medications',
      dataIndex: 'medications',
      key: 'medications',
      render: (meds: string[]) => (
        <Space wrap>
          {meds.map((slug, index) => (
            <Tag key={index} color="green">{medicationsMap[slug] || slug}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Cost',
      dataIndex: 'costOfTreatment',
      key: 'costOfTreatment',
      render: (cost: number) => `$${cost.toFixed(2)}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Treatment) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Are you sure you want to delete this treatment record?',
                content: 'This action cannot be undone.',
                onOk: () => handleDelete(record.id),
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Treatment Records</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="bg-blue-600"
        >
          Add Treatment Record
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={treatments}
        rowKey="id"
        loading={isLoadingTreatments}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} treatment records`,
        }}
      />

      <Modal
        title={editingTreatment ? 'Edit Treatment Record' : 'New Treatment Record'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <TreatmentForm
          initialValues={editingTreatment}
          onSuccess={() => {
            setIsModalVisible(false);
            setEditingTreatment(undefined);
          }}
        />
      </Modal>
    </div>
  );
};

export default TreatmentList; 