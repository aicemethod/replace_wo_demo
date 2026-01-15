import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useSelect } from './useSelect';
import type { SelectOption } from './useSelect';
import './Select.css';

interface SelectProps {
    options: SelectOption[];
    selected?: string;
    onSelect?: (option: string) => void;
    placeholder?: string;
    label?: string;
}

export default function Select({
    options,
    selected,
    onSelect,
    placeholder = '選択してください',
    label
}: SelectProps) {
    const {
        isOpen,
        dropdownRef,
        getOptionValue,
        getOptionLabel,
        handleSelect,
        getDisplayText,
        toggleOpen
    } = useSelect({ options, selected, onSelect, placeholder });

    return (
        <div className="select-container" ref={dropdownRef}>
            {label && (
                <div className="select-label">{label}</div>
            )}
            <button
                className="select-button"
                onClick={toggleOpen}
            >
                <span className="select-button-text">{getDisplayText()}</span>
                {isOpen ? (
                    <FaChevronUp className="select-icon" />
                ) : (
                    <FaChevronDown className="select-icon" />
                )}
            </button>
            <div className={`select-dropdown ${isOpen ? 'select-dropdown-open' : ''}`}>
                <div className="select-dropdown-content">
                    {options.map((option, index) => {
                        const optionLabel = getOptionLabel(option);
                        const optionValue = getOptionValue(option);
                        return (
                            <button
                                key={index}
                                className="select-option"
                                onClick={() => handleSelect(option)}
                            >
                                {optionLabel ? (
                                    <div>
                                        <div className="select-option-label">{optionLabel}</div>
                                        <div className="select-option-value">{optionValue}</div>
                                    </div>
                                ) : (
                                    <div className="select-option-text">{optionValue}</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
