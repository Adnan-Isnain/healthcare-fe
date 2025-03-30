import React from 'react';
import { Typography, Avatar, Button } from 'antd';
import { UserOutlined, LogoutOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { User } from '../../types/auth';
import MenuToggleButton from '../common/MenuToggleButton';
import { MenuFoldOutlined, MenuUnfoldOutlined, MenuOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface HeaderProps {
  user: User | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleMobile: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  collapsed,
  onToggleCollapse,
  onToggleMobile,
  onLogout,
}) => {
  return (
    <header className="flex justify-between items-center bg-white shadow fixed w-full z-10 px-4 md:px-6 h-16">
      <div className="flex items-center gap-2">
        {/* Desktop Menu Toggle */}
        <div className="hidden md:block">
          <MenuToggleButton
            icon={collapsed ? <MenuUnfoldOutlined className="text-lg" /> : <MenuFoldOutlined className="text-lg" />}
            onClick={onToggleCollapse}
          />
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="block md:hidden">
          <MenuToggleButton
            icon={<MenuOutlined className="text-lg" />}
            onClick={onToggleMobile}
          />
        </div>

        <Link to="/">
          <div className="flex items-center gap-2">
            <MedicineBoxOutlined className="text-2xl text-blue-600" />
            <Title level={4} className="m-0 hidden md:block">Healthcare System</Title>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <Avatar icon={<UserOutlined className="text-lg" />} />
              <span className="hidden md:inline">{user.name}</span>
            </div>
            <Button 
              icon={<LogoutOutlined className="text-lg" />} 
              onClick={onLogout}
              className="hidden md:flex"
            >
              Logout
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button type="primary" className="bg-blue-600">
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header; 