// src/components/wizard/steps/CourseContents.jsx
import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Typography,
  List,
  Space,
  Alert,
  Button,
  Modal,
  Tooltip,
  Collapse,
  Badge,
  Progress,
  Popconfirm,
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setCourseContent, deleteCourse } from '@/redux/wizardSlice';
import {
  BookOutlined,
  EditOutlined,
  ImportOutlined,
  CopyOutlined,
  CaretRightOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function CourseContents() {
  const dispatch = useDispatch();
  const courses = useSelector(state => state.wizard.courses);
  const courseContents = useSelector(state => state.wizard.courseContents);

  // State for bulk editing
  const [bulkEditVisible, setBulkEditVisible] = useState(false);
  const [bulkEditContent, setBulkEditContent] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState('single'); // 'single' or 'all'

  const handleContentChange = (courseId, content) => {
    dispatch(setCourseContent({ courseId, content }));
  };

  // Handle deleting a course
  const handleDeleteCourse = courseId => {
    dispatch(deleteCourse(courseId));
  };

  // Handle opening bulk edit modal for a specific course
  const handleOpenBulkEdit = (courseId, initialContent = '') => {
    setSelectedCourseId(courseId);
    setBulkEditContent(initialContent);
    setBulkEditMode('single');
    setBulkEditVisible(true);
  };

  // Handle opening bulk edit modal for all courses
  const handleOpenBulkEditAll = () => {
    setSelectedCourseId(null);
    setBulkEditContent('');
    setBulkEditMode('all');
    setBulkEditVisible(true);
  };

  // Handle saving bulk edited content
  const handleSaveBulkEdit = () => {
    if (bulkEditMode === 'single' && selectedCourseId) {
      // Save for a single course
      dispatch(
        setCourseContent({
          courseId: selectedCourseId,
          content: bulkEditContent,
        })
      );
    } else if (bulkEditMode === 'all') {
      // Apply same content to all courses
      courses.forEach(course => {
        dispatch(
          setCourseContent({
            courseId: course.id,
            content: bulkEditContent,
          })
        );
      });
    }

    setBulkEditVisible(false);
  };

  // Handle copying content from one course to another
  const handleCopyContent = fromCourseId => {
    const content = courseContents[fromCourseId] || '';
    navigator.clipboard.writeText(content).then(() => {
      Modal.success({
        title: 'İçerik Kopyalandı',
        content:
          'Ders içeriği panoya kopyalandı. Diğer derslerin içerik alanlarına yapıştırabilirsiniz.',
      });
    });
  };

  const getCompletionStatus = () => {
    const totalCourses = courses.length;
    const filledContents = courses.filter(
      course =>
        courseContents[course.id] && courseContents[course.id].trim() !== ''
    ).length;

    return {
      percentage:
        totalCourses > 0
          ? Math.round((filledContents / totalCourses) * 100)
          : 0,
      filledContents,
      totalCourses,
    };
  };
  const status = getCompletionStatus();

  // Prepare collapse items
  const collapseItems = courses.map(course => {
    const hasContent =
      courseContents[course.id] && courseContents[course.id].trim() !== '';
    const contentLength = (courseContents[course.id] || '').length;
    const isContentShort = contentLength < 200;

    return {
      key: course.id,
      label: (
        <Space>
          <BookOutlined />
          <Text strong>{course.code}</Text>
          {course.name}
          {hasContent ? (
            <Badge status="success" text="İçerik Tamam" />
          ) : (
            <Badge status="error" text="İçerik Girilmedi" />
          )}
        </Space>
      ),
      extra: (
        <Space onClick={e => e.stopPropagation()}>
          {hasContent && (
            <Tooltip title="İçeriği Kopyala">
              <Button
                icon={<CopyOutlined />}
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  handleCopyContent(course.id);
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Tam Ekran Düzenle">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={e => {
                e.stopPropagation();
                handleOpenBulkEdit(course.id, courseContents[course.id] || '');
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Dersi Sil"
            description="Bu dersi silmek istediğinizden emin misiniz?"
            onConfirm={e => {
              e?.stopPropagation();
              handleDeleteCourse(course.id);
            }}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Dersi Sil">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                onClick={e => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      children: (
        <div>
          {hasContent && (
            <div style={{ marginBottom: 8 }}>
              <Progress
                percent={Math.min(100, Math.ceil(contentLength / 2))}
                size="small"
                status={isContentShort ? 'warning' : 'success'}
                showInfo={false}
              />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                İçerik uzunluğu: {contentLength} karakter{' '}
                {isContentShort && '(Önerilen: en az 200 karakter)'}
              </Text>
            </div>
          )}
          <Form.Item
            label="Ders İçeriği (İsteğe Bağlı)"
            validateStatus={hasContent ? 'success' : undefined}
            help={
              hasContent
                ? 'İçerik girildi ✓'
                : 'Bu ders eşleştirmede kullanılmayacak'
            }
          >
            <TextArea
              rows={4}
              placeholder="Ders içeriğini buraya giriniz..."
              value={courseContents[course.id] || ''}
              onChange={e => handleContentChange(course.id, e.target.value)}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
      ),
    };
  });

  return (
    <div>
      {' '}
      <Card
        title="Ders İçerikleri"
        bordered={false}
        extra={
          courses.length > 0 && (
            <Button
              type="primary"
              icon={<ImportOutlined />}
              onClick={handleOpenBulkEditAll}
            >
              Toplu İçerik Ekle
            </Button>
          )
        }
      >
        {' '}
        <Alert
          message="Ders İçerikleri (İsteğe Bağlı)"
          description={
            <div>
              <Paragraph>
                Her ders için içerik girmeniz zorunlu değildir.
                <strong>
                  {' '}
                  Sadece içeriği doldurduğunuz dersler eşleştirme adımında
                  analiz edilecektir.
                </strong>
                İstemediğiniz dersleri tamamen silebilir veya içeriklerini boş
                bırakabilirsiniz. En az bir dersin içeriğini doldurmanız
                yeterlidir.
              </Paragraph>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <Text strong>
                  Tamamlanan: {status.filledContents}/{status.totalCourses} (
                  {status.percentage}%)
                </Text>
                <Space>
                  <Badge status="success" text="İçerik Tamam" />
                  <Badge status="error" text="İçerik Girilmedi" />
                </Space>
              </div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Collapse
          bordered={false}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
          className="course-contents-collapse"
          style={{
            borderRadius: '2px',
          }}
          items={collapseItems}
        />
        {courses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Text type="secondary">
              Önce "Dersleri Çıkar & Kontrol Et" adımında ders eklemelisiniz.
            </Text>
          </div>
        )}
        {/* Bulk Edit Modal */}
        <Modal
          title={
            bulkEditMode === 'single'
              ? 'Ders İçeriğini Düzenle'
              : 'Tüm Derslere İçerik Ekle'
          }
          open={bulkEditVisible}
          onOk={handleSaveBulkEdit}
          onCancel={() => setBulkEditVisible(false)}
          width={800}
          okText="Kaydet"
          cancelText="İptal"
        >
          <div style={{ marginBottom: 16 }}>
            {bulkEditMode === 'single' ? (
              <Text>Seçilen ders için içeriği düzenleyin.</Text>
            ) : (
              <Alert
                message="Dikkat: Toplu İçerik Ekleme"
                description="Girdiğiniz içerik tüm derslere uygulanacaktır. Halihazırda içerik girdiğiniz dersler de dahil olmak üzere her dersin içeriği bu metin ile değiştirilecektir."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          </div>
          <TextArea
            rows={12}
            value={bulkEditContent}
            onChange={e => setBulkEditContent(e.target.value)}
            placeholder="İçerik metni buraya giriniz..."
          />
        </Modal>
      </Card>
    </div>
  );
}
