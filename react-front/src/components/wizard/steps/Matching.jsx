// src/components/wizard/steps/Matching.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Alert,
  Spin,
  Checkbox,
  Progress,
  Select,
  Collapse,
} from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setAutoMatchResults, toggleMatchSelection } from '@/redux/wizardSlice';
import { autoMatch } from '@/services/api';
import {
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { INTERNAL_COURSES } from '@/constants/internalCourses';

const { Text, Title } = Typography;
const { Panel } = Collapse;

export default function Matching() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const courses = useSelector(state => state.wizard.courses);
  const courseContents = useSelector(state => state.wizard.courseContents);
  const matches = useSelector(state => state.wizard.matches);
  const selectedMatches = useSelector(state => state.wizard.selectedMatches);

  // Check if we have courses selected from transcript
  const hasCourses = courses && courses.length > 0;

  // Check if we have already performed matching
  const hasMatched = matches && matches.length > 0;

  // Process the data for display
  const processedMatches = matches.map(match => ({
    ...match,
    isSelected: selectedMatches.includes(match.id),
    isEligible: match.score >= 0.78,
  }));

  // Sort matches by eligibility and score
  const sortedMatches = [...processedMatches].sort((a, b) => {
    if (a.isEligible !== b.isEligible) {
      return a.isEligible ? -1 : 1;
    }
    return b.score - a.score;
  });
  const performMatching = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required data
      if (!courses || courses.length === 0) {
        throw new Error('Dersler listesi boş');
      }

      if (!courseContents) {
        throw new Error('Ders içerikleri bulunamadı');
      }

      // Sadece içeriği doldurulmuş dersleri filtrele
      const coursesWithContent = courses.filter(
        course => courseContents[course.id] && courseContents[course.id].trim()
      );

      if (coursesWithContent.length === 0) {
        throw new Error('İçeriği doldurulmuş hiçbir ders bulunamadı');
      }

      // Prepare courses for auto-match API
      const coursesToMatch = coursesWithContent.map(course => ({
        code: course.code,
        content: courseContents[course.id],
      }));

      // Call auto-match API
      const response = await autoMatch(coursesToMatch);

      // Process the auto-match results
      dispatch(setAutoMatchResults(response));
    } catch (err) {
      setError(err.message || 'Eşleştirme sırasında hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleToggleSelection = matchId => {
    dispatch(toggleMatchSelection(matchId));
  }; // Helper function to get internal course name
  const getInternalCourseName = code => {
    const course = INTERNAL_COURSES.find(ic => ic.code === code);
    return course ? course.name : code;
  };

  // Expandable row render function to show all candidates
  const expandedRowRender = record => {
    if (!record.allCandidates || record.allCandidates.length <= 1) {
      return null;
    }

    const candidateColumns = [
      {
        title: 'Dahili Ders Kodu',
        dataIndex: 'int_code',
        key: 'int_code',
      },
      {
        title: 'Dahili Ders Adı',
        dataIndex: 'int_code',
        key: 'int_name',
        render: code => getInternalCourseName(code),
      },
      {
        title: 'Benzerlik Oranı',
        dataIndex: 'percent',
        key: 'percent',
        render: percent => {
          let color = 'red';
          if (percent >= 78) color = 'green';
          else if (percent >= 60) color = 'orange';
          return <Tag color={color}>%{Math.round(percent)}</Tag>;
        },
      },
      {
        title: 'Muafiyet Durumu',
        dataIndex: 'exempt',
        key: 'exempt',
        render: exempt => (
          <Tag
            color={exempt ? 'success' : 'default'}
            icon={exempt ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {exempt ? 'Uygun' : 'Yetersiz'}
          </Tag>
        ),
      },
    ];

    return (
      <Table
        columns={candidateColumns}
        dataSource={record.allCandidates}
        pagination={false}
        size="small"
        rowKey="int_code"
      />
    );
  };

  // Columns for the matches table
  const columns = [
    {
      title: 'Muafiyet',
      dataIndex: 'isSelected',
      key: 'selection',
      width: 80,
      render: (_, record) => (
        <Checkbox
          checked={record.isSelected}
          disabled={!record.isEligible}
          onChange={() => handleToggleSelection(record.id)}
        />
      ),
    },
    {
      title: 'Ders Kodu',
      dataIndex: 'courseCode',
      key: 'courseCode',
    },
    {
      title: 'Ders Adı',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'En İyi Eşleşme',
      dataIndex: 'matchedWith',
      key: 'matchedWith',
      render: (code, record) => (
        <div>
          <div>
            <strong>{code}</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {getInternalCourseName(code)}
          </div>
        </div>
      ),
    },
    {
      title: 'Benzerlik Skoru',
      dataIndex: 'score',
      key: 'score',
      render: score => {
        const percent = Math.round(score * 100);
        let color = 'red';
        if (percent >= 78) color = 'green';
        else if (percent >= 60) color = 'orange';

        return <Tag color={color}>%{percent}</Tag>;
      },
    },
    {
      title: 'Durum',
      key: 'status',
      render: (_, record) => (
        <Tag
          color={record.isEligible ? 'success' : 'default'}
          icon={
            record.isEligible ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {record.isEligible ? 'Uygun' : 'Yetersiz Benzerlik'}
        </Tag>
      ),
    },
  ];
  return (
    <div>
      <Card title="Otomatik Ders Eşleştirme" bordered={false}>
        {!hasCourses ? (
          <Alert
            message="Hiç Ders Seçilmedi"
            description="Transkriptten hiç ders seçimi yapmadınız veya bir önceki adıma geri dönmeniz gerekiyor. Önce transkript yükleyin ve muafiyet başvurusu yapmak istediğiniz dersleri seçin."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        ) : !hasMatched ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Alert
              message="Otomatik Eşleştirme Gerekli"
              description={`Seçtiğiniz ${courses.length} dersin tüm dahili derslerle otomatik olarak karşılaştırılması ve en uygun eşleşmelerin bulunması gerekiyor.`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Button
              type="primary"
              size="large"
              icon={<SyncOutlined />}
              loading={loading}
              onClick={performMatching}
            >
              Otomatik Eşleştirme Başlat
            </Button>
          </div>
        ) : (
          <>
            <Row gutter={[0, 16]}>
              <Col span={24}>
                <Alert
                  message={`${sortedMatches.filter(m => m.isEligible).length} ders muafiyet için uygun`}
                  description={`Toplam ${sortedMatches.length} dersinizden ${sortedMatches.filter(m => m.isEligible).length} tanesi %78 ve üzeri benzerlik skoruna sahip ve muafiyet için uygundur. ${selectedMatches.length} ders seçildi.`}
                  type="success"
                  showIcon
                />
              </Col>{' '}
              <Col span={24}>
                <Table
                  dataSource={sortedMatches}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  expandable={{
                    expandedRowRender,
                    rowExpandable: record =>
                      record.allCandidates && record.allCandidates.length > 1,
                  }}
                  rowClassName={record =>
                    !record.isEligible ? 'ineligible-row' : ''
                  }
                />
              </Col>
            </Row>
            <style jsx>{`
              .ineligible-row {
                background-color: #f5f5f5;
                color: #999;
              }
            `}</style>
          </>
        )}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <Progress
              percent={Math.floor(Math.random() * 30) + 70}
              status="active"
              style={{ margin: '20px auto', maxWidth: '80%' }}
            />{' '}
            <p style={{ marginTop: 16 }}>Otomatik eşleştirme yapılıyor...</p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              Dersler tüm dahili derslerle karşılaştırılıyor, lütfen
              bekleyiniz...
            </p>
          </div>
        )}

        {error && (
          <Alert
            message="Eşleştirme Hatası"
            description={error}
            type="error"
            showIcon
          />
        )}
      </Card>
    </div>
  );
}
