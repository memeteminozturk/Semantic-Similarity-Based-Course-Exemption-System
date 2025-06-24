// src/components/wizard/steps/DocumentUpload.jsx
import React, { useState } from 'react';
import { Upload, Card, Row, Col, Progress, Typography, Alert } from 'antd';
import { InboxOutlined, FilePdfOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setTranscriptFile, setOldContentsFile } from '@/redux/wizardSlice';
import { usePdfParser } from '@/hooks/usePdfParser';
import { useCourseContentParser } from '@/hooks/useCourseContentParser';

const { Dragger } = Upload;
const { Title, Text } = Typography;

export default function DocumentUpload() {
    const dispatch = useDispatch();
    const transcriptFile = useSelector((state) => state.wizard.transcriptFile);
    const oldContentsFile = useSelector((state) => state.wizard.oldContentsFile);

    // Custom hooks for PDF parsing
    const {
        mutate: parseTranscript,
        isLoading: isParsingTranscript,
        progress: transcriptProgress
    } = usePdfParser({
        onSuccess: (result) => {
            // Sadece dosyayı kaydet, dersler CourseExtraction bileşeninde çıkarılacak
            dispatch(setTranscriptFile(result));
        }
    });

    const {
        parseContents: parseOldContents,
        isLoading: isParsingOldContents,
        progress: oldContentsProgress
    } = useCourseContentParser();

    const handleOldContentsUpload = async (file) => {
        try {
            const result = await parseOldContents(file);
            dispatch(setOldContentsFile(result));
            return false; // Prevent default upload behavior
        } catch (error) {
            console.error("Error parsing old contents:", error);
            return false;
        }
    };

    return (
        <div>
            <Alert
                message="İki PDF belgesini de yüklemeniz gerekiyor"
                description="Lütfen transkriptinizi ve eski ders içeriklerinizi PDF formatında yükleyin. Her iki belge de yüklenmeden ilerleyemezsiniz."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card
                        title={<><FilePdfOutlined /> Transkript</>}
                        extra={transcriptFile && <CheckCircleOutlined style={{ color: 'green' }} />}
                    >
                        <Dragger
                            accept=".pdf"
                            showUploadList={false}
                            customRequest={({ file }) => parseTranscript(file)}
                            disabled={isParsingTranscript || !!transcriptFile}
                        >
                            <p>
                                <InboxOutlined style={{ fontSize: 48, color: '#40a9ff' }} />
                            </p>              <p>
                                {transcriptFile
                                    ? <Text strong>Yüklendi: {transcriptFile.name || 'transkript.pdf'}</Text>
                                    : "Transkript PDF'ini buraya sürükleyin veya tıklayın"
                                }
                            </p>
                            {!transcriptFile && <p style={{ fontSize: '12px', color: '#999' }}>PDF formatında belge yükleyin</p>}
                        </Dragger>

                        {isParsingTranscript && (
                            <Progress
                                percent={transcriptProgress}
                                status="active"
                                style={{ marginTop: 16 }}
                            />
                        )}
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card
                        title={<><FilePdfOutlined /> Eski Ders İçerikleri</>}
                        extra={oldContentsFile && <CheckCircleOutlined style={{ color: 'green' }} />}
                    >
                        <Dragger
                            accept=".pdf"
                            showUploadList={false}
                            beforeUpload={handleOldContentsUpload}
                            disabled={isParsingOldContents || !!oldContentsFile}
                        >
                            <p>
                                <InboxOutlined style={{ fontSize: 48, color: '#40a9ff' }} />
                            </p>              <p>
                                {oldContentsFile
                                    ? <Text strong>Yüklendi: {oldContentsFile.name || 'ders_icerikleri.pdf'}</Text>
                                    : "Eski Ders İçerikleri PDF'ini buraya sürükleyin veya tıklayın"
                                }
                            </p>
                            {!oldContentsFile && <p style={{ fontSize: '12px', color: '#999' }}>PDF formatında belge yükleyin</p>}
                        </Dragger>

                        {isParsingOldContents && (
                            <Progress
                                percent={oldContentsProgress}
                                status="active"
                                style={{ marginTop: 16 }}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
