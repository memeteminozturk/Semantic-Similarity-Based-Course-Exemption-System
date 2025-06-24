// src/components/wizard/steps/Finalization.jsx
import React, { useState } from 'react';
import { Card, Button, Row, Col, Alert, Spin, Typography, List, Space, Divider } from 'antd';
import { useSelector } from 'react-redux';
import { FilePdfOutlined, CheckCircleFilled, FileWordOutlined } from '@ant-design/icons';
import { generatePdf } from '@/services/api';
import { usePdf } from '@/contexts/PdfContext';
import { INTERNAL_COURSES } from '@/constants/internalCourses';

const { Text, Title, Paragraph } = Typography;

export default function Finalization() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { pdfBlob, setPdf } = usePdf();
    const personalInfo = useSelector(state => state.wizard.personalInfo);
    const courses = useSelector(state => state.wizard.courses);
    const matches = useSelector(state => state.wizard.matches);
    const selectedMatches = useSelector(state => state.wizard.selectedMatches);    // Get selected match details - format for API
    const selectedCourses = matches
        .filter(match => selectedMatches.includes(match.id))
        .map(match => {
            // Find the corresponding course from courses list for external course details
            const externalCourse = courses.find(course => course.code === match.courseCode);
            
            // Find internal course details from INTERNAL_COURSES
            const internalCourse = INTERNAL_COURSES.find(course => course.code === match.matchedWith);
            
            // Format credit info as T-U-K string
            const formatCredit = (course) => {
                if (course?.theory !== undefined && course?.practice !== undefined && course?.nationalCredit !== undefined) {
                    return `${course.theory}-${course.practice}-${course.nationalCredit}`;
                }
                return course?.credit || '3-0-3'; // Fallback to default credit
            };
            
            return {
                ext_code: match.courseCode,
                ext_name: externalCourse?.name || match.courseCode,
                ext_credit: formatCredit(externalCourse),
                ext_content: match.courseContent || 'Course content not available',
                int_code: match.matchedWith,
                int_name: internalCourse?.name || match.matchedWith,
                int_credit: formatCredit(internalCourse),
                int_content: match.matchedContent || 'Internal course content',
                similarity_percent: Math.round(match.score * 100),
                exempt: true // All selected courses are for exemption
            };
        });const handleGeneratePdf = async () => {
        try {
            setLoading(true);
            setError(null);            // Prepare personal info in the format expected by API
            const personalInfoForApi = {
                firstName: personalInfo.fullName ? personalInfo.fullName.split(' ')[0] : '',
                lastName: personalInfo.fullName ? personalInfo.fullName.split(' ').slice(1).join(' ') : '',
                studentNumber: personalInfo.studentId || '',
                university: personalInfo.university || '',
                faculty: personalInfo.faculty || '',
                department: personalInfo.department || '',
                email: personalInfo.email || '',
                phone: personalInfo.phone || ''
            };

            console.log('Generating Word document with data:', {
                personalInfo: personalInfoForApi,
                selectedCourses: selectedCourses
            });            // Call the API to generate Word document (endpoint still named generate-pdf for compatibility)
            const docBlob = await generatePdf(personalInfoForApi, selectedCourses);
            setPdf(docBlob);

            setLoading(false);
        } catch (err) {
            console.error('Word document generation error:', err);
            setError(err.message || 'Dilekçe oluşturulurken bir hata oluştu');
            setLoading(false);
        }
    };

    return (
        <div>
            <Card title="Dilekçe Oluşturma" bordered={false}>
                <Alert
                    message="Muafiyet Dilekçenizi Oluşturun"
                    description={
                        <Paragraph>
                            Şimdiye kadar sağladığınız bilgiler ve seçtiğiniz dersler kullanılarak muafiyet başvuru dilekçeniz oluşturulacaktır.
                            Dilekçeyi oluşturmak için aşağıdaki butona tıklayın.
                        </Paragraph>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Card size="small" title="Kişisel Bilgiler">
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <p><strong>Öğrenci No:</strong> {personalInfo.studentId}</p>
                                    <p><strong>Ad Soyad:</strong> {personalInfo.fullName}</p>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <p><strong>Telefon:</strong> {personalInfo.phone}</p>
                                    <p><strong>E-posta:</strong> {personalInfo.email}</p>
                                    <p><strong>Geçiş Türü:</strong> {personalInfo.transferType === 'yatay' ? 'Yatay Geçiş' : 'Dikey Geçiş'}</p>
                                </Col>
                            </Row>
                        </Card>
                    </Col>                    <Col span={24}>
                        <Card size="small" title="Seçilen Dersler">                            <List
                                itemLayout="horizontal"
                                dataSource={selectedCourses}
                                locale={{ emptyText: 'Hiç ders seçilmedi' }}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<CheckCircleFilled style={{ color: 'green', fontSize: 18 }} />}
                                            title={
                                                <Space>
                                                    <Text strong>{item.ext_code}</Text>
                                                    <Text>{item.ext_name}</Text>
                                                    <Text type="secondary">({item.ext_credit})</Text>
                                                </Space>
                                            }
                                            description={
                                                <Space>
                                                    <Text type="secondary">Eşleşen:</Text>
                                                    <Text>{item.int_code} - {item.int_name}</Text>
                                                    <Text type="secondary">({item.int_credit})</Text>
                                                    <Text type="secondary">(%{item.similarity_percent} benzerlik)</Text>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Divider />                        <Row justify="center" gutter={16}>                            {!pdfBlob ? (
                                <Button
                                    type="primary"
                                    icon={<FileWordOutlined />}
                                    size="large"
                                    onClick={handleGeneratePdf}
                                    loading={loading}
                                    disabled={loading || selectedCourses.length === 0}
                                >
                                    Dilekçeyi Oluştur
                                </Button>
                            ) : (
                                <Alert
                                    message="Dilekçe Hazır"
                                    description="Dilekçeniz başarıyla oluşturuldu. Bir sonraki adımda dilekçeyi indirebilir veya e-posta ile gönderebilirsiniz."
                                    type="success"
                                    showIcon
                                />
                            )}
                        </Row>

                        {loading && (
                            <div style={{ textAlign: 'center', marginTop: 24 }}>
                                <Spin />
                                <p>Dilekçeniz hazırlanıyor...</p>
                            </div>
                        )}

                        {error && (
                            <Alert
                                message="Hata"
                                description={error}
                                type="error"
                                showIcon
                                style={{ marginTop: 24 }}
                            />
                        )}
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
