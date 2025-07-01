// src/components/wizard/steps/Welcome.jsx
import React from 'react';
import { Card, Typography, Button, Row, Col, Steps, Space } from 'antd';
import {
  FileTextOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  RightOutlined,
  FileProtectOutlined,
  UserOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { nextStep } from '@/redux/wizardSlice';
import { PageHeader } from '@/components/common';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

export default function Welcome() {
  const dispatch = useDispatch();

  const features = [
    {
      title: 'Transkript Yükleme',
      description:
        'Transkriptinizi yükleyerek derslerinizi otomatik olarak çıkarın',
      icon: <FileTextOutlined style={{ fontSize: 24, color: '#1e3a8a' }} />,
    },
    {
      title: 'İçerik Analizi',
      description: 'Eski ve yeni ders içeriklerinin benzerlik analizini yapın',
      icon: <FileSearchOutlined style={{ fontSize: 24, color: '#0ea5e9' }} />,
    },
    {
      title: 'Otomatik Eşleştirme',
      description: 'Benzerlik oranlarına göre derslerinizi eşleştirin',
      icon: <CheckCircleOutlined style={{ fontSize: 24, color: '#10b981' }} />,
    },
    {
      title: 'Dilekçe Oluşturma',
      description: 'Muafiyet başvuru dilekçenizi otomatik olarak hazırlayın',
      icon: <FileProtectOutlined style={{ fontSize: 24, color: '#f59e0b' }} />,
    },
  ];

  const processSteps = [
    {
      title: 'Transkript Yükleme',
      description: 'Transkriptinizi PDF formatında yükleyin',
    },
    {
      title: 'Ders İçerikleri',
      description: 'Daha önce aldığınız derslerin içeriklerini girin',
    },
    {
      title: 'Benzerlik Analizi',
      description: 'Dersler arasında içerik benzerliği hesaplanır',
    },
    {
      title: 'Eşleştirme',
      description: 'Muafiyet talep edeceğiniz dersleri seçin',
    },
    {
      title: 'Kişisel Bilgiler',
      description: 'Dilekçe için gereken bilgilerinizi girin',
    },
    {
      title: 'Başvuru Tamamla',
      description: 'Dilekçenizi indirin ve başvurunuzu tamamlayın',
    },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Muafiyet Başvurusuna Hoş Geldiniz"
        subtitle="Bu sihirbaz yardımıyla, ders muafiyet başvurunuzu kolayca tamamlayabilirsiniz."
      />

      <Row gutter={[24, 24]} className="mb-4">
        {features.map((feature, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card hoverable className={`fade-in`} style={{ height: '100%' }}>
              <div className="text-center">
                <div style={{ marginBottom: 16 }}>{feature.icon}</div>
                <Title level={4}>{feature.title}</Title>
                <Text type="secondary">{feature.description}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Başvuru Süreci" className="mb-4">
        <Steps
          direction="vertical"
          current={-1}
          items={processSteps.map((step, index) => ({
            title: step.title,
            description: step.description,
          }))}
        />
      </Card>

      <div className="text-center mt-4">
        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<RightOutlined />}
            onClick={() => dispatch(nextStep())}
            className="pulse"
          >
            Başvuruya Başla
          </Button>
        </Space>
      </div>
    </div>
  );
}
