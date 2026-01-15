import { useState } from 'react'

interface UseTextAreaProps {
    value?: string;
    onChange?: (value: string) => void;
    maxLength?: number;
}

export function useTextArea({ value, onChange, maxLength }: UseTextAreaProps) {
    const [internalValue, setInternalValue] = useState<string>(value || '');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (maxLength && newValue.length > maxLength) return;
        setInternalValue(newValue);
        onChange?.(newValue);
    }

    const currentValue = value !== undefined ? value : internalValue;
    const currentLength = currentValue.replace(/\n|\r/g, '').length;

    return {
        currentValue,
        currentLength,
        handleChange
    };
}
