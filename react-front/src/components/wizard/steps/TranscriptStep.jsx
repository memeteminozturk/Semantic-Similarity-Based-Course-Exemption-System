// src/components/wizard/steps/TranscriptStep.jsx
import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Upload,
  Progress,
  Button,
  Card,
  Alert,
  Typography,
  Spin,
  Table,
  Checkbox,
  Modal,
  message,
} from "antd";
import {
  InboxOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { usePdfParser } from "@/hooks/usePdfParser";
import { useDispatch, useSelector } from "react-redux";
import { setCourses, setTranscriptFile, setTranscriptFileBlob } from "@/redux/wizardSlice";
import { useFileStore } from '@/contexts/FileStoreContext';
import ManualCourseForm from "@/components/ManualCourseForm";
import { nanoid } from "nanoid";

const { Dragger } = Upload;
const { Text } = Typography;

const TranscriptStep = forwardRef((props, ref) => {
  const [messageApi, contextHolder] = message.useMessage();
  const dispatch = useDispatch();
  const { setTranscriptFile: storeTranscriptFile } = useFileStore();
  const transcriptFile = useSelector((state) => state.wizard.transcriptFile);
  const courses = useSelector((state) => state.wizard.courses);

  // Custom hooks for PDF parsing
  const [coursesToInclude, setCoursesToInclude] = useState([]);
  const [coursesParsed, setCoursesParsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Tüm dersleri birleştirmiş kullanıcı arayüz listesi
  const allCourses = React.useMemo(() => {
    const manualCourses = courses || [];
    const extractedCourses =
      coursesParsed && coursesToInclude.length > 0 ? coursesToInclude : [];
    return [...manualCourses, ...extractedCourses];
  }, [courses, coursesParsed, coursesToInclude]);
  // Dışa aktarılan metotlar
  useImperativeHandle(ref, () => ({
    handleSaveCourseSelection: handleSaveCourseSelection,
    getSelectedCourseCount: () => allCourses.length,
  }));
  const {
    mutate: parseTranscript,
    isLoading: isParsingTranscript,
    progress: transcriptProgress,
  } = usePdfParser({
    onSuccess: (parsedCourses) => {
      // Filter courses to only include those with comment "G"
      const filteredCourses = parsedCourses.filter((course) => {
        return course.comments && course.comments.includes("G");
      });

      // Add IDs and selection state to each course
      const coursesWithIds = filteredCourses.map((course) => ({
        ...course,
        id: nanoid(),
        selected: true, // Default all courses are selected
      }));
      // Set local state for selection UI
      setCoursesToInclude(coursesWithIds);
      setCoursesParsed(true);

      // Create a serializable file representation
      dispatch(
        setTranscriptFile({
          name: "transkript.pdf",
          type: "application/pdf",
          lastModified: new Date().getTime(),
          size: 0, // We don't have the actual size here, but adding for consistency
        })
      );
    },
  });

  // Eski ders içerikleri PDF'i PersonalInfo adımına taşındı  // Function to save selected courses to Redux
  // Bu fonksiyon ExemptionWizard'daki İleri düğmesi tarafından çağrılacak
  const handleSaveCourseSelection = () => {
    // Transkriptten ve manuel eklenen dersleri birleştir
    const manualCourses = courses || [];
    const extractedCourses =
      transcriptFile && coursesParsed && coursesToInclude.length > 0
        ? coursesToInclude
        : [];

    // Tüm dersleri birleştir (artık seçim yok, hepsi dahil)
    const allSelectedCourses = [...manualCourses, ...extractedCourses];

    // Redux'a kaydet
    dispatch(setCourses(allSelectedCourses));

    // Scroll to bottom to show feedback
    window.scrollTo(0, document.body.scrollHeight);

    return allSelectedCourses.length > 0;
  };
  return (
    <div>
      {contextHolder}
      {" "}
      <Alert
        message="Dersleri Ekleyin"
        description="Transkriptinizi yükleyin veya dersleri manuel olarak ekleyerek muafiyet başvurusu için ilerleyebilirsiniz."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      <div style={{ display: "flex", marginBottom: "24px" }}>
        <Card
          title="Transkript Dosyası"
          extra={
            transcriptFile && <CheckCircleOutlined style={{ color: "green" }} />
          }
          style={{ width: "100%" }}
        >          <Dragger
            accept=".pdf"
            showUploadList={false}
            beforeUpload={(file) => {
              // File size validation (25MB = 25 * 1024 * 1024 bytes)
              const maxSize = 25 * 1024 * 1024; // 25MB
              if (file.size > maxSize) {
                messageApi.error(`Dosya boyutu çok büyük! Maksimum: 25MB, Yüklenen: ${(file.size / (1024*1024)).toFixed(1)}MB`);
                return false;
              }
              return true;
            }}
            customRequest={({ file }) => {
              // Store the actual file for email attachments
              storeTranscriptFile(file);
              
              // Also store file info in Redux for UI
              dispatch(setTranscriptFile({
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified,
              }));
              
              // Parse the transcript
              parseTranscript(file);
            }}
            disabled={isParsingTranscript || !!transcriptFile}
          >
            <p>
              <InboxOutlined style={{ fontSize: 32, color: "#40a9ff" }} />
            </p>
            <p>
              {transcriptFile ? (
                <Text strong>
                  Yüklendi: {transcriptFile.name || "transkript.pdf"}
                </Text>
              ) : (
                "Transkript PDF'ini buraya sürükleyin veya tıklayın"
              )}
            </p>
            {!transcriptFile && (
              <p style={{ fontSize: "12px", color: "#999" }}>
                PDF formatında belge yükleyin
              </p>
            )}
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
      {/* Manuel Ders Ekleme Bölümü */}{" "}
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
        {" "}
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
                defaultPageSize: 10,
                total: allCourses.length,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} / ${total} ders`,
              }}
              columns={[
                {
                  title: "Ders Kodu",
                  dataIndex: "code",
                  key: "code",
                },
                {
                  title: "Ders Adı",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Kredi (T-U-K)",
                  key: "credit",
                  render: (_, record) => (
                    <span>{`${record.theory}-${record.practice}-${record.nationalCredit}`}</span>
                  ),
                },
                {
                  title: "Not",
                  dataIndex: "grade",
                  key: "grade",
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
        )}{" "}
      </Card>
      {/* İşleme sırasında gösterilen spinner */}
      {isParsingTranscript && (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>
            Belgeler işleniyor, lütfen bekleyin...
          </p>
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
          description="Ders bilgilerinizi manuel olarak eklemek için aşağıdaki formu kullanabilirsiniz. Her bir dersi ayrı ayrı ekleyiniz. (Sadece geçtiğiniz dersler için muafiyet başvurusu yapabilirsiniz.)"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />{" "}
        <ManualCourseForm onSuccess={() => setIsModalVisible(false)} />
      </Modal>
      {/* İşleme sırasında gösterilen spinner */}
      {isParsingTranscript && (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>
            Belgeler işleniyor, lütfen bekleyin...
          </p>
        </div>
      )}
      {/* Ders bulunamadı uyarısı */}
      {transcriptFile && !isParsingTranscript && allCourses.length === 0 && (
        <Alert
          message="Ders Bulunamadı"
          description="Transkriptinizden herhangi bir ders çıkarılamadı. Lütfen dosyanın doğru formatta olduğunu kontrol edin veya dersleri manuel olarak ekleyin."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
});

export default TranscriptStep;
