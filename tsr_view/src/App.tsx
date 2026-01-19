import { useState } from 'react';
import SectionHeader from './components/SectionHeader'
import SectionTitle from './components/SectionTitle'
import Lookup from './components/Lookup'
import DateTimePicker from './components/DateTimePicker'
import Select from './components/Select'
import TextField from './components/TextField'
import TextArea from './components/TextArea'
import DateTimeInput from './components/DateTimeInput'
import SubGridTable, { type Column, type RowData } from './components/SubGridTable'
import { GridLayout, SectionLayout } from './Layouts'
import './App.css'

function App() {
  const test_options: {
    label: string;
    value: string;
  }[] = [
      {
        label: "test",
        value: "aaa",
      },
    ];

  // SubGridTable用の仮データ
  const [tableData, setTableData] = useState<RowData[]>([
    {
      id: '1',
      name: '項目1',
      status: '進行中',
      assignee: '田中太郎',
      date: new Date('2024-01-15T10:30:00'),
      description: '説明文1'
    },
    {
      id: '2',
      name: '項目2',
      status: '完了',
      assignee: '佐藤花子',
      date: new Date('2024-01-16T14:20:00'),
      description: '説明文2'
    },
    {
      id: '3',
      name: '項目3',
      status: '未着手',
      assignee: '鈴木一郎',
      date: new Date('2024-01-17T09:15:00'),
      description: '説明文3'
    },
    {
      id: '4',
      name: '項目4',
      status: '進行中',
      assignee: '山田次郎',
      date: new Date('2024-01-18T16:45:00'),
      description: '説明文4'
    },
    {
      id: '5',
      name: '項目5',
      status: '完了',
      assignee: '高橋三郎',
      date: new Date('2024-01-19T11:30:00'),
      description: '説明文5'
    },
    {
      id: '6',
      name: '項目6',
      status: '未着手',
      assignee: '伊藤四郎',
      date: new Date('2024-01-20T13:00:00'),
      description: '説明文6'
    },
  ]);

  const columns: Column[] = [
    {
      key: 'name',
      label: '項目名',
      sortable: true,
      inputType: 'text'
    },
    {
      key: 'status',
      label: 'ステータス',
      sortable: true,
      inputType: 'select',
      options: [
        { label: '未着手', value: '未着手' },
        { label: '進行中', value: '進行中' },
        { label: '完了', value: '完了' }
      ]
    },
    {
      key: 'assignee',
      label: '担当者',
      sortable: true,
      inputType: 'lookup',
      options: [
        { label: '田中太郎', value: '田中太郎' },
        { label: '佐藤花子', value: '佐藤花子' },
        { label: '鈴木一郎', value: '鈴木一郎' },
        { label: '山田次郎', value: '山田次郎' },
        { label: '高橋三郎', value: '高橋三郎' },
        { label: '伊藤四郎', value: '伊藤四郎' }
      ]
    },
    {
      key: 'date',
      label: '日時',
      sortable: true,
      inputType: 'datetime'
    },
    {
      key: 'description',
      label: '説明',
      sortable: false,
      inputType: 'text'
    }
  ];

  const handleAdd = (newData: RowData) => {
    const newId = String(tableData.length + 1);
    setTableData([...tableData, { ...newData, id: newId }]);
  };

  const handleUpdate = (index: number, updatedData: RowData) => {
    const newData = [...tableData];
    newData[index] = updatedData;
    setTableData(newData);
  };

  const handleDelete = (index: number) => {
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
  };

  const handleSort = (columnKey: string, direction: 'asc' | 'desc') => {
    const sortedData = [...tableData].sort((a, b) => {
      const aValue = a[columnKey];
      const bValue = b[columnKey];

      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      const aStr = String(aValue || '');
      const bStr = String(bValue || '');

      return direction === 'asc'
        ? aStr.localeCompare(bStr, 'ja')
        : bStr.localeCompare(aStr, 'ja');
    });
    setTableData(sortedData);
  };

  return (
    <>
      <SectionHeader title='TSR' />
      <GridLayout columns={2} gap="1rem">
        <SectionLayout>
          <SectionTitle title='TSR' />
          <Lookup label='担当者氏名' options={test_options} />
          <DateTimePicker label='顧客ご確認日' />
        </SectionLayout>
        <SectionLayout>
          <SectionTitle title='TSR' />
          <Select options={test_options} />
          <TextField />
          <TextArea />
          <DateTimeInput />
        </SectionLayout>
      </GridLayout>
      <SubGridTable
        label="サブグリッドテーブル"
        columns={columns}
        data={tableData}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onSort={handleSort}
      />
    </>
  )
}

export default App
