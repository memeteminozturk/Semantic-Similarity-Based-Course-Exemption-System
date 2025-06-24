// src/components/wizard/steps/TranscriptStep.jsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Upload, Progress, Button, Card, Alert, Typography, Spin, Table, Checkbox, Modal } from 'antd';
import { InboxOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { usePdfParser } from '@/hooks/usePdfParser';
import { useDispatch, useSelector } from 'react-redux';
import { setCourses, setTranscriptFile } from '@/redux/wizardSlice';
import ManualCourseForm from '@/components/ManualCourseForm';
import { nanoid } from 'nanoid';

const { Dragger } = Upload;
const { Text } = Typography;

const TranscriptStep = forwardRef((props, ref) => {
    const dispatch = useDispatch();
    const transcriptFile = useSelector(state => state.wizard.transcriptFile);
    const courses = useSelector(state => state.wizard.courses);
    
    // State for PDF parsing and course management
    const [coursesToInclude, setCoursesToInclude] = useState([]);
    const [coursesParsed, setCoursesParsed] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Tüm dersleri birleştirmiş kullanıcı arayüz listesi
    const allCourses = React.useMemo(() => {
        const manualCourses = courses || [];
        const extractedCourses = (coursesParsed && coursesToInclude.length > 0) 
            ? coursesToInclude 
            : [];
        return [...manualCourses, ...extractedCourses];
    }, [courses, coursesParsed, coursesToInclude]);
    
    // Dışa aktarılan metotlar
    useImperativeHandle(ref, () => ({
        saveCourseSelection: handleSaveCourseSelection,
        getSelectedCourseCount: () => {
            const manualCourseCount = courses ? courses.length : 0;
            const selectedExtractedCount = (transcriptFile && coursesParsed && coursesToInclude.length > 0) 
                ? coursesToInclude.filter(c => c.selected).length 
                : 0;
            return manualCourseCount + selectedExtractedCount;
        }
    }));

    // Transkript dosyasını ayrıştırma
    const {
        mutate: parseTranscript,
        isLoading: isParsingTranscript,
        progress: transcriptProgress
    } = usePdfParser({
        onSuccess: (parsedCourses) => {
            // Add IDs and selection state to each course
            const coursesWithIds = parsedCourses.map(course => ({
                ...course,
                id: nanoid(),
                selected: true, // Default all courses are selected
            }));
            
            // Set local state for selection UI
            setCoursesToInclude(coursesWithIds);
            setCoursesParsed(true);

            // Create a serializable file representation
            dispatch(setTranscriptFile({
                name: 'transkript.pdf',
                type: 'application/pdf',
                lastModified: new Date().getTime(),
                size: 0, // We don't have the actual size here, but adding for consistency
            }));
        }
    });
    
    // Function to toggle course selection
    const handleToggleCourseSelection = (courseId) => {
        setCoursesToInclude(prevCourses => 
            prevCourses.map(course => 
                course.id === courseId 
                    ? { ...course, selected: !course.selected } 
                    : course
            )
        );
    };

    // Function to save selected courses to Redux
    // Bu fonksiyon ExemptionWizard'daki İleri düğmesi tarafından çağrılacak
    const handleSaveCourseSelection = () => {
        // Transkriptten ve manuel eklenen dersleri birleştir
        const manualCourses = courses || [];
        const selectedExtractedCourses = (transcriptFile && coursesParsed && coursesToInclude.length > 0) 
            ? coursesToInclude.filter(course => course.selected)
            : [];
            
        // Tüm seçilmiş dersleri birleştir
        const allSelectedCourses = [...manualCourses, ...selectedExtractedCourses];
        
        // Redux'a kaydet
        dispatch(setCourses(allSelectedCourses));
        
        return allSelectedCourses.length > 0;
    };
    
    return (
        <div>
            <Alert
                message="Dersleri Ekleyin"
                description="Transkriptinizi yükleyin veya dersleri manuel olarak ekleyerek muafiyet başvurusu için ilerleyebilirsiniz."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />
            
            <div style={{ display: 'flex', marginBottom: '24px' }}>
                <Card
                    title="Transkript Dosyası"
                    extra={transcriptFile && <CheckCircleOutlined style={{ color: 'green' }} />}
                    style={{ width: '100%' }}
                >
                    <Dragger
                        accept=".pdf"
                        showUploadList={false}
                        customRequest={({ file }) => parseTranscript(file)}
                        disabled={isParsingTranscript || !!transcriptFile}
                    >
                        <p>
                            <InboxOutlined style={{ fontSize: 32, color: '#40a9ff' }} />
                        </p>
                        <p>
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
            </div>
            
            {/* Manuel Ders Ekleme Bölümü */}
            <Card
                title="Muafiyet İçin Dersler"
                style={{ marginBottom: 24 }}
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => setIsModalVisible(true)}
                    >
                        Manuel Ders Ekle
                    </Button>
                }
            >
                {allCourses.length > 0 ? (
                    <>
                        <Alert
                            message={`Toplam Ders Sayısı: ${allCourses.length}`}
                            description={
                                transcriptFile 
                                    ? "Aşağıda transkriptinizden çıkarılan ve manuel eklediğiniz dersler listelenmiştir. Yeni ders eklemek için 'Manuel Ders Ekle' butonunu kullanabilirsiniz."
                                    : "Aşağıda eklediğiniz dersler listelenmiştir. Yeni ders eklemek için 'Manuel Ders Ekle' butonunu kullanabilirsiniz."
                            }
                            type="success"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />
                        
                        <Table 
                            dataSource={allCourses}
                            rowKey="id"
                            pagination={{ 
                                pageSize: 8, 
                                showSizeChanger: true, 
                                pageSizeOptions: ['8', '12', '16', '20'],
                                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} ders`
                            }}
                            columns={[
                                {
                                    title: 'Seçim',
                                    dataIndex: 'selected',
                                    width: 80,
                                    render: (_, record) => (
                                        record.isManual ? (
                                            <Checkbox checked disabled />
                                        ) : (
                                            <Checkbox 
                                                checked={record.selected}
                                                onChange={() => handleToggleCourseSelection(record.id)}
                                            />
                                        )
                                    ),
                                },
                                {
                                    title: 'Ders Kodu',
                                    dataIndex: 'code',
                                    key: 'code',
                                },
                                {
                                    title: 'Ders Adı',
                                    dataIndex: 'name',
                                    key: 'name',
                                },
                                {
                                    title: 'Durum',
                                    dataIndex: 'status',
                                    key: 'status',
                                },
                                {
                                    title: 'Kredi',
                                    key: 'credit',
                                    render: (_, record) => (
                                        <span>{`${record.theory}-${record.practice}-${record.nationalCredit}`}</span>
                                    ),
                                },
                                {
                                    title: 'Not',
                                    dataIndex: 'grade',
                                    key: 'grade',
                                },
                                {
                                    title: 'Tür',
                                    key: 'type',
                                    render: (_, record) => (
                                        <span>{record.isManual ? 'Manuel' : 'Transkript'}</span>
                                    ),
                                },
                            ]}
                        />
                    </>
                ) : (
                    <Alert
                        message="Ders Ekleme"
                        description="Transkript yükleyin veya manuel olarak ders ekleyin. Muafiyet başvurusu için en az bir ders gereklidir."
                        type="info"
                        showIcon
                    />
                )}
            </Card>
            
            {/* İşleme sırasında gösterilen spinner */}
            {isParsingTranscript && (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16 }}>Belgeler işleniyor, lütfen bekleyin...</p>
                </div>
            )}
            
            {/* Manuel Ders Ekleme Modalı */}
            <Modal
                title="Manuel Ders Ekleme"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                destroyOnClose={true}
            >
                <Alert 
                    message="Manuel Ders Ekleme"
                    description="Ders bilgilerinizi manuel olarak eklemek için aşağıdaki formu kullanabilirsiniz. Her bir dersi ayrı ayrı ekleyiniz."
                    type="info" 
                    showIcon 
                    style={{ marginBottom: 16 }} 
                />
                <ManualCourseForm onSuccess={() => setIsModalVisible(false)} />
            </Modal>
            
            {/* Transkript yüklenmiş ama ders bulunamadı uyarısı */}
            {transcriptFile && courses && courses.length === 0 && (
                <Alert
                    message="Ders Bulunamadı"
                    description="Transkriptinizden herhangi bir ders çıkarılamadı. Lütfen dosyanın doğru formatta olduğunu kontrol edin veya dersleri manuel olarak ekleyin."
                    type="warning"
                    showIcon
                />
            )}
        </div>
    );
});

export default TranscriptStep;
