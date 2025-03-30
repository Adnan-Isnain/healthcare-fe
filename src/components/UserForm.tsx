import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Spin } from 'antd';
import { User, Role, CreateUserForm, UpdateUserForm } from '../types/user';
import { useUserMutations } from '../services/api';

const { Option } = Select;

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { createUser, updateUser } = useUserMutations();
  
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      form.resetFields();
    }
  }, [user, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (user) {
        // Update existing user
        await updateUser({
          id: user.id,
          name: values.name,
          email: values.email,
          role: values.role,
        });
        message.success('User updated successfully');
      } else {
        // Create new user
        await createUser({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        });
        message.success('User created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
      message.error('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ role: Role.STAFF }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter an email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input />
        </Form.Item>

        {!user && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password />
          </Form.Item>
        )}

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select>
            {Object.values(Role).map((role) => (
              <Option key={role} value={role}>
                {role}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {user ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default UserForm; 