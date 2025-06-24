// src/components/layout/AppLayout.jsx
import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, App as AntApp, FloatButton } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTheme } from '@/contexts/ThemeContext';
import { lightTheme, darkTheme } from '@/theme';
import Header from './Header';
import Footer from './Footer';
import './layout.css';

const { Content } = Layout;

export default function AppLayout({ children }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // İlk render sonrası mounted olarak işaretle
  useEffect(() => {
    setMounted(true);
  }, []);

  // İlk render sırasında SSR/hydration uyumsuzluğunu önlemek için
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}></div>;
  }

  return (
    <ConfigProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <AntApp>
        <Layout className="app-layout">
          <Header />
          
          <Content className="app-content">
            <div className="content-container">
              {children}
            </div>
          </Content>
          
          <Footer />
          
          <FloatButton
            icon={<QuestionCircleOutlined />}
            tooltip="Yardım"
            type="primary"
            style={{ right: 24 }}
          />
        </Layout>
      </AntApp>
    </ConfigProvider>
  );
}
