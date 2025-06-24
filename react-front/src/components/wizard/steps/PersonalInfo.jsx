// src/components/wizard/steps/PersonalInfo.jsx
import React from 'react';
import { Card, Form, Input, Radio, Row, Col, Alert, Upload, Progress, Typography, message } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setPersonalInfo, setOldContentsFile, setOldContentsFileBlob } from '@/redux/wizardSlice';
import { useFileStore } from '@/contexts/FileStoreContext';
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, InboxOutlined, FilePdfOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useCourseContentParser } from '@/hooks/useCourseContentParser';

const { Dragger } = Upload;
const { Text } = Typography;

export default function PersonalInfo() {
    const [messageApi, contextHolder] = message.useMessage();
    const dispatch = useDispatch();
    const { setOldContentsFile: storeOldContentsFile } = useFileStore();
    const personalInfo = useSelector(state => state.wizard.personalInfo);
    const oldContentsFile = useSelector(state => state.wizard.oldContentsFile);
    const [form] = Form.useForm();

    // Initialize form with any existing values
    React.useEffect(() => {
        form.setFieldsValue(personalInfo);
    }, [form, personalInfo]);

    const handleValueChange = (changedValues) => {
        dispatch(setPersonalInfo(changedValues));
    };
    
    // Eski ders içerikleri için
    const {
        parseContents: parseOldContents,
        isLoading: isParsingOldContents,
        progress: oldContentsProgress
    } = useCourseContentParser();      const handleOldContentsUpload = async (file) => {
        try {
            // File size validation (25MB = 25 * 1024 * 1024 bytes)
            const maxSize = 25 * 1024 * 1024; // 25MB
            if (file.size > maxSize) {
                messageApi.error(`Dosya boyutu çok büyük! Maksimum: 25MB, Yüklenen: ${(file.size / (1024*1024)).toFixed(1)}MB`);
                return false;
            }
            
            // Store the actual file for email attachments
            storeOldContentsFile(file);
            
            // Store file info in Redux for UI
            dispatch(setOldContentsFile({
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
            }));
            
            const result = await parseOldContents(file);

            // If result is a File object, extract only serializable properties
            if (result instanceof File) {
                const { name, type, size, lastModified } = result;
                dispatch(setOldContentsFile({ name, type, size, lastModified }));
            } else {
                // Otherwise pass the result as is (assuming it's already serializable)
                dispatch(setOldContentsFile(result));
            }

            return false; // Prevent default upload behavior
        } catch (error) {
            console.error("Error parsing old contents:", error);
            return false;
        }
    };    return (
        <div>
            {contextHolder}
            <Card
                title="Kişisel Bilgiler"
                bordered={false}
            >                <Alert
                    message="Dilekçe Bilgileri Gerekli"
                    description="Muafiyet başvuru dilekçenizin hazırlanabilmesi için aşağıdaki bilgileri eksiksiz doldurunuz ve eski ders içeriklerinizi PDF formatında yükleyiniz."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={personalInfo}
                    onValuesChange={handleValueChange}
                >                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="studentId"
                                label="Öğrenci Numarası"
                                rules={[{ required: true, message: 'Öğrenci numarası zorunludur!' }]}
                            >
                                <Input
                                    prefix={<IdcardOutlined />}
                                    placeholder="Örn: 2023123456"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="fullName"
                                label="Ad Soyad"
                                rules={[{ required: true, message: 'Ad soyad zorunludur!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Örn: Ahmet Yılmaz"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                name="university"
                                label="Üniversite"
                                rules={[{ required: true, message: 'Üniversite zorunludur!' }]}
                            >
                                <Input
                                    placeholder="Örn: Sivas Cumhuriyet Üniversitesi"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="faculty"
                                label="Fakülte/MYO/YO"
                                rules={[{ required: true, message: 'Fakülte/MYO/YO zorunludur!' }]}
                            >
                                <Input
                                    placeholder="Örn: Mühendislik Fakültesi"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="department"
                                label="Bölüm"
                                rules={[{ required: true, message: 'Bölüm zorunludur!' }]}
                            >
                                <Input
                                    placeholder="Örn: Bilgisayar Mühendisliği"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="phone"
                                label="Telefon"
                                rules={[{ required: true, message: 'Telefon numarası zorunludur!' }]}
                            >
                                <Input
                                    prefix={<PhoneOutlined />}
                                    placeholder="Örn: 05XX XXX XX XX"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label="E-posta"
                                rules={[
                                    { required: true, message: 'E-posta zorunludur!' },
                                    { type: 'email', message: 'Geçerli bir e-posta giriniz!' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="Örn: ornek@email.com"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
            
            {/* Eski Ders İçerikleri Yükleme Bölümü */}
            <Card
                title={<><FilePdfOutlined /> Eski Ders İçerikleri</>}
                extra={oldContentsFile && <CheckCircleOutlined style={{ color: 'green' }} />}
                style={{ marginTop: '24px' }}
            >
                <Alert
                    message="Eski Ders İçerikleri"
                    description="Mail aşamasından önce eski ders içeriklerinizi PDF formatında yüklemeniz gerekmektedir."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                
                <Dragger
                    accept=".pdf"
                    showUploadList={false}
                    beforeUpload={handleOldContentsUpload}
                    disabled={isParsingOldContents || !!oldContentsFile}
                >
                    <p>
                        <InboxOutlined style={{ fontSize: 32, color: '#40a9ff' }} />
                    </p>
                    <p>
                        {oldContentsFile
                            ? <Text strong>Yüklendi: {oldContentsFile.name || 'ders_içerikleri.pdf'}</Text>
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
        </div>
    );
}
