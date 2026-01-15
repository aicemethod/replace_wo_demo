import { FaChevronDown } from 'react-icons/fa';
import { useLookup } from './useLookup';
import type { LookupOption } from './useLookup';
import './Lookup.css'

interface LookupProps {
    options: LookupOption[]
    selected?: string
    onSelect?: (option: string) => void
    placeholder?: string
    label?: string
    subLabel?: string
    disabled?: boolean
}

export default function Lookup({
    options,
    selected,
    onSelect,
    placeholder = '選択してください',
    label,
    subLabel,
    disabled = false
}: LookupProps) {
    const {
        inputValue,
        isOpen,
        dropdownRef,
        filteredOptions,
        getOptionValue,
        getOptionLabel,
        handleInputChange,
        handleSelect,
        handleFocus
    } = useLookup({ options, selected, onSelect, disabled })

    return (
        <div className="lookup-container" ref={dropdownRef}>
            {label && (
                <div className="lookup-label-wrapper">
                    <div className="lookup-label">{label}</div>
                    {subLabel && (
                        <div className="lookup-sub-label">{subLabel}</div>
                    )}
                </div>
            )}
            <div className={`lookup-input-wrapper ${disabled ? 'lookup-disabled' : ''}`}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="lookup-input"
                />
                <div className={`lookup-icon-wrapper ${disabled ? 'lookup-icon-disabled' : ''}`}>
                    <FaChevronDown className="lookup-icon" />
                </div>
            </div>
            <div className={`lookup-dropdown ${isOpen ? 'lookup-dropdown-open' : ''}`}>
                <div className="lookup-dropdown-content">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => {
                            const optionLabel = getOptionLabel(option)
                            const optionValue = getOptionValue(option)
                            return (
                                <button
                                    key={index}
                                    className="lookup-option"
                                    onClick={() => handleSelect(option)}
                                >
                                    {optionLabel ? (
                                        <div>
                                            <div className="lookup-option-label">{optionLabel}</div>
                                            <div className="lookup-option-value">{optionValue}</div>
                                        </div>
                                    ) : (
                                        <div className="lookup-option-text">{optionValue}</div>
                                    )}
                                </button>
                            )
                        })
                    ) : (
                        <div className="lookup-empty">該当する項目がありません</div>
                    )}
                </div>
            </div>
        </div>
    )
}
