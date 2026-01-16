import Select from '../../../../../components/elements/Select';
import TimeEntryDateInput from '../TimeEntryDateInput';
import { useTimeEntryDateTimeField } from './useTimeEntryDateTimeField';
import '../TimeEntrySelectField/TimeEntrySelectField.css';

type TimeEntryDateTimeFieldProps = {
  label: string;
  value: Date;
  onChange: (nextValue: Date) => void;
};

function TimeEntryDateTimeField({ label, value, onChange }: TimeEntryDateTimeFieldProps) {
  const {
    hourOptions,
    minuteOptions,
    currentHour,
    currentMinute,
    handleHourChange,
    handleMinuteChange,
  } = useTimeEntryDateTimeField({ value, onChange });

  return (
    <div className="time-entry-field">
      <label>{label}</label>
      <div className="time-entry-date-row">
        <TimeEntryDateInput label={label} value={value} onChange={onChange} />
        <Select
          options={hourOptions}
          value={currentHour}
          onChange={handleHourChange}
          className="time-entry-inline-select"
        />
        <Select
          options={minuteOptions}
          value={currentMinute}
          onChange={handleMinuteChange}
          className="time-entry-inline-select"
        />
      </div>
    </div>
  );
}

export default TimeEntryDateTimeField;

