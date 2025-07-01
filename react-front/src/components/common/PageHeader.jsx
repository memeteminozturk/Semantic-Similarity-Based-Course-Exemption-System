// src/components/common/PageHeader.jsx
import React from 'react';
import { Typography, Space, Divider } from 'antd';

const { Title, Text } = Typography;

/**
 * Sayfa başlığı ve açıklaması için kullanılan bileşen
 * @param {string} title - Başlık
 * @param {string} subtitle - Alt başlık/açıklama
 * @param {React.ReactNode} extra - Sağda görüntülenecek ekstra içerik
 */
export default function PageHeader({ title, subtitle, extra }) {
  return (
    <div className="fade-in mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>
        {extra && <div>{extra}</div>}
      </div>

      {subtitle && <Text type="secondary">{subtitle}</Text>}

      <Divider style={{ marginTop: 16, marginBottom: 24 }} />
    </div>
  );
}
