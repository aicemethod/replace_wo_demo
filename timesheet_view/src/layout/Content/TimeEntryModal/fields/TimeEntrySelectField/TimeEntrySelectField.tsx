import Select, { type SelectOption } from '../../../../../components/elements/Select';
import './TimeEntrySelectField.css';

type TimeEntrySelectFieldProps = {
  label: string;
  options: SelectOption[];
  placeholder?: string;
};

// タイムエントリ選択フィールドコンポーネント
function TimeEntrySelectField({ label, options, placeholder }: TimeEntrySelectFieldProps) {
  // プレースホルダーをオプションとして追加
  const optionsWithPlaceholder = placeholder
    ? [{ value: '', label: placeholder }, ...options]
    : options;

  return (
    <div className="time-entry-field">
      <label className="time-entry-field-label">{label}</label>
      <Select
        options={optionsWithPlaceholder}
        placeholder={placeholder ?? '選択してください'}
        className="time-entry-select"
        noWrapper
      />
    </div>
  );
}

export type { SelectOption as TimeEntrySelectOption };
export default TimeEntrySelectField;

