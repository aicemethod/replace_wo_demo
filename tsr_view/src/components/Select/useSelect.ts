import { useState, useEffect, useRef } from 'react'

export type SelectOption = string | { label?: string; value: string }

interface UseSelectProps {
    options: SelectOption[];
    selected?: string;
    onSelect?: (option: string) => void;
    placeholder?: string;
}

export function useSelect({ options, selected, onSelect, placeholder = '選択してください' }: UseSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [internalSelected, setInternalSelected] = useState<string>(selected || placeholder);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const getOptionValue = (option: SelectOption): string => {
        return typeof option === 'string' ? option : option.value;
    }

    const getOptionLabel = (option: SelectOption): string | undefined => {
        return typeof option === 'string' ? undefined : option.label;
    }

    const handleSelect = (option: SelectOption) => {
        const value = getOptionValue(option);
        setInternalSelected(value);
        setIsOpen(false);
        onSelect?.(value);
    }

    const currentSelected = selected !== undefined ? selected : internalSelected;

    const getDisplayText = (): string => {
        if (currentSelected === placeholder) return placeholder;
        const option = options.find(opt => getOptionValue(opt) === currentSelected);
        if (!option) return String(currentSelected);
        const label = getOptionLabel(option);
        const value = getOptionValue(option);
        return label ? `${label}: ${value}` : value;
    }

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    }

    return {
        isOpen,
        dropdownRef,
        getOptionValue,
        getOptionLabel,
        handleSelect,
        getDisplayText,
        toggleOpen
    };
}
