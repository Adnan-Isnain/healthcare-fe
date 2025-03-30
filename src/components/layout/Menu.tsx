import React from 'react';
import { Menu as AntMenu, Drawer } from 'antd';
import { Link } from 'react-router-dom';
import { 
  HomeOutlined, 
  TeamOutlined, 
  MedicineBoxOutlined, 
  UserOutlined,
  PlusCircleOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import { Permission } from '../../utils/permissions';

interface MenuProps {
  location: { pathname: string };
  onMobileMenuClose: () => void;
  mobileOpen: boolean;
  can: (permission: Permission) => boolean;
  collapsed?: boolean;
}

const Menu: React.FC<MenuProps> = ({
  location,
  onMobileMenuClose,
  mobileOpen,
  can,
  collapsed = false,
}) => {
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined className="text-lg" />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/patients',
      icon: <TeamOutlined className="text-lg" />,
      label: <Link to="/patients">Patients</Link>,
    },
    {
      key: 'treatments',
      icon: <MedicineBoxOutlined className="text-lg" />,
      label: 'Treatments',
      children: [
        {
          key: '/treatments',
          icon: <MedicineBoxOutlined className="text-lg" />,
          label: <Link to="/treatments">View All</Link>,
        },
        {
          key: '/treatments/new',
          icon: <PlusCircleOutlined className="text-lg" />,
          label: <Link to="/treatments/new">Add Treatment</Link>,
        },
        {
          key: '/medications/new',
          icon: <FileAddOutlined className="text-lg" />,
          label: <Link to="/medications/new">Add Medication</Link>,
        }
      ]
    }
  ];

  const isUser = can(Permission.READ_USER);
  if (isUser) {
    menuItems.push({
      key: '/users',
      icon: <UserOutlined className="text-lg" />,
      label: <Link to="/users">Users</Link>,
    });
  }

  const menuContent = (
    <AntMenu
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={collapsed ? [] : ['treatments']}
      style={{ 
        height: '100%', 
        borderRight: 0,
      }}
      items={menuItems}
      onClick={onMobileMenuClose}
      inlineCollapsed={collapsed}
      className="border-none"
    />
  );

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden md:block h-full">
        {menuContent}
      </div>

      {/* Mobile Menu */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={onMobileMenuClose}
        open={mobileOpen}
        width={250}
        className="md:hidden"
        styles={{
          body: {
            padding: 0
          },
          header: { 
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0',
          }
        }}
      >
        {menuContent}
      </Drawer>
    </>
  );
};

export default Menu; 