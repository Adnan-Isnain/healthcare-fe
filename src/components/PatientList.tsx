import React, { useState } from 'react';
import { Table, Button, Space, Modal, message, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Patient } from '../types/patient';
import { usePatients, usePatientMutations } from '../services/api';
import PatientForm from './PatientForm';

const PatientList: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const { patients, loading: isLoading } = usePatients();
  const { deletePatient } = usePatientMutations();

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePatient(id);
      message.success('Patient deleted successfully!');
    } catch (error) {
      message.error('Failed to delete patient.');
    }
  };

  const handleCreate = () => {
    setEditingPatient(undefined);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : gender === 'female' ? 'pink' : 'default'}>
          {gender.charAt(0).toUpperCase() + gender.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Patient) => (
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
                title: 'Are you sure you want to delete this patient?',
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
        <h1 className="text-2xl font-bold">Patients</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="bg-blue-600"
        >
          Add Patient
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={patients}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} patients`,
          }}
          scroll={{
            x: 100,
          }}
        />
      </div>

      <Modal
        title={editingPatient ? 'Edit Patient' : 'New Patient'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <PatientForm
          initialValues={editingPatient}
          onSuccess={() => {
            setIsModalVisible(false);
            setEditingPatient(undefined);
          }}
        />
      </Modal>
    </div>
  );
};

export default PatientList; 