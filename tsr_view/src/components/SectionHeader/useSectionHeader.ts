import { useState } from 'react';

interface UseSectionHeaderProps {
    onOptionSelect?: (option: string) => void;
}

export function useSectionHeader({ onOptionSelect }: UseSectionHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionSelect = (option: string) => {
        setIsOpen(false);
        onOptionSelect?.(option);
    };

    return {
        isOpen,
        toggleOpen,
        handleOptionSelect
    };
}
