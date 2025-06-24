// src/components/wizard/steps/CourseExtraction.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, Popconfirm, Typography, Space, Card, Alert, Spin, Progress, Row, Col } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { updateCourse, deleteCourse, addCourse, setCourses } from '@/redux/wizardSlice';
import { nanoid } from 'nanoid';
import { PlusOutlined, DeleteOutlined, EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { usePdfParser } from '@/hooks/usePdfParser';

const { Title, Text } = Typography;

const EditableCell = ({
    editing,
    dataIndex,
    title,
    record,
    index,
    children,
    ...restProps
}) => {
    const inputNode = <Input />;

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[{ required: true, message: `Lütfen ${title} giriniz!` }]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

export default function CourseExtraction() {
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [addFormVisible, setAddFormVisible] = useState(false);
    const [newCourse, setNewCourse] = useState({ 
        code: '', 
        name: '', 
        status: 'Z',
        theory: 3,
        practice: 0,
        nationalCredit: 3
    });

    const courses = useSelector(state => state.wizard.courses);
    const transcriptFile = useSelector(state => state.wizard.transcriptFile);
    const dispatch = useDispatch();

    // PDF Parser hook'u kullan
    const {
        mutate: parseTranscript,
        isLoading: isParsingTranscript,
        progress: transcriptProgress
    } = usePdfParser({
        onSuccess: (parsedCourses) => {
            // Parse edilen dersleri Redux state'e kaydet
            const coursesWithIds = parsedCourses.map(course => ({
                ...course,
                id: course.id || nanoid()
            }));
            dispatch(setCourses(coursesWithIds));
            console.log('Parsed courses:', coursesWithIds);
        },
        onError: (err) => {
            console.error('Parse hatası:', err);
        }
    });

    // Transkript dosyası yüklendiyse ve henüz dersler çıkarılmadıysa otomatik olarak işle
    useEffect(() => {
        if (transcriptFile && courses.length === 0 && !isParsingTranscript) {
            parseTranscript(transcriptFile);
        }
    }, [transcriptFile, courses.length, parseTranscript, isParsingTranscript]);

    const isEditing = (record) => record.id === editingKey;

    const edit = (record) => {
        form.setFieldsValue({
            code: record.code,
            name: record.name,
            status: record.status
        });
        setEditingKey(record.id);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (id) => {
        try {
            const row = await form.validateFields();
            dispatch(updateCourse({ id, data: row }));
            setEditingKey('');
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const handleDelete = (id) => {
        dispatch(deleteCourse(id));
    };

    const handleAdd = () => {
        if (newCourse.code.trim() && newCourse.name.trim()) {
            dispatch(addCourse({
                ...newCourse,
                id: nanoid(),
            }));
            setNewCourse({ 
                code: '', 
                name: '', 
                status: 'Z',
                theory: 3,
                practice: 0,
                nationalCredit: 3
            });
            setAddFormVisible(false);
        }
    };    const columns = [
        {
            title: 'Ders Kodu',
            dataIndex: 'code',
            key: 'code',
            editable: true,
            width: '15%',
        },
        {
            title: 'Ders Adı',
            dataIndex: 'name',
            key: 'name',
            editable: true,
            width: '40%',
        },
        {
            title: 'Kredi (T-U-K)',
            key: 'credit',
            width: '15%',
            render: (_, record) => {
                const theory = record.theory || 0;
                const practice = record.practice || 0;
                const credit = record.nationalCredit || 0;
                return `${theory}-${practice}-${credit}`;
            },
        },
        {
            title: 'Durum',
            dataIndex: 'status',
            key: 'status',
            editable: true,
            width: '10%',
            render: (status) => status === 'Z' ? 'Zorunlu' : 'Seçmeli',
        },
        {
            title: 'İşlemler',
            key: 'actions',
            width: '20%',
            render: (_, record) => {
                const editable = isEditing(record); return editable ? (
                    <span>
                        <Button
                            type="link"
                            onClick={() => save(record.id)}
                            style={{ marginRight: 8, padding: 0 }}
                        >
                            Kaydet
                        </Button>
                        <Popconfirm title="İptal etmek istiyor musunuz?" onConfirm={cancel}>
                            <Button type="link" style={{ padding: 0 }}>İptal</Button>
                        </Popconfirm>
                    </span>
                ) : (
                    <Space>
                        <Button
                            icon={<EditOutlined />}
                            disabled={editingKey !== ''}
                            onClick={() => edit(record)}
                            size="small"
                        />
                        <Popconfirm
                            title="Bu dersi silmek istediğinize emin misiniz?"
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Popconfirm>
                    </Space>
                );
            },
        },
    ];

    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });
    return (
        <div>
            <Card title="Transkript'ten Çıkarılan Dersler" extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setAddFormVisible(!addFormVisible)}
                >
                    Ders Ekle
                </Button>
            }>        {isParsingTranscript ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16 }}>Transkript işleniyor, dersler çıkarılıyor...</p>
                    {transcriptProgress > 0 && (
                        <div style={{ width: '80%', margin: '20px auto' }}>
                            <Progress percent={transcriptProgress} />
                        </div>
                    )}
                </div>
            ) : courses.length > 0 ? (
                <Alert
                    message="Dersler Başarıyla Çıkarıldı"
                    description={`Transkriptinizden toplam ${courses.length} ders başarıyla çıkarıldı. Dersleri aşağıdan kontrol edebilir, gerekirse ekleyebilir, düzenleyebilir veya silebilirsiniz.`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            ) : (
                <Alert
                    message="Dersleri Kontrol Edin"
                    description="Transkript yüklendikten sonra dersleriniz otomatik olarak çıkarılacaktır. Dersleri aşağıdan manuel olarak ekleyebilirsiniz."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}                {addFormVisible && (
                    <Card size="small" style={{ marginBottom: 16 }}>
                        <Form layout="vertical" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item label="Ders Kodu" required>
                                        <Input
                                            placeholder="ENG101"
                                            value={newCourse.code}
                                            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Ders Adı" required>
                                        <Input
                                            placeholder="İngilizce I"
                                            value={newCourse.name}
                                            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={2}>
                                    <Form.Item label="Teorik">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={newCourse.theory}
                                            onChange={(e) => setNewCourse({ ...newCourse, theory: parseInt(e.target.value) || 0 })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={2}>
                                    <Form.Item label="Uygulama">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={newCourse.practice}
                                            onChange={(e) => setNewCourse({ ...newCourse, practice: parseInt(e.target.value) || 0 })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={2}>
                                    <Form.Item label="Kredi">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={newCourse.nationalCredit}
                                            onChange={(e) => setNewCourse({ ...newCourse, nationalCredit: parseInt(e.target.value) || 0 })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={2}>
                                    <Form.Item label="Durum">
                                        <select
                                            value={newCourse.status}
                                            onChange={(e) => setNewCourse({ ...newCourse, status: e.target.value })}
                                            style={{ height: 32, borderRadius: 2, width: '100%' }}
                                        >
                                            <option value="Z">Zorunlu</option>
                                            <option value="S">Seçmeli</option>
                                        </select>
                                    </Form.Item>
                                </Col>
                                <Col span={2}>
                                    <Form.Item label=" " style={{ marginBottom: 0 }}>
                                        <Space>
                                            <Button type="primary" onClick={handleAdd}>
                                                Ekle
                                            </Button>
                                            <Button onClick={() => setAddFormVisible(false)}>
                                                İptal
                                            </Button>
                                        </Space>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                )}

                <Form form={form} component={false}>
                    <Table
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        bordered
                        dataSource={courses}
                        columns={mergedColumns}
                        rowClassName="editable-row"
                        pagination={false}
                        rowKey="id"
                        locale={{ emptyText: 'Gösterilecek ders bulunamadı' }}
                    />
                </Form>

                {courses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Text type="secondary">
                            Henüz hiçbir ders eklenmemiş. "Ders Ekle" butonu ile manuel olarak ders ekleyebilirsiniz.
                        </Text>
                    </div>
                )}
            </Card>
        </div>
    );
}
