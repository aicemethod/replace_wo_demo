import type { ReactNode } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { useSelect } from './useSelect';
import './Select.css';

export type SelectOption = {
  value: string;
  label: string | ReactNode;
};

type SelectProps = {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string, label: string | ReactNode) => void;
  className?: string;
  renderLabel?: (label: string | ReactNode) => ReactNode;
  renderButton?: (label: string | ReactNode, isOpen: boolean) => ReactNode;
  noWrapper?: boolean;
};

// 汎用ドロップダウン選択コンポーネント
function Select({
  options,
  placeholder = '選択してください',
  value,
  onChange,
  className = '',
  renderLabel,
  renderButton,
  noWrapper = false,
}: SelectProps) {
  const {
    isOpen,
    selectedValue,
    selectedLabel,
    dropdownRef,
    buttonRef,
    wrapperRef,
    handleSelect,
    toggleOpen,
  } = useSelect({ options, value, onChange, noWrapper });

  const buttonElement = (
    <button
      ref={noWrapper ? buttonRef : undefined}
      type="button"
      className={`select-button ${className} ${isOpen ? 'open' : ''}`}
      onClick={toggleOpen}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {renderButton ? (
        renderButton(selectedValue ? selectedLabel : placeholder, isOpen)
      ) : (
        <>
          <span className={`select-text ${!selectedValue ? 'placeholder' : ''}`}>
            {selectedValue
              ? renderLabel
                ? renderLabel(selectedLabel)
                : typeof selectedLabel === 'string'
                  ? selectedLabel
                  : selectedLabel
              : placeholder}
          </span>
          <FaChevronDown className={`select-arrow ${isOpen ? 'open' : ''}`} size={12} />
        </>
      )}
    </button>
  );

  const dropdownElement = (
    <div ref={dropdownRef} className={`select-dropdown ${isOpen ? 'open' : ''}`}>
      <div className="select-options">
        {options.map((option) => (
          <button
            key={option.value || 'empty'}
            type="button"
            className={`select-option ${selectedValue === option.value ? 'selected' : ''}`}
            onClick={() => handleSelect(option.value, option.label)}
            role="option"
            aria-selected={selectedValue === option.value}
          >
            {typeof option.label === 'string' ? option.label : option.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (noWrapper) {
    return (
      <>
        {buttonElement}
        {dropdownElement}
      </>
    );
  }

  return (
    <div className={`select ${className}`} ref={wrapperRef}>
      {buttonElement}
      {dropdownElement}
    </div>
  );
}

export default Select;

