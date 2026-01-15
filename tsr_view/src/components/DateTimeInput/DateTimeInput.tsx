import DateTimePicker from '../DateTimePicker';
import Select from '../Select';
import { useDateTimeInput } from './useDateTimeInput';
import './DateTimeInput.css';

interface DateTimeInputProps {
    label?: string;
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    disabled?: boolean;
}

export default function DateTimeInput({
    label,
    value,
    onChange,
    disabled = false
}: DateTimeInputProps) {
    const {
        dateValue,
        hour,
        minute,
        getHourOptions,
        getMinuteOptions,
        handleDateChange,
        handleHourSelect,
        handleMinuteSelect
    } = useDateTimeInput({ value, onChange });

    return (
        <div className="datetimeinput-container">
            {label && (
                <div className="datetimeinput-label">{label}</div>
            )}
            <div className="datetimeinput-inputs">
                <div className="datetimeinput-date">
                    <DateTimePicker
                        value={dateValue}
                        onChange={handleDateChange}
                        placeholder="日付を選択"
                        disabled={disabled}
                    />
                </div>
                <div className="datetimeinput-hour">
                    <Select
                        options={getHourOptions()}
                        selected={hour}
                        onSelect={handleHourSelect}
                        placeholder="時"
                    />
                </div>
                <div className="datetimeinput-minute">
                    <Select
                        options={getMinuteOptions()}
                        selected={minute}
                        onSelect={handleMinuteSelect}
                        placeholder="分"
                    />
                </div>
            </div>
        </div>
    );
}
