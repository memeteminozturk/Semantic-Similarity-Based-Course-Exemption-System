// src/components/wizard/steps/Completion.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Alert, message, Result, Space, Input, Form, Spin, Switch, Tooltip } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setSubmissionStatus } from '@/redux/wizardSlice';
import {
    DownloadOutlined,
    SendOutlined,
    CheckCircleOutlined,
    FileWordOutlined,
    PaperClipOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { sendEmail } from '@/services/api';
import { usePdf } from '@/contexts/PdfContext';
import { useFileStore } from '@/contexts/FileStoreContext';

export default function Completion() {
    const [messageApi, contextHolder] = message.useMessage();
    const [sending, setSending] = useState(false);
    const [form] = Form.useForm();
    const [includeTranscript, setIncludeTranscript] = useState(true);
    const [includeCourseContents, setIncludeCourseContents] = useState(true);
    
    const dispatch = useDispatch();
    const { pdfBlob } = usePdf();
    const { getTranscriptFile, getOldContentsFile } = useFileStore();
    
    const isSubmitted = useSelector(state => state.wizard.isSubmitted);
    const isSuccess = useSelector(state => state.wizard.isSuccess);
    const personalInfo = useSelector(state => state.wizard.personalInfo);
    const selectedMatches = useSelector(state => state.wizard.selectedMatches);
    const transcriptFile = useSelector(state => state.wizard.transcriptFile);
    const oldContentsFile = useSelector(state => state.wizard.oldContentsFile);    // Form değerlerini personalInfo değiştiğinde güncelle
    useEffect(() => {
        form.setFieldsValue({
            departmentEmail: '2021123087@cumhuriyet.edu.tr',
            customMessage: ''
        });
    }, [personalInfo, form]);// Handle Word document download
    const handleDownload = () => {
        if (!pdfBlob) {
            messageApi.error('İndirilecek dilekçe bulunamadı.');
            return;
        }

        try {
            // Create a new blob with correct MIME type for Word documents
            const wordBlob = new Blob([pdfBlob], { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            
            const url = URL.createObjectURL(wordBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `muafiyet_dilekcesi_${personalInfo.studentId || 'ogrenci'}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);            messageApi.success('Dilekçe indiriliyor...');
        } catch (error) {
            console.error('Download error:', error);
            messageApi.error('Dilekçe indirilemedi: ' + error.message);
        }
    };    // Handle sending email
    const handleSendEmail = async (values) => {
        try {
            setSending(true);

            if (!pdfBlob) {
                throw new Error('Gönderilecek dilekçe bulunamadı.');
            }            // Prepare student info for email
            const studentInfoForEmail = {
                firstName: personalInfo.fullName ? personalInfo.fullName.split(' ')[0] : '',
                lastName: personalInfo.fullName ? personalInfo.fullName.split(' ').slice(1).join(' ') : '',
                studentNumber: personalInfo.studentId || '',
                university: personalInfo.university || '',
                faculty: personalInfo.faculty || '',
                department: personalInfo.department || '',
                email: personalInfo.email || '',
                phone: personalInfo.phone || ''
            };

            // Get file attachments if selected
            const transcriptFileBlob = includeTranscript ? getTranscriptFile() : null;
            const courseContentsFileBlob = includeCourseContents ? getOldContentsFile() : null;

            console.log('Sending comprehensive email with attachments:', {
                exemption: !!pdfBlob,
                transcript: !!transcriptFileBlob,
                courseContents: !!courseContentsFileBlob
            });            // Send email with all attachments
            await sendEmail(
                values.departmentEmail,
                `Muafiyet Başvurusu - ${personalInfo.fullName || 'Öğrenci'} (${personalInfo.studentId || 'Öğrenci No'})`, // Sabit konu
                pdfBlob,
                studentInfoForEmail,
                transcriptFileBlob,
                courseContentsFileBlob,
                personalInfo.email, // CC to student's email (sabit)
                values.customMessage
            );

            // Update submission status
            dispatch(setSubmissionStatus({
                isSuccess: true,
                errorMessage: ''
            }));

            messageApi.success('Başvurunuz başarıyla gönderildi!');
            form.resetFields();
            
        } catch (error) {
            console.error('Email error:', error);
            messageApi.error('E-posta gönderimi başarısız oldu: ' + error.message);

            dispatch(setSubmissionStatus({
                isSuccess: false,
                errorMessage: error.message
            }));
        } finally {
            setSending(false);
        }
    };    return (
        <div>
            {contextHolder}

            {!isSubmitted ? (
                <Card title="Başvuruyu Tamamla" bordered={false}>
                    <Alert
                        message="Son Adım"
                        description="Dilekçenizi indirebilir veya doğrudan e-posta ile gönderebilirsiniz."
                        type="info"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />

                    <Row gutter={[0, 24]} justify="center">
                        <Col span={24}>
                            <Card
                                title={<><FileWordOutlined /> Dilekçe</>}
                                size="small"
                            >
                                <p style={{ textAlign: 'center' }}>Muafiyet dilekçeniz hazır. Aşağıdaki seçeneklerden birini kullanarak işlemi tamamlayabilirsiniz.</p>
                                <div style={{ marginTop: 16 }}>
                                    <p><strong>Dosya Adı:</strong> muafiyet_dilekcesi_{personalInfo.studentId || 'ogrenci'}.docx</p>
                                    <p><strong>Boyut:</strong> {pdfBlob ? Math.round(pdfBlob.size / 1024) : 0} KB</p>
                                    <p><strong>Oluşturulma Tarihi:</strong> {new Date().toLocaleString('tr-TR')}</p>
                                    <p><strong>İçerilen Dersler:</strong> {selectedMatches.length} ders</p>
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} md={12} style={{ textAlign: 'center' }}>
                            <Card 
                                title={<><DownloadOutlined /> İndir</>}
                                size="small"
                                style={{ height: '100%' }}
                            >
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    size="large"
                                    onClick={handleDownload}
                                    block
                                >
                                    Dilekçeyi İndir
                                </Button>
                                <p style={{ marginTop: 8 }}>Dilekçeyi bilgisayarınıza indirin</p>
                            </Card>
                        </Col>

                        <Col xs={24} md={12} style={{ textAlign: 'center' }}>
                            <Card 
                                title={<><SendOutlined /> E-posta ile Gönder</>}
                                size="small"
                                style={{ height: '100%' }}
                            >                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleSendEmail}
                                    initialValues={{
                                        departmentEmail: '2021123087@cumhuriyet.edu.tr',
                                        customMessage: ''
                                    }}
                                >                                    <Form.Item
                                        name="departmentEmail"
                                        label="Bölüm E-postası"
                                        rules={[
                                            { required: true, message: 'E-posta adresi gereklidir' },
                                            { type: 'email', message: 'Geçerli bir e-posta adresi giriniz' }
                                        ]}
                                    >
                                        <Input placeholder="2021123087@cumhuriyet.edu.tr" />
                                    </Form.Item>

                                    <Alert
                                        message={
                                            <div>
                                                <div><strong>Konu:</strong> Muafiyet Başvurusu - {personalInfo.fullName || 'Öğrenci'} ({personalInfo.studentId || 'Öğrenci No'})</div>
                                                <div style={{ marginTop: 4 }}><strong>Kopya (CC):</strong> {personalInfo.email || 'Sizin e-postanız'}</div>
                                            </div>
                                        }
                                        type="info"
                                        style={{ marginBottom: 16 }}
                                    />

                                    <div style={{ marginBottom: 16 }}>
                                        <Alert
                                            message="Eklenecek Dosyalar"
                                            type="info"
                                            icon={<PaperClipOutlined />}
                                            style={{ marginBottom: 12 }}
                                        />
                                        
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Muafiyet Dilekçesi (.docx)</span>
                                                <CheckCircleOutlined style={{ color: 'green' }} />
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>
                                                    Transkript 
                                                    {transcriptFile && ` (${transcriptFile.name})`}
                                                </span>
                                                <Switch 
                                                    checked={includeTranscript} 
                                                    onChange={setIncludeTranscript}
                                                    disabled={!transcriptFile}
                                                />
                                            </div>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>
                                                    Ders İçerikleri 
                                                    {oldContentsFile && ` (${oldContentsFile.name})`}
                                                </span>
                                                <Switch 
                                                    checked={includeCourseContents} 
                                                    onChange={setIncludeCourseContents}
                                                    disabled={!oldContentsFile}
                                                />
                                            </div>
                                        </Space>
                                    </div>

                                    <Form.Item
                                        name="customMessage"
                                        label={
                                            <span>
                                                Ek Mesaj 
                                                <Tooltip title="İsteğe bağlı özel mesajınızı buraya yazabilirsiniz">
                                                    <InfoCircleOutlined style={{ marginLeft: 4 }} />
                                                </Tooltip>
                                            </span>
                                        }
                                    >
                                        <Input.TextArea 
                                            rows={3} 
                                            placeholder="İsteğe bağlı ek mesajınızı buraya yazın..."
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            icon={<SendOutlined />}
                                            size="large"
                                            loading={sending}
                                            block
                                        >
                                            {sending ? 'Gönderiliyor...' : 'E-posta Gönder'}
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>

                    {sending && (
                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <Spin />
                            <p>E-posta gönderiliyor...</p>
                        </div>
                    )}
                </Card>
            ) : (
                <Result
                    status={isSuccess ? "success" : "error"}
                    title={
                        isSuccess
                            ? "Muafiyet Başvurunuz Tamamlandı!"
                            : "Başvuru Sırasında Bir Problem Oluştu!"
                    }
                    subTitle={
                        isSuccess
                            ? "Başvurunuz başarıyla alındı ve işleme konuldu. Sonuç hakkında bilgilendirileceksiniz."
                            : "Lütfen tekrar deneyiniz veya yönetici ile iletişime geçiniz."
                    }                    extra={[
                        <Button type="primary" onClick={handleDownload} key="download">
                            Dilekçeyi İndir
                        </Button>
                    ]}
                />
            )}
        </div>
    );
}
