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

export default function TableModal({
  isOpen,
  onClose,
  columns,
  initialData,
  onSave,
  mode
}: TableModalProps) {
  const [formData, setFormData] = useState<RowData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidated, setIsValidated] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({ ...initialData });
      } else {
        const emptyData: RowData = {};
        columns.forEach(col => {
          const inputType = col.inputType || 'text';
          if (inputType === 'datetime') {
            emptyData[col.key] = null;
          } else {
            emptyData[col.key] = '';
          }
        });
        setFormData(emptyData);
      }
      setErrors({});
      setIsValidated(false);
    }
  }, [isOpen, initialData, mode, columns]);

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    if (isValidated && errors[key] && value.trim() !== '') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleDateTimeChange = (key: string, value: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    if (isValidated && errors[key] && value !== null) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    columns.forEach(column => {
      const value = formData[column.key];
      const inputType = column.inputType || 'text';
      
      if (inputType === 'datetime') {
        if (!value || (value instanceof Date && isNaN(value.getTime()))) {
          newErrors[column.key] = `${column.label}は必須です`;
        }
      } else {
        const stringValue = String(value || '');
        if (stringValue.trim() === '' || stringValue === '選択してください') {
          newErrors[column.key] = `${column.label}は必須です`;
        }
      }
    });
    
    setErrors(newErrors);
    setIsValidated(true);
    
    if (Object.keys(newErrors).length > 0) {
      setAnimationKey(prev => prev + 1);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="tablemodal-header">
        <h2 className="tablemodal-title">
          {mode === 'add' ? '新規追加' : '編集'}
        </h2>
      </div>

      <div className="tablemodal-body">
        <div className="tablemodal-form">
          {columns.map((column) => {
            const inputType = column.inputType || 'text';
            const fieldValue = formData[column.key];
            
            return (
              <div key={`${column.key}-${animationKey}`}>
                {inputType === 'lookup' && column.options ? (
                  <Lookup
                    options={column.options}
                    label={column.label}
                    selected={typeof fieldValue === 'string' && fieldValue !== '' ? fieldValue : undefined}
                    onSelect={(value) => handleFieldChange(column.key, value)}
                    placeholder="選択してください"
                  />
                ) : inputType === 'select' && column.options ? (
                  <Select
                    options={column.options}
                    label={column.label}
                    selected={typeof fieldValue === 'string' && fieldValue !== '' ? fieldValue : undefined}
                    onSelect={(value) => handleFieldChange(column.key, value)}
                    placeholder="選択してください"
                  />
                ) : inputType === 'datetime' ? (
                  <DateTimePicker
                    label={column.label}
                    value={fieldValue instanceof Date ? fieldValue : null}
                    onChange={(date) => handleDateTimeChange(column.key, date)}
                  />
                ) : (
                  <TextField
                    label={column.label}
                    value={typeof fieldValue === 'string' ? fieldValue : ''}
                    onChange={(value) => handleFieldChange(column.key, value)}
                    placeholder={`${column.label}を入力`}
                    error={errors[column.key]}
                    hasError={!!errors[column.key]}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="tablemodal-footer">
        <button
          onClick={onClose}
          className="tablemodal-button tablemodal-button-cancel"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          className="tablemodal-button tablemodal-button-save"
        >
          保存
        </button>
      </div>
    </Modal>
  );
}
