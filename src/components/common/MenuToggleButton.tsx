import React from 'react';
import { Button } from 'antd';

interface MenuToggleButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const MenuToggleButton: React.FC<MenuToggleButtonProps> = ({ 
  icon, 
  onClick, 
  className = '' 
}) => (
  <Button
    type="text"
    icon={icon}
    onClick={onClick}
    className={`hover:bg-gray-100 ${className}`}
    style={{ 
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
    }}
  />
);

export default MenuToggleButton; 