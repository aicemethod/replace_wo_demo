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
  const [tableData, setTableData] = useState<RowData[]>([]);

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
      options: []
    },
    {
      key: 'assignee',
      label: '担当者',
      sortable: true,
      inputType: 'lookup',
      options: []
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
          <Lookup label='担当者氏名' options={[]} />
          <DateTimePicker label='顧客ご確認日' />
        </SectionLayout>
        <SectionLayout>
          <SectionTitle title='TSR' />
          <Select options={[]} />
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
