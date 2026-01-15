import { useState } from 'react';

interface UseDateTimePickerProps {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
}

export function useDateTimePicker({ value, onChange }: UseDateTimePickerProps) {
    const [internalValue, setInternalValue] = useState<Date | null>(value || null);

    const handleChange = (date: Date | null) => {
        setInternalValue(date);
        onChange?.(date);
    };

    const currentValue = value !== undefined ? value : internalValue;

    return {
        currentValue,
        handleChange
    };
}
