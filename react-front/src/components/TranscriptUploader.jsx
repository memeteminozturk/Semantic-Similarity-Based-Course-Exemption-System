// src/components/TranscriptUploader.jsx
import React from 'react';
import {
  Upload,
  Progress,
  Button,
  message as antdMessage,
  Card,
  Space,
  Alert,
  Typography,
} from 'antd';
import { InboxOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { usePdfParser } from '@/hooks/usePdfParser';
import { useDispatch, useSelector } from 'react-redux';
import { setCourses } from '@/redux/courseSlice';
import { useNavigate } from 'react-router-dom';
import CourseTable from './CourseTable';
import SummaryPanel from './SummaryPanel';

const { Dragger } = Upload;

export default function TranscriptUploader() {
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mutate, isLoading, progress } = usePdfParser({
    onSuccess: courses => {
      // Redux state doğrudan güncelleniyor
      dispatch(setCourses(courses));
      console.log('Parsed courses:', courses);
      messageApi.success('Transkript başarıyla işlendi.');
    },
    onError: err => {
      console.error('Parse hatası:', err);
      messageApi.error('Transkript işlenirken hata oluştu.');
    },
  });

  const courses = useSelector(state => state.courses.list);
  return (
    <>
      {contextHolder}
      <div className="wizard-container" aria-label="Transkript Yükleyici">
        <Typography.Title level={2}>Transkript Yükleyici</Typography.Title>

        <Alert
          message="Yeni! Ders Muafiyeti Başvuru Sihirbazı"
          description={
            <div>
              <Typography.Paragraph>
                Ders muafiyeti için başvuru yapmak ister misiniz? Yeni
                sihirbazımız ile transkriptinizi yükleyin, ders içeriklerinizi
                girin ve otomatik dilekçe oluşturun.
              </Typography.Paragraph>
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/muafiyet-sihirbazi')}
              >
                Muafiyet Sihirbazını Başlat
              </Button>
            </div>
          }
          type="success"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* <Card title="Transkript PDF Yükle" style={{ marginBottom: 24 }}>
          <Dragger
            accept=".pdf"
            showUploadList={false}
            customRequest={({ file }) => mutate(file)}
            disabled={isLoading}
          >
            <p>
              <InboxOutlined style={{ fontSize: 24 }} />
            </p>
            <p>Transkript PDF'ini buraya sürükleyin veya tıklayın</p>
          </Dragger>
          {isLoading && <Progress percent={progress} style={{ marginTop: 16 }} />}
        </Card> */}

        {/* Çıktıları göster */}
        {/* <CourseTable courses={courses} />
        <SummaryPanel courses={courses} /> */}
      </div>
    </>
  );
}
