import React, { useState } from 'react';
import { Table, Button, Modal, Space, Tag, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { User, Role } from '../types/user';
import { useUsers, useUserMutations } from '../services/api';
import UserForm from './UserForm';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '../utils/permissions';

const UserList: React.FC = () => {
  const { data: users, error, isValidating } = useUsers();
  const { deleteUser } = useUserMutations();
  const { can } = usePermissions();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'red';
      case Role.DOCTOR:
        return 'blue';
      case Role.NURSE:
        return 'green';
      case Role.STAFF:
        return 'gray';
      default:
        return 'default';
    }
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
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: Role) => (
        <Tag color={getRoleColor(role)}>{role}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space size="middle">
          {can(Permission.UPDATE_USER) && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          )}
          {can(Permission.DELETE_USER) && (
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(record.id)}
              okText="Yes"
              cancelText="No"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Users</h1>
        {can(Permission.CREATE_USER) && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        )}
      </div>

      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={isValidating && !users}
      />

      <Modal
        title={selectedUser ? 'Edit User' : 'Add User'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
      >
        <UserForm
          user={selectedUser}
          onSuccess={handleModalSuccess}
          onCancel={handleModalCancel}
        />
      </Modal>
    </div>
  );
};

export default UserList; 