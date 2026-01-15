import DatePicker from 'react-datepicker';
import { FaCalendarAlt } from 'react-icons/fa';
import { useDateTimePicker } from './useDateTimePicker';
import './DateTimePicker.css';

interface DateTimePickerProps {
  label?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function DateTimePicker({
  label,
  value,
  onChange,
  placeholder = '日付を選択',
  disabled = false
}: DateTimePickerProps) {
  const { currentValue, handleChange } = useDateTimePicker({ value, onChange });

  return (
    <div className="datetimepicker-container">
      {label && (
        <div className="datetimepicker-label">{label}</div>
      )}
      <div className="datetimepicker-wrapper">
        <DatePicker
          selected={currentValue}
          onChange={handleChange}
          dateFormat="yyyy/MM/dd"
          placeholderText={placeholder}
          disabled={disabled}
          wrapperClassName="w-full"
          popperPlacement="bottom-start"
          popperClassName="react-datepicker-popper-mobile"
        />
        <div className="datetimepicker-icon-wrapper">
          <FaCalendarAlt className={disabled ? 'datetimepicker-icon-disabled' : 'datetimepicker-icon'} />
        </div>
      </div>
    </div>
  );
}
