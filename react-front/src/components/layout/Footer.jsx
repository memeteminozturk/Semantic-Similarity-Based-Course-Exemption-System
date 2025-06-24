// src/components/layout/Footer.jsx
import React from 'react';
import { Layout, Typography, Space, Row, Col, Divider } from 'antd';
import { useTheme } from '@/contexts/ThemeContext';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

export default function Footer() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <AntFooter className="app-footer">
      <Divider style={{ margin: '0 0 24px 0' }} />
      
      <Row gutter={[24, 24]} justify="space-between">
        <Col xs={24} md={8}>
          <Space direction="vertical" size={8}>
            <Text strong>Ders Muafiyeti Sistemi</Text>
            <Text type="secondary">
              Bu uygulama, öğrencilerin ders muafiyeti başvurularını kolaylaştırmak amacıyla geliştirilmiştir.
            </Text>
          </Space>
        </Col>
        
        {/* <Col xs={24} md={8}>
          <Space direction="vertical" size={8}>
            <Text strong>Hızlı Bağlantılar</Text>
            <Link href="#" target="_blank">Yardım</Link> */}
            {/* <Link href="#" target="_blank">Gizlilik Politikası</Link> */}
            {/* <Link href="#" target="_blank">İletişim</Link> */}
          {/* </Space>
        </Col> */}
        
        <Col xs={24} md={8}>
          <Space direction="vertical" size={8}>
            <Text strong>İletişim</Text>
            <Text type="secondary">memeteminozturk@outlook.com</Text>
            {/* <Text type="secondary">+90 (123) 456 78 90</Text> */}
          </Space>
        </Col>
      </Row>
      
      <Divider style={{ margin: '24px 0 12px 0' }} />
      
      <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
        &copy; {currentYear} Memet Emin Öztürk. Tüm hakları saklıdır.
      </Text>
    </AntFooter>
  );
}
