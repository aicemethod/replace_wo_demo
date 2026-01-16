import type { ReactNode } from 'react';

type TimeEntryTextareaFieldProps = {
  label: string;
  placeholder?: string;
  rows?: number;
  rightSlot?: ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  onClick?: () => void;
};

function TimeEntryTextareaField({
  label,
  placeholder,
  rows = 3,
  rightSlot,
  value,
  onChange,
  readOnly,
  onClick,
}: TimeEntryTextareaFieldProps) {
  const hasRightSlot = Boolean(rightSlot);

  return (
    <div className="time-entry-field">
      <div className={hasRightSlot ? 'time-entry-field-with-link' : undefined}>
        <label>{label}</label>
        {rightSlot}
      </div>
      <textarea
        className="time-entry-textarea"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        onClick={onClick}
      />
    </div>
  );
}

export default TimeEntryTextareaField;

