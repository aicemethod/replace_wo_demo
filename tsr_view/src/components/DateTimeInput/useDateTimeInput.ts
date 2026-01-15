import { useState, useEffect } from 'react';

interface UseDateTimeInputProps {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
}

export function useDateTimeInput({ value, onChange }: UseDateTimeInputProps) {
    const [dateValue, setDateValue] = useState<Date | null>(null);
    const [hour, setHour] = useState<number | null>(null);
    const [minute, setMinute] = useState<number | null>(null);

    // 初期値から日付と時刻を設定
    useEffect(() => {
        if (value) {
            // 日付部分（時刻を00:00にリセット）
            const dateOnly = new Date(value.getFullYear(), value.getMonth(), value.getDate());
            setDateValue(dateOnly);
            setHour(value.getHours());
            setMinute(value.getMinutes());
        } else {
            setDateValue(null);
            setHour(null);
            setMinute(null);
        }
    }, [value]);

    // 日付、時、分が変更されたらDateオブジェクトを生成
    useEffect(() => {
        if (dateValue && hour !== null && minute !== null) {
            const newDate = new Date(
                dateValue.getFullYear(),
                dateValue.getMonth(),
                dateValue.getDate(),
                hour,
                minute
            );
            onChange?.(newDate);
        } else if (!dateValue && hour === null && minute === null) {
            onChange?.(null);
        }
    }, [dateValue, hour, minute, onChange]);

    // 時のオプション生成（0-23）
    const getHourOptions = () => {
        return Array.from({ length: 24 }, (_, i) => i).map(h => ({
            label: `${String(h).padStart(2, '0')}時`,
            value: String(h)
        }));
    };

    // 分のオプション生成（0-59）
    const getMinuteOptions = () => {
        return Array.from({ length: 60 }, (_, i) => i).map(m => ({
            label: `${String(m).padStart(2, '0')}分`,
            value: String(m)
        }));
    };

    const handleDateChange = (date: Date | null) => {
        setDateValue(date);
    };

    const handleHourSelect = (value: string) => {
        setHour(parseInt(value, 10));
    };

    const handleMinuteSelect = (value: string) => {
        setMinute(parseInt(value, 10));
    };

    return {
        dateValue,
        hour: hour !== null ? String(hour) : undefined,
        minute: minute !== null ? String(minute) : undefined,
        getHourOptions,
        getMinuteOptions,
        handleDateChange,
        handleHourSelect,
        handleMinuteSelect
    };
}
