// src/components/ManualCourseForm.jsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Select,
  Typography,
  Card,
  Alert,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addCourse } from "@/redux/wizardSlice";
import { nanoid } from "nanoid";

const { Text } = Typography;

// Ders formu için Zod şeması
const courseSchema = z.object({
  code: z.string().trim().min(1, "Ders kodu gerekli"),
  name: z.string().trim().min(1, "Ders adı gerekli"),
  theory: z
    .number()
    .int()
    .nonnegative()
    .refine((val) => val >= 0, {
      message: "Teori kredisi 0 veya üzeri olmalı",
    }),
  practice: z
    .number()
    .int()
    .nonnegative()
    .refine((val) => val >= 0, {
      message: "Uygulama kredisi 0 veya üzeri olmalı",
    }),
  letterGrade: z.string().min(1, "Harf notu gerekli"),
});

export default function ManualCourseForm({ onSuccess }) {
  const dispatch = useDispatch();
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      code: "",
      name: "",
      theory: 0,
      practice: 0,
      letterGrade: "AA",
    },
    resolver: zodResolver(courseSchema),
    mode: "onBlur",
  });

  // T ve U değerlerini izle ve AKTS'yi otomatik hesapla
  const theory = watch("theory") || 0;
  const practice = watch("practice") || 0;
  const calculatedCredit = theory * 1 + practice * 0.5;
  // Türk harf notu seçenekleri - sadece geçer notlar (muafiyet için)
  const letterGradeOptions = [
    { value: "AA", label: "AA" },
    { value: "BA", label: "BA" },
    { value: "BB", label: "BB" },
    { value: "CB", label: "CB" },
    { value: "CC", label: "CC" },
    { value: "DC", label: "DC" },
    { value: "DD", label: "DD" },
    { value: "YT", label: "YT" },
    { value: "MU", label: "MU" },
  ];
  const onSubmit = (data) => {
    // Harf notuna göre durum belirleme
    const getStatusFromGrade = (grade) => {
      const passingGrades = ["AA", "BA", "BB", "CB", "CC", "DC", "DD", "YT"];
      return passingGrades.includes(grade) ? "Başarılı" : "Başarısız";
    };

    // Wizard formatına uygun veri yapısı oluştur
    const courseData = {
      id: nanoid(),
      name: data.name,
      code: data.code,
      status: getStatusFromGrade(data.letterGrade),
      theory: data.theory,
      practice: data.practice,
      nationalCredit: calculatedCredit, // Hesaplanan Ulusal Kredi
      grade: data.letterGrade,
      selected: true, // Seçili olarak ekle
      isManual: true, // Manuel eklenen dersler için işaretleme
    };

    dispatch(addCourse(courseData));
    reset(); // formu temizle

    // Başarı mesajını göster
    message.success(`"${data.name}" dersi başarıyla eklendi.`);

    // Başarı callback'i varsa çağır
    if (onSuccess) {
      onSuccess();
    }
  };
  return (
    <div>
      <Form
        onFinish={handleSubmit(onSubmit)}
        layout="vertical"
        aria-label="Manuel Ders Ekleme Formu"
      >
        <Form.Item
          label="Ders Kodu"
          required
          validateStatus={errors.code ? "error" : ""}
          help={errors.code?.message}
        >
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Örn. CMPE101" />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Ders Adı"
          required
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Örn. Algoritma ve Programlama" />
            )}
          />
        </Form.Item>{" "}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <Form.Item
            label="Teori Kredisi (T)"
            required
            validateStatus={errors.theory ? "error" : ""}
            help={errors.theory?.message}
            style={{ flex: 1 }}
          >
            <Controller
              name="theory"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Uygulama Kredisi (U)"
            required
            validateStatus={errors.practice ? "error" : ""}
            help={errors.practice?.message}
            style={{ flex: 1 }}
          >
            <Controller
              name="practice"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                />
              )}
            />
          </Form.Item>
        </div>{" "}
        {/* AKTS otomatik hesaplama gösterimi */}
        <Card
          size="small"
          style={{
            marginBottom: "24px",
            backgroundColor: "rgba(16, 185, 129, 0.05)",
            borderColor: "#10b981",
          }}
          bodyStyle={{ padding: "12px 16px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <Text strong style={{ color: "#059669" }}>
                Ulusal Kredi (Otomatik Hesaplanır)
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Hesaplama: ({theory} × 1) + ({practice} × 0.5)
              </Text>
            </div>
            <div style={{ textAlign: "right" }}>
              <Text
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#059669",
                }}
              >
                {calculatedCredit.toFixed(1)}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "11px" }}>
                kredi
              </Text>
            </div>
          </div>
        </Card>{" "}
        <Form.Item
          label="Harf Notu"
          required
          validateStatus={errors.letterGrade ? "error" : ""}
          help={errors.letterGrade?.message}
        >
          <Controller
            name="letterGrade"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={letterGradeOptions}
                style={{ width: "100%" }}
                placeholder="Harf notunuzu seçin"
              />
            )}
          />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          style={{ width: "100%" }}
        >
          Dersi Ekle
        </Button>
      </Form>
    </div>
  );
}
