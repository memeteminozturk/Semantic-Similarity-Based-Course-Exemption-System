// src/components/SummaryPanel.jsx
import React from 'react';
import { Card, Statistic } from 'antd';

export default function SummaryPanel({ courses }) {
  const totalEcts = courses.reduce((sum, c) => sum + c.ects, 0);

  return (
    <Card title="Özet" aria-label="Ders Özeti">
      <Statistic title="Toplam AKTS" value={totalEcts} />
    </Card>
  );
}
