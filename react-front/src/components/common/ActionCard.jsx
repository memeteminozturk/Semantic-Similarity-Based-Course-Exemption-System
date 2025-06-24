// src/components/common/ActionCard.jsx
import React from 'react';
import { Card, Typography, Button, Space } from 'antd';
import { RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * Eylem kartı - bir başlık, açıklama ve eylem butonu içeren kart
 * @param {string} title - Kart başlığı
 * @param {string} description - Kart açıklaması
 * @param {string} buttonText - Buton metni
 * @param {Function} onClick - Buton tıklama olayı
 * @param {React.ReactNode} icon - Kart ikonu
 * @param {string} type - Kart tipi (default, success, warning, error)
 */
export default function ActionCard({ 
  title, 
  description, 
  buttonText = "Başla", 
  onClick, 
  icon, 
  type = "default" 
}) {
  // Kart tipi bazında renkler
  const colors = {
    default: { border: '#e5e7eb', background: '#ffffff' },
    success: { border: '#d1fae5', background: '#f0fdf4' },
    warning: { border: '#fef3c7', background: '#fffbeb' },
    error: { border: '#fee2e2', background: '#fef2f2' },
    info: { border: '#dbeafe', background: '#eff6ff' }
  };
  
  return (
    <Card 
      hoverable
      className="fade-in"
      style={{ 
        borderColor: colors[type].border,
        backgroundColor: colors[type].background
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space align="start">
          {icon && <div>{icon}</div>}
          <div>
            <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>{title}</Title>
            <Text type="secondary">{description}</Text>
          </div>
        </Space>
        
        <Button 
          type={type === 'default' ? 'primary' : type}
          onClick={onClick}
          icon={<RightOutlined />}
        >
          {buttonText}
        </Button>
      </Space>
    </Card>
  );
}
