import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Typography, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAPI } from '../services/api';
import { Role } from '../types/user';

const { Title } = Typography;
const { Option } = Select;

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Get API services
  const { useUsers } = useAPI();
  const { users: apiUsers, getUsers, createUser, updateUser, deleteUser, loading, error } = useUsers();

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      await getUsers();
    } catch (err) {
      message.error('Failed to fetch users');
    }
  };

  // When API data changes, update local state
  useEffect(() => {
    if (apiUsers && apiUsers.length > 0) {
      setUsers(apiUsers);
    }
  }, [apiUsers]);

  // Show error message if API call fails
  useEffect(() => {
    if (error) {
      message.error(`Error: ${error}`);
    }
  }, [error]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
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
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        let color = 'blue';
        if (role === 'ADMIN') color = 'red';
        else if (role === 'DOCTOR') color = 'green';
        else if (role === 'NURSE') color = 'purple';
        
        return (
          <Tag color={color}>
            {role}
          </Tag>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserData) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('User deleted successfully');
    } catch (err) {
      message.error('Failed to delete user');
    }
  };

  const handleModalOk = () => {
    form.validateFields()
      .then(async (values) => {
        try {
          if (editingUser) {
            // Update existing user
            await updateUser(editingUser.id, values);
            message.success('User updated successfully');
          } else {
            // Create new user
            await createUser({
              ...values,
              password: values.password || 'password123', // Default password if not provided
            });
            message.success('User created successfully');
          }
          setIsModalVisible(false);
          form.resetFields();
        } catch (err) {
          message.error('Failed to save user');
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Users</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
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
            rules={[{ required: true, message: 'Please enter name' }]}
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
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value={Role.ADMIN}>Admin</Option>
              <Option value={Role.DOCTOR}>Doctor</Option>
              <Option value={Role.NURSE}>Nurse</Option>
              <Option value={Role.STAFF}>Staff</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 