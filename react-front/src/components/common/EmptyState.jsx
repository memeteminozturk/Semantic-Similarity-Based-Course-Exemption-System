// src/components/common/EmptyState.jsx
import React from 'react';
import { Empty, Button, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Boş durum gösterimi için kullanılan bileşen
 * @param {string} description - Açıklama
 * @param {string} buttonText - Buton metni
 * @param {Function} onClick - Buton tıklama olayı
 * @param {React.ReactNode} image - Özel görsel
 */
export default function EmptyState({ 
  description = "Henüz içerik eklenmedi", 
  buttonText, 
  onClick, 
  image 
}) {
  return (
    <div className="text-center p-5 fade-in">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Empty 
          image={image || Empty.PRESENTED_IMAGE_DEFAULT} 
          description={<Text type="secondary">{description}</Text>}
        />
        
        {buttonText && onClick && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onClick}
          >
            {buttonText}
          </Button>
        )}
      </Space>
    </div>
  );
}
