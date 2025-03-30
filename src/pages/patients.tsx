import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Typography, Tag, Space, Input, Modal, Form, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import { useAPI } from '../services/api';

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  status: string;
  lastVisit: string;
}

const { Title } = Typography;

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  
  // Get API services
  const { usePatients } = useAPI();
  const { patients: apiPatients, getPatients, createPatient, loading, error } = usePatients();

  // Load patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      await getPatients();
    } catch (err) {
      message.error('Failed to fetch patients');
    }
  };

  // When API data changes, update local state
  useEffect(() => {
    if (apiPatients && apiPatients.length > 0) {
      // Transform API data to match our interface if needed
      const formattedPatients = apiPatients.map(patient => ({
        id: patient.id || `P-${patient.patientId}`,
        name: patient.name,
        age: patient.age || 0,
        gender: patient.gender || 'Unknown',
        phone: patient.phone || 'N/A',
        email: patient.email || 'N/A',
        status: patient.status || 'Active',
        lastVisit: patient.lastVisit || 'N/A',
      }));
      setPatients(formattedPatients);
    }
  }, [apiPatients]);

  const columns: ColumnType<PatientData>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      filterSearch: true,
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => {
        if (typeof value === 'string') {
          return record.name.toLowerCase().includes(value.toLowerCase()) ||
                 record.id.toLowerCase().includes(value.toLowerCase());
        }
        return false;
      },
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.phone}</div>
          <div>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Active') color = 'green';
        else if (status === 'New') color = 'gold';
        else if (status === 'Discharged') color = 'red';
        
        return (
          <Tag color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Last Visit',
      dataIndex: 'lastVisit',
      key: 'lastVisit',
    },
    {
      title: <div className="text-center">Actions</div>,
      key: 'actions',
      fixed: 'right',
      render: () => (
        <Space size="small" direction="vertical" className="w-full">
          <Button size="small" type="primary" block>
            View
          </Button>
          <Button size="small" block>
            Edit
          </Button>
          <Button size="small" type="primary" danger block>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddPatient = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields()
      .then(async values => {
        try {
          // Call the API to create a new patient
          await createPatient({
            name: values.name,
            age: values.age,
            gender: values.gender,
            phone: values.phone,
            email: values.email,
          });
          
          message.success('Patient added successfully');
          form.resetFields();
          setIsModalVisible(false);
          
          // Refresh the patients list
          fetchPatients();
        } catch (err) {
          message.error('Failed to add patient');
        }
      })
      .catch(error => {
        console.error('Validation failed:', error);
      });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Show error message if API call fails
  useEffect(() => {
    if (error) {
      message.error(`Error: ${error}`);
    }
  }, [error]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Patients</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddPatient}
        >
          Add Patient
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search patients by name or ID"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            allowClear
            className="max-w-md"
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={patients} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{
            x: 1000,
          }}
        />
      </Card>

      <Modal
        title="Add New Patient"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter patient name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: 'Please enter patient age' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true, message: 'Please select gender' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Patients; 