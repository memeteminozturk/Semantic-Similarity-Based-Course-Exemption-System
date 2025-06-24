// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import { store } from '@/redux/store';
import { ThemeProvider } from '@/contexts/ThemeContext';
import theme from '@/theme';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';
// Import React 19 compatibility for Ant Design
import '@ant-design/v5-patch-for-react-19';

// Create a QueryClient instance
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);
