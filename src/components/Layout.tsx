import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import Header from './layout/Header';
import Menu from './layout/Menu';

const { Content, Sider } = AntLayout;

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { token: { colorBgContainer } } = theme.useToken();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AntLayout className="min-h-screen">
      <Header
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onToggleMobile={() => setMobileOpen(true)}
        onLogout={handleLogout}
      />

      <AntLayout className="mt-16">
        {/* Desktop Sider */}
        <Sider
          width={200}
          className="bg-white hidden md:block fixed h-[calc(100vh-4rem)] shadow-sm"
          collapsed={collapsed}
          collapsedWidth={80}
          style={{
            overflow: 'auto',
            position: 'fixed',
            left: 0,
            top: 64,
            bottom: 0,
            zIndex: 9,
            transition: 'all 0.2s',
          }}
        >
          <Menu
            location={location}
            onMobileMenuClose={() => setMobileOpen(false)}
            mobileOpen={mobileOpen}
            can={can}
            collapsed={collapsed}
          />
        </Sider>
        
        <AntLayout 
          className="transition-all duration-300"
          style={{ 
            minHeight: 'calc(100vh - 4rem)',
            background: colorBgContainer,
          }}
        >
          <Content 
            className="p-4 md:p-6"
            style={{ 
              overflow: 'auto',
              position: 'relative',
              minHeight: 'calc(100vh - 4rem)',
              paddingLeft: isMobile ? '8px' : (collapsed ? '88px' : '208px'),
              transition: 'padding-left 0.2s',
            }}
          >
            <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
              <Outlet />
            </div>
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};

export default AppLayout; 