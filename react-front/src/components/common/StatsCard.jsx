// src/components/common/StatsCard.jsx
import React from 'react';
import { Card, Statistic } from 'antd';

/**
 * İstatistik gösterimi için kullanılan kart bileşeni
 * @param {string} title - Kart başlığı
 * @param {number|string} value - İstatistik değeri
 * @param {React.ReactNode} icon - İstatistik ikonu
 * @param {string} suffix - Değerin sonuna eklenecek metin (ör: %)
 * @param {string} prefix - Değerin önüne eklenecek metin
 * @param {string} valueStyle - Değer stil objesi
 */
export default function StatsCard({
  title,
  value,
  icon,
  suffix,
  prefix,
  valueStyle,
}) {
  return (
    <Card hoverable className="fade-in">
      <Statistic
        title={title}
        value={value}
        valueStyle={{ color: '#1e3a8a', fontWeight: 'bold', ...valueStyle }}
        prefix={icon || prefix}
        suffix={suffix}
      />
    </Card>
  );
}
