// src/components/layout/Header.jsx
import React from 'react';
import { Layout, Button, Typography, Space, Switch, Row, Col, Divider } from 'antd';
import { MenuOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';
import { colors } from '@/theme';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <AntHeader className="app-header">
      <Row align="middle" justify="space-between" style={{ height: '100%' }}>
        <Col>
          <Space align="center">
            <img 
              src="/kurumsal_logo.png" 
              alt="Üniversite Logo" 
              className="header-logo"
            />
            <Title level={4} style={{ margin: 0, color: theme === 'dark' ? '#fff' : colors.primary }}>
              Ders Muafiyeti Sistemi
            </Title>
          </Space>
        </Col>
        
        <Col>
          <Space>
            <Switch
              checkedChildren={<BulbOutlined />}
              unCheckedChildren={<BulbFilled />}
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          </Space>
        </Col>
      </Row>
    </AntHeader>
  );
}
