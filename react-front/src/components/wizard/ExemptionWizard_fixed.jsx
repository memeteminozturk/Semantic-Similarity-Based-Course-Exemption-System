// src/components/wizard/ExemptionWizard.jsx
import React, { useRef } from 'react';
import { Steps, Button, message as antdMessage, Card, Row, Col } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { nextStep, prevStep, resetWizard } from '@/redux/wizardSlice';
import { useNavigate } from 'react-router-dom';
import { PdfProvider, usePdf } from '@/contexts/PdfContext';

// Wizard Steps
import Welcome from './steps/Welcome';
import TranscriptStep from './steps/TranscriptStep';
import CourseContents from './steps/CourseContents';
import Matching from './steps/Matching';
import PersonalInfo from './steps/PersonalInfo';
import Finalization from './steps/Finalization';
import Completion from './steps/Completion';

function ExemptionWizardContent() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const activeStep = useSelector(state => state.wizard.activeStep);
  const transcriptFile = useSelector(state => state.wizard.transcriptFile);
  const oldContentsFile = useSelector(state => state.wizard.oldContentsFile);
  const courses = useSelector(state => state.wizard.courses);
  const courseContents = useSelector(state => state.wizard.courseContents);
  const selectedMatches = useSelector(state => state.wizard.selectedMatches);
  const personalInfo = useSelector(state => state.wizard.personalInfo);
  const matches = useSelector(state => state.wizard.matches);
  const { hasGeneratedPdf } = usePdf();

  // Adım bileşenlerine referanslar
  const transcriptStepRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Adım tanımlamaları
  const steps = [
    {
      title: 'Karşılama',
      description: 'Başlangıç',
      content: <Welcome />,
    },
    {
      title: 'Transkript',
      description: 'Ders Yükleme',
      content: <TranscriptStep ref={transcriptStepRef} />,
      hasCustomAction: true,
    },
    {
      title: 'İçerikler',
      description: 'Ders İçerikleri',
      content: <CourseContents />,
    },
    {
      title: 'Eşleştirme',
      description: 'Benzerlik Analizi',
      content: <Matching />,
    },
    {
      title: 'Kişisel Bilgiler',
      description: 'Bilgileriniz',
      content: <PersonalInfo />,
    },
    {
      title: 'Dilekçe',
      description: 'PDF Oluştur',
      content: <Finalization />,
    },
    {
      title: 'Tamamlandı',
      description: 'Başvuru Tamamlandı',
      content: <Completion />,
    },
  ];

  // Validate if user can proceed to next step
  const canProceed = () => {
    switch (activeStep) {
      case 0: // Welcome - always can proceed
        return true;
      case 1: // Transcript Step
        // Özel işlem - Seçili derslerin kaydedilmesi gerekiyor
        if (transcriptStepRef.current && transcriptFile) {
          return transcriptStepRef.current.saveCourseSelection();
        }
        return courses && courses.length > 0;
      case 2: // Course Contents
        // Check if all courses have content
        return (
          courses &&
          courses.length > 0 &&
          courses.every(course => courseContents[course.id])
        );
      case 3: // Matching
        return selectedMatches && selectedMatches.length > 0;
      case 4: // Personal Info
        const { studentId, fullName, phone, email } = personalInfo;
        return studentId && fullName && phone && email && oldContentsFile;
      case 5: // Finalization
        return hasGeneratedPdf;
      case 6: // Completion - no next step
        return false;
      default:
        return false;
    }
  };

  // Get step validation messages
  const getValidationMessage = () => {
    switch (activeStep) {
      case 1:
        if (!transcriptFile) return 'Lütfen transkript dosyanızı yükleyin';
        if (transcriptStepRef.current) {
          if (!transcriptStepRef.current.saveCourseSelection()) {
            return 'En az bir ders seçmelisiniz';
          }
        }
        if (!courses || courses.length === 0)
          return 'Devam etmek için en az bir ders eklemelisiniz';
        break;
      case 2:
        if (!courses || courses.length === 0) return 'Hiç ders eklenmemiş';
        if (!courses.every(course => courseContents[course.id]))
          return 'Tüm derslerin içeriklerini doldurmalısınız';
        break;
      case 3:
        if (!matches || matches.length === 0)
          return 'Henüz benzerlik analizi yapılmamış. Lütfen analizi başlatın';
        if (!selectedMatches || selectedMatches.length === 0)
          return 'En az bir ders seçmelisiniz';
        break;
      case 4:
        const { studentId, fullName, phone, email } = personalInfo;
        if (!studentId) return 'Öğrenci numaranızı girin';
        if (!fullName) return 'Ad soyadınızı girin';
        if (!phone) return 'Telefon numaranızı girin';
        if (!email) return 'E-posta adresinizi girin';
        if (!oldContentsFile)
          return 'Lütfen eski ders içerikleri dosyanızı yükleyin';
        break;
      case 5:
        if (!hasGeneratedPdf) return 'Lütfen dilekçeyi oluşturun';
        break;
    }
    return '';
  };

  // Handle Next button
  const handleNext = () => {
    if (canProceed()) {
      dispatch(nextStep());
    } else {
      const message = getValidationMessage();
      messageApi.warning(message || 'Lütfen gerekli tüm bilgileri doldurunuz.');
    }
  };

  // Handle Previous button
  const handlePrev = () => {
    dispatch(prevStep());
  };

  // Handle Reset
  const handleReset = () => {
    dispatch(resetWizard());
    navigate('/');
  };

  return (
    <div className="wizard-container" style={{ padding: '24px' }}>
      {contextHolder}
      <Card
        title="Ders Muafiyeti Başvuru Sihirbazı"
        style={{ marginBottom: 24 }}
      >
        <Steps
          current={activeStep}
          items={steps.map(item => ({
            title: item.title,
            description: item.description,
          }))}
          style={{ marginBottom: 40 }}
        />

        <div className="steps-content" style={{ marginBottom: 24 }}>
          {steps[activeStep].content}
        </div>

        <div className="steps-action">
          <Row justify="space-between">
            <Col>
              {activeStep > 0 && (
                <Button style={{ margin: '0 8px' }} onClick={handlePrev}>
                  Geri
                </Button>
              )}
            </Col>
            <Col>
              {activeStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  {activeStep === 1 && transcriptFile
                    ? `Seçili Derslerle Devam Et (${
                        transcriptStepRef.current &&
                        transcriptStepRef.current.getSelectedCourseCount
                          ? transcriptStepRef.current.getSelectedCourseCount()
                          : courses
                            ? courses.length
                            : 0
                      })`
                    : 'İleri'}
                </Button>
              )}

              {activeStep === steps.length - 1 && (
                <Button type="primary" onClick={handleReset}>
                  Ana Sayfaya Dön
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
}

export default function ExemptionWizard() {
  return (
    <PdfProvider>
      <ExemptionWizardContent />
    </PdfProvider>
  );
}
