// src/theme.js
import { theme } from 'antd';

// Üniversite kurumsal renkleri (örnek)
const colors = {
  primary: '#1e3a8a', // Koyu mavi - üniversite ana rengi
  secondary: '#0ea5e9', // Açık mavi - ikincil renk
  accent: '#f59e0b', // Turuncu - vurgu rengi
  success: '#10b981', // Yeşil
  warning: '#f59e0b', // Turuncu
  error: '#ef4444', // Kırmızı
  info: '#3b82f6', // Mavi
  light: '#f3f4f6',
  dark: '#1f2937',
  text: '#374151',
  textLight: '#9ca3af'
};

// Hem açık hem de koyu tema için token konfigürasyonları
const getThemeTokens = (isDark = false) => ({
  colorPrimary: colors.primary,
  colorInfo: colors.info,
  colorSuccess: colors.success,
  colorWarning: colors.warning, 
  colorError: colors.error,
  colorTextBase: isDark ? '#ffffff' : colors.text,
  colorBgBase: isDark ? '#121212' : '#ffffff',
  borderRadius: 8,
  wireframe: false,
  fontSize: 14,
  fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
});

// Koyu tema konfigürasyonu
const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: getThemeTokens(true),
  components: {
    Button: {
      colorPrimaryHover: colors.secondary,
    },
    Card: {
      colorBgContainer: '#1f2937',
    },
    Table: {
      colorBgContainer: '#1f2937',
    },
    Typography: {
      colorText: '#e5e7eb'
    }
  }
};

// Açık tema konfigürasyonu (varsayılan)
const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: getThemeTokens(false),
  components: {
    Button: {
      colorPrimaryHover: colors.secondary,
    },
    Card: {
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
    }
  }
};

export { lightTheme, darkTheme, colors };
export default lightTheme;
