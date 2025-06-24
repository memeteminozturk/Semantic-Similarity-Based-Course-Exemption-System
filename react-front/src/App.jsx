// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from '@/components/layout/AppLayout';

// Lazy-loaded components
const TranscriptUploader = lazy(() => import('@/components/TranscriptUploader'));
const ManualCourseForm = lazy(() => import('@/components/ManualCourseForm'));
const ExemptionWizard = lazy(() => import('@/components/wizard/ExemptionWizard'));

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}>
            <Spin size="large" tip="Yükleniyor..." />
          </div>
        }>
          <Routes>
            <Route path="/" element={<ExemptionWizard />} />
            <Route path="/transcript" element={<TranscriptUploader />} />
            <Route path="/manual" element={<ManualCourseForm />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}
