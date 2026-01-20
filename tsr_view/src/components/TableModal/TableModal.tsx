import { useState, useEffect } from 'react';
import Modal from '../Modal';
import type { Column, RowData } from '../SubGridTable';
import TextField from '../TextField';
import Lookup from '../Lookup';
import Select from '../Select';
import DateTimePicker from '../DateTimePicker';
import './TableModal.css';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  initialData?: RowData | null;
  onSave: (data: RowData) => void;
  mode: 'add' | 'edit';
}

export default function TableModal({ isOpen, onClose, columns, initialData, onSave, mode }: TableModalProps) {
  const [formData, setFormData] = useState<RowData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidated, setIsValidated] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData(mode === 'edit' && initialData ? { ...initialData } :
        columns.reduce((acc, col) => ({ ...acc, [col.key]: col.inputType === 'datetime' ? null : '' }), {}));
      setErrors({});
      setIsValidated(false);
    }
  }, [isOpen, initialData, mode, columns]);

  const handleChange = (key: string, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (isValidated && errors[key] && (typeof value === 'string' ? value.trim() !== '' : value !== null)) {
      setErrors(prev => { const { [key]: _, ...rest } = prev; return rest; });
    }
  };

  const validate = (): boolean => {
    const newErrors = columns.reduce((acc, col) => {
      const value = formData[col.key];
      const inputType = col.inputType || 'text';
      const isValid = inputType === 'datetime'
        ? value instanceof Date && !isNaN(value.getTime())
        : String(value || '').trim() !== '' && value !== '選択してください';
      return isValid ? acc : { ...acc, [col.key]: `${col.label}は必須です` };
    }, {} as Record<string, string>);

    setErrors(newErrors);
    setIsValidated(true);
    if (Object.keys(newErrors).length > 0) setAnimationKey(prev => prev + 1);
    return Object.keys(newErrors).length === 0;
  };

  const renderField = (col: Column) => {
    const inputType = col.inputType || 'text';
    const value = formData[col.key];

    if (inputType === 'lookup' && col.options) {
      return <Lookup label={col.label} options={col.options} selected={typeof value === 'string' && value ? value : undefined}
        onSelect={(v) => handleChange(col.key, v)} placeholder="選択してください" />;
    }
    if (inputType === 'select' && col.options) {
      return <Select label={col.label} options={col.options} selected={typeof value === 'string' && value ? value : undefined}
        onSelect={(v) => handleChange(col.key, v)} placeholder="選択してください" />;
    }
    if (inputType === 'datetime') {
      return <DateTimePicker label={col.label} value={value instanceof Date ? value : null}
        onChange={(date) => handleChange(col.key, date)} />;
    }
    return <TextField label={col.label} value={typeof value === 'string' ? value : ''}
      onChange={(v) => handleChange(col.key, v)} placeholder={`${col.label}を入力`}
      error={errors[col.key]} hasError={!!errors[col.key]} />;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="tablemodal-header">
        <h2 className="tablemodal-title">{mode === 'add' ? '新規追加' : '編集'}</h2>
      </div>
      <div className="tablemodal-body">
        <div className="tablemodal-form">{columns.map(col => <div key={`${col.key}-${animationKey}`}>{renderField(col)}</div>)}</div>
      </div>
      <div className="tablemodal-footer">
        <button onClick={onClose} className="tablemodal-button tablemodal-button-cancel">キャンセル</button>
        <button onClick={() => validate() && (onSave(formData), onClose())} className="tablemodal-button tablemodal-button-save">保存</button>
      </div>
    </Modal>
  );
}
