// src/components/CourseTable.jsx
import React, { useState } from 'react';
import {
  Table,
  Input,
  InputNumber,
  Button,
  Popconfirm,
  Form,
  Modal,
  Space,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { addCourse, updateCourse, deleteCourse } from '@/redux/courseSlice';
import { nanoid } from 'nanoid';

export default function CourseTable({ courses }) {
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const dispatch = useDispatch();
  const [editingKey, setEditingKey] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const isEditing = record => record.id === editingKey;

  const showAddModal = () => setIsModalVisible(true);
  const handleAddCancel = () => {
    addForm.resetFields();
    setIsModalVisible(false);
  };
  const handleAdd = async () => {
    try {
      const values = await addForm.validateFields();
      dispatch(addCourse({ id: nanoid(), ...values }));
      handleAddCancel();
    } catch (err) {
      console.error('Doğrulama hatası (ekleme):', err);
    }
  };

  const edit = record => {
    form.setFieldsValue({ name: '', ects: 0, grade: 0, ...record });
    setEditingKey(record.id);
  };

  const cancel = () => setEditingKey('');

  const save = async id => {
    try {
      const row = await form.validateFields();
      dispatch(updateCourse({ id, data: row }));
      setEditingKey('');
    } catch (err) {
      console.error('Doğrulama hatası:', err);
    }
  };

  const columns = [
    { title: 'Ders Adı', dataIndex: 'name', editable: true },
    { title: 'AKTS', dataIndex: 'ects', editable: true },
    { title: 'Harf Notu', dataIndex: 'grade', editable: true },
    {
      title: 'İşlemler',
      dataIndex: 'actions',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => save(record.id)}
              type="text"
            />
            <Popconfirm title="İptal edilsin mi?" onConfirm={cancel}>
              <Button icon={<CloseOutlined />} type="text" />
            </Popconfirm>
          </Space>
        ) : (
          <Space>
            <Button
              icon={<EditOutlined />}
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              type="text"
            />
            <Popconfirm
              title="Ders silinsin mi?"
              onConfirm={() => dispatch(deleteCourse(record.id))}
            >
              <Button icon={<DeleteOutlined />} danger type="text" />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'name' ? 'text' : 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    children,
    ...restProps
  }) => {
    const inputNode =
      inputType === 'number' ? <InputNumber min={0} /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `${title} gerekli` }]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
        }}
      >
        <h3 style={{ margin: 0 }}>Ders Listesi ({courses.length})</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Ders Ekle
        </Button>
      </div>
      <Form form={form} component={false}>
        <Table
          components={{ body: { cell: EditableCell } }}
          bordered
          dataSource={courses}
          columns={mergedColumns}
          rowKey="id"
          locale={{ emptyText: 'Gösterilecek ders yok' }}
          pagination={{
            onChange: cancel,
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ['8', '12', '16', '20'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} ders`,
          }}
        />
      </Form>{' '}
      <Modal
        title="Yeni Ders Ekle"
        open={isModalVisible}
        onOk={handleAdd}
        onCancel={handleAddCancel}
        okText="Ekle"
        cancelText="İptal"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            name="name"
            label="Ders Adı"
            rules={[{ required: true, message: 'Ders adı gerekli' }]}
          >
            <Input placeholder="Örn. Algoritma ve Programlama" />
          </Form.Item>
          <Form.Item
            name="ects"
            label="AKTS"
            rules={[{ required: true, message: 'AKTS 0 veya üzeri olmalı' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="grade"
            label="Harf Notu (0-100)"
            rules={[{ required: true, message: 'Not 0-100 arası olmalı' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
